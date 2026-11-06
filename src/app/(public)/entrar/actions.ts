"use server";

import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/data";
import { isValidMobile, onlyDigits } from "@/lib/format";
import { str } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { step: "phone" | "code"; phone: string; message: string };

/** Só aceita caminhos internos em ?next= (evita open redirect). */
function safeNext(v: string) {
  return v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

export async function loginAction(prev: LoginState, form: FormData): Promise<LoginState> {
  const next = safeNext(str(form, "next"));

  if (prev.step === "phone") {
    const phone = onlyDigits(str(form, "phone"));
    if (!isValidMobile(phone)) return { ...prev, phone, message: "Digite um celular válido com DDD." };
    if (isDemoMode) redirect(next);

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone: `+55${phone}` });
    if (error) return { ...prev, phone, message: "Não conseguimos enviar o código. Tente de novo em instantes." };
    return { step: "code", phone, message: "" };
  }

  const token = onlyDigits(str(form, "code"));
  if (token.length !== 6) return { ...prev, message: "O código tem 6 dígitos." };
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ phone: `+55${prev.phone}`, token, type: "sms" });
  if (error) return { ...prev, message: "Código inválido ou expirado." };
  redirect(next);
}
