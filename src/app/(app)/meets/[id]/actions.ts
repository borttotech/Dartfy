"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDemoMode, repo } from "@/lib/data";
import { str } from "@/lib/forms";
import { DomainError } from "@/lib/meets/rules";
import type { ActionState } from "@/lib/types";

async function run(fn: () => Promise<void>, okMessage = ""): Promise<ActionState> {
  try {
    await fn();
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, message: e.message };
    throw e;
  }
  revalidatePath("/", "layout");
  return { ok: true, message: okMessage };
}

export async function closeMeetAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const meetId = str(form, "meetId");
  const res = await run(async () => {
    await repo().closeMeet(meetId, user.id);
  });
  if (!res.ok) return res;
  redirect(`/meets/${meetId}/pagamento`);
}

export async function cancelMeetAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const meetId = str(form, "meetId");
  return run(() => repo().cancelMeet(meetId, user.id), "Meet cancelado. Avisamos a galera.");
}

export async function checkInAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  // TODO(produção): validar geolocalização (rules.checkinRadiusMeters) antes de liberar.
  return run(() => repo().checkIn(str(form, "meetId"), user.id));
}

/** Somente modo demo: simula o webhook do Mercado Pago aprovando o Pix. */
export async function simulatePaymentAction(_: ActionState, form: FormData): Promise<ActionState> {
  if (!isDemoMode) return { ok: false, message: "Indisponível em produção." };
  await requireUser();
  const meetId = str(form, "meetId");
  const res = await run(() => repo().confirmPayment(str(form, "paymentId")));
  if (!res.ok) return res;
  redirect(`/meets/${meetId}?pago=1`);
}
