/**
 * Regras de negócio do Meet — funções puras, sem banco.
 * O modo demo usa estas funções diretamente; no Supabase as mesmas regras
 * são reforçadas nas funções SQL (supabase/migrations), nunca só na interface.
 */
import { rules } from "@/config/site";
import type { Meet, MeetGuest } from "@/lib/types";

export class DomainError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "DomainError";
  }
}

const GOING: MeetGuest["status"][] = ["accepted", "checked_in"];

export function isGoing(g: MeetGuest) {
  return GOING.includes(g.status);
}

/** Pessoas confirmadas, anfitrião incluso. É o número que define o preço. */
export function peopleCount(meet: Pick<Meet, "guests">) {
  return meet.guests.filter(isGoing).length;
}

export function guestOf(meet: Pick<Meet, "guests">, userId: string | null | undefined) {
  return userId ? meet.guests.find((g) => g.userId === userId) ?? null : null;
}

/** O convite ainda aceita novas confirmações? */
export function joinBlockReason(meet: Meet, now = new Date()): string | null {
  if (meet.status === "cancelled") return "Este meet foi cancelado pelo anfitrião.";
  if (meet.status !== "open") return "O anfitrião já fechou a lista deste meet.";
  if (new Date(meet.startsAt) <= now) return "Este meet já começou.";
  if (peopleCount(meet) >= rules.maxPeople) return "A lista está cheia.";
  return null;
}

/** Janela de check-in: de 1 h antes até 6 h depois do horário marcado. */
export function checkinWindow(meet: Pick<Meet, "startsAt">) {
  const start = new Date(meet.startsAt).getTime();
  return {
    opensAt: new Date(start - rules.checkinOpensMinutesBefore * 60_000),
    closesAt: new Date(start + 6 * 3_600_000),
  };
}

export function checkinBlockReason(meet: Meet, userId: string, now = new Date()): string | null {
  const g = guestOf(meet, userId);
  if (!g || !isGoing(g)) return "Você não está na lista deste meet.";
  if (g.status === "checked_in") return "Check-in já realizado.";
  if (meet.status !== "paid") return "As cortesias são liberadas quando o anfitrião confirma o meet.";
  const { opensAt, closesAt } = checkinWindow(meet);
  if (now < opensAt) return "O check-in abre 1 hora antes do horário marcado.";
  if (now > closesAt) return "O período de check-in deste meet terminou.";
  return null;
}

/**
 * Antifraude: quem aceitou um convite não pode criar um meet próprio nas 24 h seguintes
 * (evita que o mesmo grupo multiplique cortesias trocando de anfitrião).
 * Retorna até quando o usuário está bloqueado, ou null.
 */
export function createCooldownUntil(userMeets: Meet[], userId: string, now = new Date()): Date | null {
  const windowMs = rules.guestCreateCooldownHours * 3_600_000;
  let until: Date | null = null;
  for (const m of userMeets) {
    if (m.status === "cancelled") continue;
    const g = m.guests.find((x) => x.userId === userId && x.role === "guest" && isGoing(x));
    if (!g?.respondedAt) continue;
    const end = new Date(new Date(g.respondedAt).getTime() + windowMs);
    if (end > now && (!until || end > until)) until = end;
  }
  return until;
}

export function validateStartsAt(startsAt: Date, now = new Date()) {
  if (Number.isNaN(startsAt.getTime())) throw new DomainError("Escolha data e horário.", "startsAt");
  if (startsAt.getTime() < now.getTime() + rules.minLeadMinutes * 60_000)
    throw new DomainError(`Marque com pelo menos ${rules.minLeadMinutes} minutos de antecedência.`, "startsAt");
  if (startsAt.getTime() > now.getTime() + 60 * 864e5) throw new DomainError("Marque para os próximos 60 dias.", "startsAt");
}

/** Código curto e legível para o link do convite (sem 0/O/1/I). */
export function newInviteCode(length = 7) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
