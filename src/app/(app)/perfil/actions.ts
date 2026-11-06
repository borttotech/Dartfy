"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDemoMode, repo } from "@/lib/data";
import { isEmail, optStr, str } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, Gender } from "@/lib/types";

const GENDERS: Gender[] = ["feminino", "masculino", "outro", "prefiro_nao_dizer"];

export async function saveProfileAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser("/perfil");
  const name = str(form, "name");
  const email = optStr(form, "email");
  const gender = optStr(form, "gender") as Gender | null;
  const birthDate = optStr(form, "birthDate");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Como a galera te chama?";
  if (email && !isEmail(email)) fieldErrors.email = "E-mail inválido.";
  if (gender && !GENDERS.includes(gender)) fieldErrors.gender = "Opção inválida.";
  if (birthDate) {
    const age = (Date.now() - new Date(birthDate).getTime()) / (365.25 * 864e5);
    if (Number.isNaN(age) || age < 18) fieldErrors.birthDate = "O Dartfy é só para maiores de 18 anos.";
    else if (age > 110) fieldErrors.birthDate = "Confira a data.";
  }
  if (Object.keys(fieldErrors).length) return { ok: false, message: "Confira os campos destacados.", fieldErrors };

  await repo().updateProfile(user.id, { name, email, gender, birthDate });
  revalidatePath("/", "layout");
  return { ok: true, message: "Perfil salvo." };
}

export async function signOutAction() {
  if (!isDemoMode) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/entrar");
}
