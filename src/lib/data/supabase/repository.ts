import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import { createPixCharge, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { DomainError } from "@/lib/meets/rules";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Gender, Meet, MeetGuest, MeetView, Payment, Perk, Profile, Venue, VenueCategory } from "@/lib/types";
import type { DartfyRepository } from "../repository";

/**
 * Repositório Supabase (schema "dartfy").
 * Leituras passam pelo RLS como o usuário logado; escritas usam as funções SQL dartfy.*
 * (que reforçam as regras de negócio no banco). Só o Pix/webhook usa a chave secreta.
 */

// ── Linhas do banco ────────────────────────────────────────────────
type ProfileRow = { id: string; name: string; phone: string | null; email: string | null; gender: Gender | null; birth_date: string | null };
type PerkRow = { id: string; venue_id: string; title: string; description: string; valid_weekdays: number[]; daily_limit: number; sort_order: number };
type VenueRow = {
  id: string; slug: string; name: string; category: VenueCategory; address: string; neighborhood: string; city: string;
  tone_from: string; tone_to: string; logo_path: string | null; opening_hours: string; phone: string | null; website: string | null;
  lat: number; lng: number; perks?: PerkRow[];
};
type GuestRow = { user_id: string; role: MeetGuest["role"]; status: MeetGuest["status"]; responded_at: string | null; checked_in_at: string | null; profile?: ProfileRow | null };
type PaymentRow = { id: string; meet_id: string; amount_cents: number; people: number; status: Payment["status"]; pix_copy_paste: string | null; external_id: string | null; created_at: string; paid_at: string | null };
type MeetRow = {
  id: string; code: string; host_id: string; venue_id: string; starts_at: string; message: string | null; status: Meet["status"]; created_at: string;
  venue?: VenueRow | null; host?: ProfileRow | null; guests?: GuestRow[]; payments?: PaymentRow[];
};

const MEET_SELECT = "*, venue:venues(*, perks(*)), host:profiles(*), guests:meet_guests(*, profile:profiles(*)), payments(*)";

// ── Mapeamento ─────────────────────────────────────────────────────
const toProfile = (r: ProfileRow): Profile => ({
  id: r.id, name: r.name, phone: r.phone ?? "", email: r.email, gender: r.gender, birthDate: r.birth_date,
});

const toPerk = (r: PerkRow): Perk => ({
  id: r.id, venueId: r.venue_id, title: r.title, description: r.description,
  validWeekdays: r.valid_weekdays ?? [], remainingToday: r.daily_limit,
});

function logoUrl(path: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${path.replace(/^\/+/, "")}`;
}

const toVenue = (r: VenueRow, perks: PerkRow[] = r.perks ?? []): Venue => ({
  id: r.id, slug: r.slug, name: r.name, category: r.category, address: r.address, neighborhood: r.neighborhood, city: r.city,
  tone: [r.tone_from, r.tone_to], logoUrl: logoUrl(r.logo_path), openingHours: r.opening_hours, phone: r.phone, website: r.website,
  lat: r.lat, lng: r.lng,
  perks: [...perks].sort((a, b) => a.sort_order - b.sort_order).map(toPerk),
});

const toPayment = (r: PaymentRow): Payment => ({
  id: r.id, meetId: r.meet_id, amountCents: r.amount_cents, people: r.people, status: r.status,
  pixCopyPaste: r.pix_copy_paste ?? "", createdAt: r.created_at, paidAt: r.paid_at,
});

const toGuest = (g: GuestRow): MeetGuest => ({
  userId: g.user_id, role: g.role, status: g.status, respondedAt: g.responded_at, checkedInAt: g.checked_in_at,
});

const toMeet = (r: MeetRow): Meet => ({
  id: r.id, code: r.code, hostId: r.host_id, venueId: r.venue_id, startsAt: r.starts_at, message: r.message, status: r.status,
  createdAt: r.created_at, guests: (r.guests ?? []).map(toGuest),
});

function toView(r: MeetRow): MeetView | null {
  if (!r.venue || !r.host) return null;
  const people = (r.guests ?? [])
    .filter((g) => g.profile)
    .map((g) => ({ ...toGuest(g), profile: toProfile(g.profile!) }));
  const payment = [...(r.payments ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  return { ...toMeet(r), venue: toVenue(r.venue), host: toProfile(r.host), people, payment: payment ? toPayment(payment) : null };
}

/** Mensagens das funções SQL (errcode P0001) já vêm prontas para o usuário. */
function fail(error: PostgrestError): never {
  if (error.code === "P0001") throw new DomainError(error.message);
  if (error.code === "28000") throw new DomainError("Sua sessão expirou. Entre novamente.");
  throw new Error(`[supabase] ${error.code ?? ""} ${error.message}`);
}

// ── Convite público (quem ainda não está na lista não enxerga o meet pelo RLS) ──
type InviteJson = {
  meet: Omit<MeetRow, "host_id">;
  host: { id: string; name: string };
  venue: VenueRow;
  perks: PerkRow[];
  going: Array<{ id: string; name: string }>;
};

function inviteToView(j: InviteJson): MeetView {
  const host: Profile = { id: j.host.id, name: j.host.name, phone: "", email: null, gender: null, birthDate: null };
  const guests: MeetGuest[] = j.going.map((p) => ({
    userId: p.id,
    role: p.id === host.id ? "host" : "guest",
    status: "accepted",
    respondedAt: null,
    checkedInAt: null,
  }));
  const people = guests.map((g, i) => ({
    ...g,
    profile: { id: g.userId, name: j.going[i].name, phone: "", email: null, gender: null, birthDate: null },
  }));
  return {
    id: j.meet.id, code: j.meet.code, hostId: host.id, venueId: j.meet.venue_id, startsAt: j.meet.starts_at, message: j.meet.message,
    status: j.meet.status, createdAt: j.meet.created_at, guests,
    venue: toVenue(j.venue, j.perks), host, people, payment: null,
  };
}

/** Gera o Pix no Mercado Pago para um pagamento pendente que ainda não tem QR. */
async function attachPix(payment: PaymentRow, payerEmail: string | null, description: string): Promise<PaymentRow> {
  if (payment.pix_copy_paste || payment.status !== "pending" || !isMercadoPagoConfigured) return payment;
  const charge = await createPixCharge({
    idempotencyKey: payment.id,
    amountCents: payment.amount_cents,
    description,
    payerEmail: payerEmail ?? "pagador@dartfy.app",
    externalReference: payment.id,
  });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("payments")
    .update({ external_id: charge.id, pix_copy_paste: charge.copyPaste, raw: charge.raw })
    .eq("id", payment.id)
    .select()
    .single<PaymentRow>();
  if (error) fail(error);
  return data;
}

export const supabaseRepository: DartfyRepository = {
  async getProfile(userId) {
    const db = await createClient();
    const { data, error } = await db.from("profiles").select("*").eq("id", userId).maybeSingle<ProfileRow>();
    if (error) fail(error);
    return data ? toProfile(data) : null;
  },

  async updateProfile(userId, patch) {
    const db = await createClient();
    const { data, error } = await db
      .from("profiles")
      .update({ name: patch.name, email: patch.email, gender: patch.gender, birth_date: patch.birthDate })
      .eq("id", userId)
      .select()
      .single<ProfileRow>();
    if (error) fail(error);
    return toProfile(data);
  },

  async listVenues() {
    const db = await createClient();
    const { data, error } = await db.from("venues").select("*, perks(*)").order("name").returns<VenueRow[]>();
    if (error) fail(error);
    return data.map((v) => toVenue(v));
  },

  async getVenue(venueId) {
    const db = await createClient();
    const { data, error } = await db.from("venues").select("*, perks(*)").eq("id", venueId).maybeSingle<VenueRow>();
    if (error) {
      if (error.code === "22P02") return null; // id inválido
      fail(error);
    }
    return data ? toVenue(data) : null;
  },

  async getMeet(meetId) {
    const db = await createClient();
    const { data, error } = await db.from("meets").select(MEET_SELECT).eq("id", meetId).maybeSingle<MeetRow>();
    if (error) {
      if (error.code === "22P02") return null;
      fail(error);
    }
    return data ? toView(data) : null;
  },

  async getMeetByCode(code) {
    const db = await createClient();
    const { data, error } = await db.from("meets").select(MEET_SELECT).eq("code", code.toLowerCase()).maybeSingle<MeetRow>();
    if (error) fail(error);
    if (data) return toView(data);
    // Ainda não participa: dados públicos do convite.
    const rpc = await db.rpc("get_invite", { p_code: code });
    if (rpc.error) fail(rpc.error);
    return rpc.data ? inviteToView(rpc.data as InviteJson) : null;
  },

  async listMeetsForUser(userId) {
    const db = await createClient();
    const { data: mine, error: e1 } = await db.from("meet_guests").select("meet_id").eq("user_id", userId).returns<{ meet_id: string }[]>();
    if (e1) fail(e1);
    if (!mine.length) return [];
    const { data, error } = await db
      .from("meets")
      .select(MEET_SELECT)
      .in("id", mine.map((m) => m.meet_id))
      .order("starts_at")
      .returns<MeetRow[]>();
    if (error) fail(error);
    return data.map(toView).filter((m): m is MeetView => m !== null);
  },

  async createMeet({ venueId, startsAt, message }) {
    const db = await createClient();
    const { data, error } = await db.rpc("create_meet", { p_venue: venueId, p_starts_at: startsAt, p_message: message });
    if (error) {
      if (error.code === "22P02") throw new DomainError("Escolha um local.", "venueId");
      fail(error);
    }
    return toMeet(data as MeetRow);
  },

  async cancelMeet(meetId) {
    const db = await createClient();
    const { error } = await db.rpc("cancel_meet", { p_meet: meetId });
    if (error) fail(error);
  },

  async markInviteSeen(code) {
    const db = await createClient();
    const { error } = await db.rpc("mark_invite_seen", { p_code: code });
    if (error) fail(error);
  },

  async respondInvite(code, _userId, accept) {
    const db = await createClient();
    const { error } = await db.rpc("respond_invite", { p_code: code, p_accept: accept });
    if (error) fail(error);
  },

  async closeMeet(meetId, hostId) {
    const db = await createClient();
    const { data, error } = await db.rpc("close_meet", { p_meet: meetId });
    if (error) fail(error);
    const payment = data as PaymentRow;
    if (payment.pix_copy_paste) return toPayment(payment);

    const [host, meet] = await Promise.all([
      supabaseRepository.getProfile(hostId),
      db.from("meets").select("code, venue:venues(name)").eq("id", meetId).single<{ code: string; venue: { name: string } | null }>(),
    ]);
    const description = `Dartfy · Meet ${meet.data?.code ?? ""} · ${meet.data?.venue?.name ?? ""}`.trim();
    try {
      return toPayment(await attachPix(payment, host?.email ?? null, description));
    } catch (e) {
      // A lista já está fechada; a tela de pagamento tenta gerar o Pix de novo.
      console.error(e);
      return toPayment(payment);
    }
  },

  async confirmPayment(paymentId) {
    const admin = createAdminClient();
    const { data, error } = await admin.from("payments").select("external_id").eq("id", paymentId).maybeSingle<{ external_id: string | null }>();
    if (error) fail(error);
    if (!data?.external_id) throw new DomainError("Pagamento não encontrado.");
    const res = await admin.rpc("confirm_payment", { p_external_id: data.external_id });
    if (res.error) fail(res.error);
  },

  async checkIn(meetId) {
    const db = await createClient();
    const { error } = await db.rpc("check_in", { p_meet: meetId });
    if (error) fail(error);
  },
};
