-- ════════════════════════════════════════════════════════════════════
--  DARTFY — Permissões do servidor + bares iniciais (piloto Curitiba)
--  Rode DEPOIS de 20261106120000_dartfy_core.sql. Pode rodar mais de uma vez.
-- ════════════════════════════════════════════════════════════════════

-- O servidor (chave secreta) grava o Pix gerado no Mercado Pago e confirma pagamentos.
grant usage on schema dartfy to service_role;
grant all on all tables in schema dartfy to service_role;
grant usage, select on all sequences in schema dartfy to service_role;
alter default privileges in schema dartfy grant all on tables to service_role;

-- ── Bares parceiros e cortesias ─────────────────────────────────────
insert into dartfy.venues (slug, name, category, address, neighborhood, city, tone_from, tone_to, opening_hours, phone, lat, lng) values
  ('dart-night',        'Dart Night',        'bar',         'Pça. Santos Andrade, 50', 'Centro',       'Curitiba', '#ff2bd6', '#4f46e5', 'Ter a dom · 18h às 2h',      '41988887777', -25.4296, -49.2625),
  ('dartfy-back',       'Dartfy Back',       'pub',         'Shopping Müller, piso L2', 'Centro',      'Curitiba', '#b91c1c', '#f97316', 'Todos os dias · 12h às 23h', null,          -25.4249, -49.2672),
  ('cloud-bar',         'Cloud Bar',         'bar',         'R. das Nuvens, 344',      'Mercês',       'Curitiba', '#38bdf8', '#818cf8', 'Qua a sáb · 19h à 1h',       null,          -25.4234, -49.2857),
  ('bodega-espanha',    'Bodega da Espanha', 'bar',         'Praça da Espanha, 12',    'Batel',        'Curitiba', '#f59e0b', '#e11d48', 'Ter a dom · 17h à 0h',       null,          -25.4391, -49.2858),
  ('emporio-itupava',   'Empório Itupava',   'pub',         'R. Itupava, 1100',        'Alto da XV',   'Curitiba', '#22c55e', '#0ea5e9', 'Seg a sáb · 16h à 0h',       null,          -25.4219, -49.2488),
  ('seu-frutos-do-mar', 'Seu Frutos do Mar', 'restaurante', 'Av. Mateus Leme, 2200',   'São Lourenço', 'Curitiba', '#06b6d4', '#2563eb', 'Ter a dom · 11h às 23h',     null,          -25.3933, -49.2678)
on conflict (slug) do nothing;

insert into dartfy.perks (venue_id, title, description, valid_weekdays, daily_limit, sort_order)
select v.id, p.title, p.description, p.days::smallint[], p.daily_limit, p.sort_order
from (values
  ('dart-night',        'Compre um chopp, ganhe outro',   'Chopp pilsen 300 ml, um por pessoa confirmada.', '{0,2,3,4}',       18, 0),
  ('dart-night',        'Partida de dardos grátis',       '1 partida para a mesa.',                         '{0,1,2,3,4,5,6}',  6, 1),
  ('dartfy-back',       'Porção de fritas na mesa',       'Para grupos a partir de 3 pessoas.',             '{0,1,2,3,4,5,6}',  9, 0),
  ('cloud-bar',         'Drink de boas-vindas',           'Gin tônica da casa para cada pessoa.',           '{3,4,5,6}',       24, 0),
  ('bodega-espanha',    'Taça de sangria',                'Uma taça por pessoa confirmada.',                '{2,3,4,5}',       12, 0),
  ('emporio-itupava',   'Chopp artesanal 300 ml',         'IPA ou Lager da casa, um por pessoa.',           '{0,1,2,3,4,5,6}', 30, 0),
  ('seu-frutos-do-mar', 'Entrada de bolinho de bacalhau', 'Porção com 6 unidades para a mesa.',             '{2,3,4}',         10, 0)
) as p(slug, title, description, days, daily_limit, sort_order)
join dartfy.venues v on v.slug = p.slug
where not exists (select 1 from dartfy.perks x where x.venue_id = v.id and x.title = p.title);
