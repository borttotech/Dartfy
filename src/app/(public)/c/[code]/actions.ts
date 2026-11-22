"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { str } from "@/lib/forms";
import { DomainError } from "@/lib/meets/rules";
import type { ActionState } from "@/lib/types";

export async function respondInviteAction(_: ActionState, form: FormData): Promise<ActionState> {
  const code = str(form, "code");
  const accept = str(form, "accept") === "1";
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(`/c/${code}`)}`);

  const meet = await repo().getMeetByCode(code);
  if (!meet) return { ok: false, message: "Convite não encontrado." };

  try {
    await repo().respondInvite(meet.code, user.id, accept);
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, message: e.message };
    throw e;
  }
  revalidatePath("/", "layout");
  return { ok: true, message: accept ? "Presença confirmada!" : "Tudo bem, avisamos o anfitrião." };
}
