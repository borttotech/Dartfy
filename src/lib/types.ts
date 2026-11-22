/** Tipos de domínio do Dartfy. Espelham as tabelas do schema "dartfy" (ver supabase/migrations). */

export type Gender = "feminino" | "masculino" | "outro" | "prefiro_nao_dizer";

export type Profile = {
  id: string;
  name: string;
  phone: string; // só dígitos, com DDD: 41998848675
  email: string | null;
  gender: Gender | null;
  birthDate: string | null; // yyyy-mm-dd
};

export type VenueCategory = "bar" | "pub" | "restaurante" | "cafe" | "balad";

export type Perk = {
  id: string;
  venueId: string;
  title: string; // "Compre um chopp, ganhe outro"
  description: string;
  /** Dias da semana em que vale (0 = domingo … 6 = sábado). */
  validWeekdays: number[];
  /** Cortesias ainda disponíveis hoje (controle deslizante no painel do bar). */
  remainingToday: number;
};

export type Venue = {
  id: string;
  slug: string;
  name: string;
  category: VenueCategory;
  address: string;
  neighborhood: string;
  city: string;
  /** Duas cores do monograma/capa enquanto o bar não envia logo. */
  tone: [string, string];
  logoUrl: string | null;
  openingHours: string;
  phone: string | null;
  website: string | null;
  lat: number;
  lng: number;
  perks: Perk[];
};

/**
 * Ciclo de vida do Meet:
 * open (lista aberta) → closed (anfitrião fechou, aguardando Pix) → paid (pago, cortesias liberadas)
 * → finished. Pode ser cancelled enquanto open/closed.
 */
export type MeetStatus = "open" | "closed" | "paid" | "finished" | "cancelled";

export type GuestStatus = "invited" | "accepted" | "declined" | "checked_in";

export type MeetGuest = {
  userId: string;
  role: "host" | "guest";
  status: GuestStatus;
  respondedAt: string | null;
  checkedInAt: string | null;
};

export type Meet = {
  id: string;
  code: string; // link público /c/[code]
  hostId: string;
  venueId: string;
  startsAt: string; // ISO
  message: string | null;
  status: MeetStatus;
  createdAt: string;
  guests: MeetGuest[];
};

export type PaymentStatus = "pending" | "approved" | "expired" | "refunded";

export type Payment = {
  id: string;
  meetId: string;
  amountCents: number;
  people: number;
  status: PaymentStatus;
  pixCopyPaste: string;
  createdAt: string;
  paidAt: string | null;
};

/** Meet com as relações resolvidas, pronto para a interface. */
export type MeetView = Meet & {
  venue: Venue;
  host: Profile;
  people: Array<MeetGuest & { profile: Profile }>;
  payment: Payment | null;
};

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false, message: "" };
