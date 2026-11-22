import "server-only";
import { rules as cfg } from "@/config/site";
import { meetPriceCents } from "@/lib/pricing";
import {
  checkinBlockReason,
  createCooldownUntil,
  DomainError,
  guestOf,
  joinBlockReason,
  newInviteCode,
  peopleCount,
  validateStartsAt,
} from "@/lib/meets/rules";
import type { Meet, MeetView, Payment } from "@/lib/types";
import type { DartfyRepository } from "../repository";
import { buildSeed } from "./seed";

/**
 * Repositório em memória para o modo demo.
 * Os dados vivem enquanto o processo do servidor estiver de pé (reiniciar = seed novo).
 * Guardado em globalThis para sobreviver ao hot reload do `next dev`.
 */
type Store = ReturnType<typeof buildSeed>;
const g = globalThis as unknown as { __dartfyDemo?: Store };
const db = (): Store => (g.__dartfyDemo ??= buildSeed());

const now = () => new Date();
const clone = <T>(v: T): T => structuredClone(v);

function view(meet: Meet): MeetView {
  const s = db();
  const venue = s.venues.find((v) => v.id === meet.venueId);
  const host = s.profiles.find((p) => p.id === meet.hostId);
  if (!venue || !host) throw new Error(`Meet ${meet.id} com relações inválidas`);
  const people = meet.guests
    .map((guest) => {
      const profile = s.profiles.find((p) => p.id === guest.userId);
      return profile ? { ...guest, profile } : null;
    })
    .filter((x) => x !== null);
  const payment = [...s.payments].reverse().find((p) => p.meetId === meet.id) ?? null;
  return clone({ ...meet, venue, host, people, payment });
}

function findMeet(meetId: string) {
  const m = db().meets.find((x) => x.id === meetId);
  if (!m) throw new DomainError("Meet não encontrado.");
  return m;
}

function findMeetByCode(code: string) {
  const m = db().meets.find((x) => x.code === code.toLowerCase());
  if (!m) throw new DomainError("Convite não encontrado.");
  return m;
}

export const demoRepository: DartfyRepository = {
  async getProfile(userId) {
    return clone(db().profiles.find((p) => p.id === userId) ?? null);
  },

  async updateProfile(userId, patch) {
    const p = db().profiles.find((x) => x.id === userId);
    if (!p) throw new DomainError("Perfil não encontrado.");
    Object.assign(p, patch);
    return clone(p);
  },

  async listVenues() {
    return clone(db().venues);
  },

  async getVenue(venueId) {
    return clone(db().venues.find((v) => v.id === venueId) ?? null);
  },

  async getMeet(meetId) {
    const m = db().meets.find((x) => x.id === meetId);
    return m ? view(m) : null;
  },

  async getMeetByCode(code) {
    const m = db().meets.find((x) => x.code === code.toLowerCase());
    return m ? view(m) : null;
  },

  async listMeetsForUser(userId) {
    return db()
      .meets.filter((m) => m.guests.some((x) => x.userId === userId))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map(view);
  },

  async createMeet({ hostId, venueId, startsAt, message }) {
    const s = db();
    const venue = s.venues.find((v) => v.id === venueId);
    if (!venue) throw new DomainError("Escolha um local.", "venueId");
    validateStartsAt(new Date(startsAt));

    const mine = s.meets.filter((m) => m.guests.some((x) => x.userId === hostId));
    const until = createCooldownUntil(mine, hostId);
    if (until) {
      const hhmm = until.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
      throw new DomainError(
        `Você confirmou presença em um meet recentemente. Para manter as cortesias justas, poderá criar o seu a partir de ${hhmm}.`,
      );
    }

    let code = newInviteCode();
    while (s.meets.some((m) => m.code === code)) code = newInviteCode();

    const ts = now().toISOString();
    const meet: Meet = {
      id: `m-${crypto.randomUUID().slice(0, 8)}`,
      code,
      hostId,
      venueId,
      startsAt,
      message,
      status: "open",
      createdAt: ts,
      guests: [{ userId: hostId, role: "host", status: "accepted", respondedAt: ts, checkedInAt: null }],
    };
    s.meets.push(meet);
    return clone(meet);
  },

  async cancelMeet(meetId, hostId) {
    const m = findMeet(meetId);
    if (m.hostId !== hostId) throw new DomainError("Só o anfitrião pode cancelar.");
    if (m.status !== "open" && m.status !== "closed") throw new DomainError("Este meet não pode mais ser cancelado.");
    m.status = "cancelled";
  },

  async markInviteSeen(code, userId) {
    const m = findMeetByCode(code);
    if (guestOf(m, userId)) return;
    if (m.status !== "open") return;
    m.guests.push({ userId, role: "guest", status: "invited", respondedAt: null, checkedInAt: null });
  },

  async respondInvite(code, userId, accept) {
    const m = findMeetByCode(code);
    if (m.hostId === userId) throw new DomainError("Você é o anfitrião deste meet.");
    const block = joinBlockReason(m);
    if (block) throw new DomainError(block);
    if (accept && peopleCount(m) >= cfg.maxPeople) throw new DomainError("A lista está cheia.");

    let guest = guestOf(m, userId);
    if (!guest) {
      guest = { userId, role: "guest", status: "invited", respondedAt: null, checkedInAt: null };
      m.guests.push(guest);
    }
    guest.status = accept ? "accepted" : "declined";
    guest.respondedAt = now().toISOString();
  },

  async closeMeet(meetId, hostId) {
    const s = db();
    const m = findMeet(meetId);
    if (m.hostId !== hostId) throw new DomainError("Só o anfitrião pode fechar a lista.");
    if (m.status === "closed") {
      const pending = s.payments.find((p) => p.meetId === m.id && p.status === "pending");
      if (pending) return clone(pending);
    }
    if (m.status !== "open") throw new DomainError("A lista deste meet já foi fechada.");
    const people = peopleCount(m);
    if (people < 2) throw new DomainError("Espere pelo menos um convidado confirmar antes de fechar a lista.");

    // Quem não respondeu sai da lista ao fechar.
    m.guests = m.guests.filter((x) => x.status !== "invited");
    m.status = "closed";

    const payment: Payment = {
      id: `pay-${crypto.randomUUID().slice(0, 8)}`,
      meetId: m.id,
      amountCents: meetPriceCents(people),
      people,
      status: "pending",
      // No modo real, vem da API do Mercado Pago (point_of_interaction.transaction_data.qr_code).
      pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136dartfy-demo-${m.code}5204000053039865406${(meetPriceCents(people) / 100).toFixed(2)}5802BR5906DARTFY6008CURITIBA62070503***6304DEMO`,
      createdAt: now().toISOString(),
      paidAt: null,
    };
    s.payments.push(payment);
    return clone(payment);
  },

  async confirmPayment(paymentId) {
    const s = db();
    const p = s.payments.find((x) => x.id === paymentId);
    if (!p) throw new DomainError("Pagamento não encontrado.");
    if (p.status === "approved") return;
    p.status = "approved";
    p.paidAt = now().toISOString();
    const m = findMeet(p.meetId);
    if (m.status === "closed") m.status = "paid";
  },

  async checkIn(meetId, userId) {
    const m = findMeet(meetId);
    const block = checkinBlockReason(m, userId);
    if (block) throw new DomainError(block);
    const guest = guestOf(m, userId)!;
    guest.status = "checked_in";
    guest.checkedInAt = now().toISOString();
  },
};
