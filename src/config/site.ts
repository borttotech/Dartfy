/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURAÇÃO CENTRAL DO DARTFY
 *  Marca, links e regras comerciais ficam aqui.
 * ─────────────────────────────────────────────────────────────
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const site = {
  name: "Dartfy",
  tagline: "Convide, conecte e aproveite.",
  description:
    "Organize o encontro, chame a galera e ganhe cortesias nos bares parceiros. O Dartfy tira o rolê do grupo do WhatsApp e leva pra mesa.",
  locale: "pt_BR",
  timeZone: "America/Sao_Paulo",
  city: "Curitiba",
} as const;

/**
 * Regras comerciais do Meet (pitch deck, seção 04 · Modelo de negócio).
 * Valores em centavos. Ajustar aqui após o piloto, sem tocar nas telas.
 */
export const pricing = {
  baseCents: 499,
  includedPeople: 5,
  extraPersonCents: 100,
} as const;

/** Regras antifraude e operacionais (reunião de 30/10/2026). */
export const rules = {
  /** Convidado que aceitou um meet não pode criar outro dentro desta janela. */
  guestCreateCooldownHours: 24,
  /** Máximo de pessoas por meet (anfitrião incluso). */
  maxPeople: 20,
  /** Antecedência mínima para criar um meet. */
  minLeadMinutes: 30,
  /** Check-in liberado a partir de X minutos antes do horário. */
  checkinOpensMinutesBefore: 60,
  /** Raio (metros) para validar o check-in por geolocalização. */
  checkinRadiusMeters: 150,
} as const;
