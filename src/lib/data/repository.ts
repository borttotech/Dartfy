import type { Gender, Meet, MeetView, Payment, Profile, Venue } from "@/lib/types";

/**
 * Contrato único de acesso a dados.
 * As telas e Server Actions só conhecem esta interface; trocar o modo demo
 * pelo Supabase é implementar este contrato (ver src/lib/data/index.ts).
 *
 * Métodos de escrita lançam DomainError (src/lib/meets/rules.ts) com mensagem
 * pronta para o usuário quando uma regra de negócio impede a operação.
 */
export interface DartfyRepository {
  // Perfis
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(
    userId: string,
    patch: { name: string; email: string | null; gender: Gender | null; birthDate: string | null },
  ): Promise<Profile>;

  // Estabelecimentos
  listVenues(): Promise<Venue[]>;
  getVenue(venueId: string): Promise<Venue | null>;

  // Meets
  getMeet(meetId: string): Promise<MeetView | null>;
  getMeetByCode(code: string): Promise<MeetView | null>;
  /** Meets em que o usuário é anfitrião ou convidado (qualquer status). */
  listMeetsForUser(userId: string): Promise<MeetView[]>;
  createMeet(input: { hostId: string; venueId: string; startsAt: string; message: string | null }): Promise<Meet>;
  cancelMeet(meetId: string, hostId: string): Promise<void>;

  // Convite
  /** Registra que o usuário abriu o convite (aparece em "Convites"). Idempotente. */
  markInviteSeen(meetId: string, userId: string): Promise<void>;
  respondInvite(meetId: string, userId: string, accept: boolean): Promise<void>;

  // Fechamento e pagamento
  /** Anfitrião fecha a lista; gera a cobrança Pix com o valor pelo número de pessoas. */
  closeMeet(meetId: string, hostId: string): Promise<Payment>;
  /** Chamado pelo webhook do Mercado Pago (ou pelo botão de simulação no modo demo). */
  confirmPayment(paymentId: string): Promise<void>;

  // No local
  checkIn(meetId: string, userId: string): Promise<void>;
}
