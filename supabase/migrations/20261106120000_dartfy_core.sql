-- ════════════════════════════════════════════════════════════════════
--  DARTFY — Núcleo (perfis, bares, cortesias, meets, pagamentos)
--  Schema "dartfy" (mesmo padrão do Iterum: schema próprio por app).
--
--  Princípios:
--   • Toda regra que vale dinheiro (cortesia, preço, check-in) é verificada
--     no banco, em funções SECURITY DEFINER — nunca só na interface.
--   • Tabelas com RLS ligado; escrita direta bloqueada para meets/convidados/
--     pagamentos: o app chama as funções dartfy.* abaixo.
--   • Funções internas ficam em "dartfy_private" (schema NÃO exposto na API).
--   • Espelha src/lib/meets/rules.ts e src/config/site.ts.
-- ════════════════════════════════════════════════════════════════════

create schema if not exists dartfy;
create schema if not exists dartfy_private;

grant usage on schema dartfy to anon, authenticated, service_role;
grant usage on schema dartfy_private to authenticated, service_role;

-- ── Tipos ───────────────────────────────────────────────────────────
create type dartfy.gender         as enum ('feminino', 'masculino', 'outro', 'prefiro_nao_dizer');
create type dartfy.venue_category as enum ('bar', 'pub', 'restaurante', 'cafe', 'balad');
create type dartfy.meet_status    as enum ('open', 'closed', 'paid', 'finished', 'cancelled');
create type dartfy.guest_status   as enum ('invited', 'accepted', 'declined', 'checked_in');
create type dartfy.guest_role     as enum ('host', 'guest');
create type dartfy.payment_status as enum ('pending', 'approved', 'expired', 'refunded');

-- ── Configuração comercial (uma linha) ─────────────────────────────
create table dartfy.settings (
  id                           boolean primary key default true check (id),
  base_price_cents             int not null default 499,
  included_people              int not null default 5,
  extra_person_cents           int not null default 100,
  guest_create_cooldown_hours  int not null default 24,
  max_people                   int not null default 20,
  min_lead_minutes             int not null default 30,
  checkin_opens_minutes_before int not null default 60,
  checkin_radius_meters        int not null default 150
);
insert into dartfy.settings default values;

-- ── Utilitários ────────────────────────────────────────────────────
create function dartfy_private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Perfis ─────────────────────────────────────────────────────────
create table dartfy.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '' check (char_length(name) <= 80),
  -- Login é por e-mail e senha; o celular (WhatsApp) vem do cadastro.
  phone       text unique check (phone is null or phone ~ '^[1-9]{2}9[0-9]{8}$'),
  email       text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  gender      dartfy.gender,
  birth_date  date check (birth_date is null or birth_date <= (current_date - interval '18 years')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated_at before update on dartfy.profiles
  for each row execute function dartfy_private.set_updated_at();

-- Cria o perfil no cadastro (e-mail e senha). Nome, celular e nascimento vêm de
-- signUp → options.data no formulário "Criar conta".
create function dartfy_private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into dartfy.profiles (id, email, name, phone, birth_date)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\D', '', 'g'), ''),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created_dartfy after insert on auth.users
  for each row execute function dartfy_private.handle_new_user();

-- ── Estabelecimentos e cortesias ───────────────────────────────────
create table dartfy.venues (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  category       dartfy.venue_category not null default 'bar',
  address        text not null,
  neighborhood   text not null,
  city           text not null default 'Curitiba',
  tone_from      text not null default '#ff2bd6',
  tone_to        text not null default '#5b7cfa',
  logo_path      text,
  opening_hours  text not null default '',
  phone          text,
  website        text,
  lat            double precision not null,
  lng            double precision not null,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index venues_active_idx on dartfy.venues (is_active, neighborhood);
create trigger venues_updated_at before update on dartfy.venues
  for each row execute function dartfy_private.set_updated_at();

create table dartfy.perks (
  id              uuid primary key default gen_random_uuid(),
  venue_id        uuid not null references dartfy.venues (id) on delete cascade,
  title           text not null,
  description     text not null default '',
  valid_weekdays  smallint[] not null default '{0,1,2,3,4,5,6}',
  daily_limit     int not null default 20 check (daily_limit >= 0), -- "controle deslizante" do painel do bar
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);
create index perks_venue_idx on dartfy.perks (venue_id) where is_active;

-- ── Meets ──────────────────────────────────────────────────────────
create table dartfy.meets (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[a-z0-9]{6,12}$'),
  host_id     uuid not null references dartfy.profiles (id),
  venue_id    uuid not null references dartfy.venues (id),
  starts_at   timestamptz not null,
  message     text check (char_length(message) <= 140),
  status      dartfy.meet_status not null default 'open',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index meets_host_idx on dartfy.meets (host_id, starts_at desc);
create index meets_venue_day_idx on dartfy.meets (venue_id, starts_at);
create trigger meets_updated_at before update on dartfy.meets
  for each row execute function dartfy_private.set_updated_at();

create table dartfy.meet_guests (
  meet_id        uuid not null references dartfy.meets (id) on delete cascade,
  user_id        uuid not null references dartfy.profiles (id) on delete cascade,
  role           dartfy.guest_role not null default 'guest',
  status         dartfy.guest_status not null default 'invited',
  responded_at   timestamptz,
  checked_in_at  timestamptz,
  created_at     timestamptz not null default now(),
  primary key (meet_id, user_id)
);
create index meet_guests_user_idx on dartfy.meet_guests (user_id, responded_at desc);

create table dartfy.payments (
  id              uuid primary key default gen_random_uuid(),
  meet_id         uuid not null references dartfy.meets (id) on delete cascade,
  amount_cents    int not null check (amount_cents > 0),
  people          int not null check (people > 0),
  status          dartfy.payment_status not null default 'pending',
  provider        text not null default 'mercado_pago',
  external_id     text unique,
  pix_copy_paste  text,
  raw             jsonb,
  created_at      timestamptz not null default now(),
  paid_at         timestamptz
);
create index payments_meet_idx on dartfy.payments (meet_id, created_at desc);

-- Embaixadores (15% do saldo após deduções — pitch deck, seção 05). Estrutura pronta para a fase 2.
create table dartfy.ambassadors (
  user_id     uuid primary key references dartfy.profiles (id) on delete cascade,
  share_bps   int not null default 1500 check (share_bps between 0 and 10000),
  created_at  timestamptz not null default now()
);
create table dartfy.venue_ambassadors (
  venue_id       uuid primary key references dartfy.venues (id) on delete cascade,
  ambassador_id  uuid not null references dartfy.ambassadors (user_id)
);

-- ── RLS ────────────────────────────────────────────────────────────
alter table dartfy.settings          enable row level security;
alter table dartfy.profiles          enable row level security;
alter table dartfy.venues            enable row level security;
alter table dartfy.perks             enable row level security;
alter table dartfy.meets             enable row level security;
alter table dartfy.meet_guests       enable row level security;
alter table dartfy.payments          enable row level security;
alter table dartfy.ambassadors       enable row level security;
alter table dartfy.venue_ambassadors enable row level security;

create function dartfy_private.is_participant(p_meet uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from dartfy.meet_guests g where g.meet_id = p_meet and g.user_id = (select auth.uid()));
$$;

create function dartfy_private.shares_meet(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from dartfy.meet_guests a join dartfy.meet_guests b on a.meet_id = b.meet_id
    where a.user_id = (select auth.uid()) and b.user_id = p_user
  );
$$;

create policy settings_read on dartfy.settings for select to anon, authenticated using (true);

-- Perfil: o próprio usuário, ou quem está no mesmo meet (para ver nome na lista).
create policy profiles_read on dartfy.profiles for select to authenticated
  using (id = (select auth.uid()) or dartfy_private.shares_meet(id));
create policy profiles_update_self on dartfy.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy venues_read on dartfy.venues for select to anon, authenticated using (is_active);
create policy perks_read  on dartfy.perks  for select to anon, authenticated using (is_active);

create policy meets_read on dartfy.meets for select to authenticated
  using (dartfy_private.is_participant(id));
create policy guests_read on dartfy.meet_guests for select to authenticated
  using (dartfy_private.is_participant(meet_id));
create policy payments_read on dartfy.payments for select to authenticated
  using (exists (select 1 from dartfy.meets m where m.id = meet_id and m.host_id = (select auth.uid())));

grant select on all tables in schema dartfy to anon, authenticated;
grant update (name, email, gender, birth_date) on dartfy.profiles to authenticated;

-- ── Funções de negócio (chamadas via supabase.rpc) ─────────────────

/** Convite público por código (página /c/[code]), inclusive para quem não está logado. */
create function dartfy.get_invite(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'meet', to_jsonb(m) - 'host_id',
    'host', jsonb_build_object('id', h.id, 'name', h.name),
    'venue', to_jsonb(v),
    'perks', coalesce((select jsonb_agg(to_jsonb(p) order by p.sort_order) from dartfy.perks p where p.venue_id = v.id and p.is_active), '[]'),
    'going', coalesce((
      select jsonb_agg(jsonb_build_object('id', pr.id, 'name', pr.name) order by g.responded_at)
      from dartfy.meet_guests g join dartfy.profiles pr on pr.id = g.user_id
      where g.meet_id = m.id and g.status in ('accepted', 'checked_in')
    ), '[]')
  )
  from dartfy.meets m
  join dartfy.profiles h on h.id = m.host_id
  join dartfy.venues v on v.id = m.venue_id
  where m.code = lower(p_code);
$$;
grant execute on function dartfy.get_invite(text) to anon, authenticated;

create function dartfy.create_meet(p_venue uuid, p_starts_at timestamptz, p_message text default null) returns dartfy.meets
language plpgsql security definer set search_path = '' as $$
declare
  s dartfy.settings;
  uid uuid := auth.uid();
  v_code text;
  v_meet dartfy.meets;
  v_last timestamptz;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into s from dartfy.settings;

  if not exists (select 1 from dartfy.venues where id = p_venue and is_active) then
    raise exception 'Escolha um local.' using errcode = 'P0001';
  end if;
  if p_starts_at < now() + make_interval(mins => s.min_lead_minutes) then
    raise exception 'Marque com pelo menos % minutos de antecedência.', s.min_lead_minutes using errcode = 'P0001';
  end if;
  if p_starts_at > now() + interval '60 days' then
    raise exception 'Marque para os próximos 60 dias.' using errcode = 'P0001';
  end if;

  -- Antifraude: aceitou convite nas últimas X horas → não cria.
  select max(g.responded_at) into v_last
  from dartfy.meet_guests g join dartfy.meets m on m.id = g.meet_id
  where g.user_id = uid and g.role = 'guest' and g.status in ('accepted', 'checked_in') and m.status <> 'cancelled';
  if v_last is not null and v_last > now() - make_interval(hours => s.guest_create_cooldown_hours) then
    raise exception 'Você confirmou presença em um meet recentemente. Poderá criar o seu a partir de %.',
      to_char((v_last + make_interval(hours => s.guest_create_cooldown_hours)) at time zone 'America/Sao_Paulo', 'HH24:MI')
      using errcode = 'P0001';
  end if;

  loop
    v_code := substr(translate(encode(extensions.gen_random_bytes(8), 'base64'), '+/=01ilo', ''), 1, 7);
    v_code := lower(v_code);
    exit when length(v_code) = 7 and not exists (select 1 from dartfy.meets where code = v_code);
  end loop;

  insert into dartfy.meets (code, host_id, venue_id, starts_at, message)
  values (v_code, uid, p_venue, p_starts_at, nullif(btrim(p_message), ''))
  returning * into v_meet;

  insert into dartfy.meet_guests (meet_id, user_id, role, status, responded_at)
  values (v_meet.id, uid, 'host', 'accepted', now());

  return v_meet;
end;
$$;
grant execute on function dartfy.create_meet(uuid, timestamptz, text) to authenticated;

create function dartfy.mark_invite_seen(p_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare m dartfy.meets;
begin
  select * into m from dartfy.meets where code = lower(p_code);
  if m.id is null or m.status <> 'open' or auth.uid() is null then return; end if;
  insert into dartfy.meet_guests (meet_id, user_id) values (m.id, auth.uid()) on conflict do nothing;
end;
$$;
grant execute on function dartfy.mark_invite_seen(text) to authenticated;

create function dartfy.respond_invite(p_code text, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare
  s dartfy.settings;
  m dartfy.meets;
  uid uuid := auth.uid();
  going int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into s from dartfy.settings;
  select * into m from dartfy.meets where code = lower(p_code) for update;
  if m.id is null then raise exception 'Convite não encontrado.' using errcode = 'P0001'; end if;
  if m.host_id = uid then raise exception 'Você é o anfitrião deste meet.' using errcode = 'P0001'; end if;
  if m.status = 'cancelled' then raise exception 'Este meet foi cancelado pelo anfitrião.' using errcode = 'P0001'; end if;
  if m.status <> 'open' then raise exception 'O anfitrião já fechou a lista deste meet.' using errcode = 'P0001'; end if;
  if m.starts_at <= now() then raise exception 'Este meet já começou.' using errcode = 'P0001'; end if;

  if p_accept then
    select count(*) into going from dartfy.meet_guests where meet_id = m.id and status in ('accepted', 'checked_in');
    if going >= s.max_people then raise exception 'A lista está cheia.' using errcode = 'P0001'; end if;
  end if;

  insert into dartfy.meet_guests (meet_id, user_id, status, responded_at)
  values (m.id, uid, case when p_accept then 'accepted' else 'declined' end::dartfy.guest_status, now())
  on conflict (meet_id, user_id) do update set status = excluded.status, responded_at = excluded.responded_at;
end;
$$;
grant execute on function dartfy.respond_invite(text, boolean) to authenticated;

/** Fecha a lista e registra a cobrança. O Pix em si é criado pelo servidor (Mercado Pago) e gravado em payments. */
create function dartfy.close_meet(p_meet uuid) returns dartfy.payments
language plpgsql security definer set search_path = '' as $$
declare
  s dartfy.settings;
  m dartfy.meets;
  n int;
  p dartfy.payments;
begin
  select * into s from dartfy.settings;
  select * into m from dartfy.meets where id = p_meet for update;
  if m.id is null or m.host_id <> auth.uid() then raise exception 'Só o anfitrião pode fechar a lista.' using errcode = 'P0001'; end if;

  if m.status = 'closed' then
    select * into p from dartfy.payments where meet_id = m.id and status = 'pending' order by created_at desc limit 1;
    if p.id is not null then return p; end if;
  end if;
  if m.status <> 'open' then raise exception 'A lista deste meet já foi fechada.' using errcode = 'P0001'; end if;

  select count(*) into n from dartfy.meet_guests where meet_id = m.id and status in ('accepted', 'checked_in');
  if n < 2 then raise exception 'Espere pelo menos um convidado confirmar antes de fechar a lista.' using errcode = 'P0001'; end if;

  delete from dartfy.meet_guests where meet_id = m.id and status = 'invited';
  update dartfy.meets set status = 'closed' where id = m.id;

  insert into dartfy.payments (meet_id, amount_cents, people)
  values (m.id, s.base_price_cents + greatest(0, n - s.included_people) * s.extra_person_cents, n)
  returning * into p;
  return p;
end;
$$;
grant execute on function dartfy.close_meet(uuid) to authenticated;

create function dartfy.cancel_meet(p_meet uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update dartfy.meets set status = 'cancelled'
  where id = p_meet and host_id = auth.uid() and status in ('open', 'closed');
  if not found then raise exception 'Este meet não pode mais ser cancelado.' using errcode = 'P0001'; end if;
end;
$$;
grant execute on function dartfy.cancel_meet(uuid) to authenticated;

/** Somente service_role (webhook do Mercado Pago, já com assinatura validada no servidor). */
create function dartfy.confirm_payment(p_external_id text) returns void
language plpgsql security definer set search_path = '' as $$
declare p dartfy.payments;
begin
  update dartfy.payments set status = 'approved', paid_at = now()
  where external_id = p_external_id and status = 'pending'
  returning * into p;
  if p.id is null then return; end if; -- idempotente
  update dartfy.meets set status = 'paid' where id = p.meet_id and status = 'closed';
end;
$$;
revoke execute on function dartfy.confirm_payment(text) from public, anon, authenticated;
grant execute on function dartfy.confirm_payment(text) to service_role;

create function dartfy.check_in(p_meet uuid, p_lat double precision default null, p_lng double precision default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  s dartfy.settings;
  m dartfy.meets;
  v dartfy.venues;
  g dartfy.meet_guests;
  dist double precision;
begin
  select * into s from dartfy.settings;
  select * into m from dartfy.meets where id = p_meet;
  select * into g from dartfy.meet_guests where meet_id = p_meet and user_id = auth.uid() for update;
  if g.user_id is null or g.status not in ('accepted', 'checked_in') then raise exception 'Você não está na lista deste meet.' using errcode = 'P0001'; end if;
  if g.status = 'checked_in' then return; end if;
  if m.status <> 'paid' then raise exception 'As cortesias são liberadas quando o anfitrião confirma o meet.' using errcode = 'P0001'; end if;
  if now() < m.starts_at - make_interval(mins => s.checkin_opens_minutes_before) then
    raise exception 'O check-in abre % minutos antes do horário marcado.', s.checkin_opens_minutes_before using errcode = 'P0001';
  end if;
  if now() > m.starts_at + interval '6 hours' then raise exception 'O período de check-in deste meet terminou.' using errcode = 'P0001'; end if;

  -- Geolocalização (haversine simplificado). Obrigatória quando o app enviar coordenadas.
  if p_lat is not null and p_lng is not null then
    select * into v from dartfy.venues where id = m.venue_id;
    dist := 6371000 * 2 * asin(sqrt(
      power(sin(radians(p_lat - v.lat) / 2), 2) + cos(radians(v.lat)) * cos(radians(p_lat)) * power(sin(radians(p_lng - v.lng) / 2), 2)
    ));
    if dist > s.checkin_radius_meters then
      raise exception 'Você precisa estar no estabelecimento para fazer o check-in.' using errcode = 'P0001';
    end if;
  end if;

  update dartfy.meet_guests set status = 'checked_in', checked_in_at = now()
  where meet_id = p_meet and user_id = auth.uid();
end;
$$;
grant execute on function dartfy.check_in(uuid, double precision, double precision) to authenticated;
