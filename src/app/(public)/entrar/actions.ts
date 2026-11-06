"use server";

import { redirect } from "next/navigation";
import { SITE_URL } from "@/config/site";
import { isDemoMode } from "@/lib/data";
import { isValidMobile, onlyDigits } from "@/lib/format";
import { isEmail, str } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

const MIN_PASSWORD = 8;

/** Só aceita caminhos internos em ?next= (evita open redirect). */
function safeNext(v: string) {
  return v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

function ageFrom(date: string) {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return NaN;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

const invalid = (fieldErrors: Record<string, string>): AuthState => ({ ok: false, message: "", fieldErrors });

export async function signInAction(_: AuthState, form: FormData): Promise<AuthState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const fe: Record<string, string> = {};
  if (!isEmail(email)) fe.email = "Digite um e-mail válido.";
  if (!password) fe.password = "Digite sua senha.";
  if (Object.keys(fe).length) return invalid(fe);

  if (!isDemoMode) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (/not confirmed/i.test(error.message)) return { ok: false, message: "Confirme seu e-mail pelo link que enviamos antes de entrar." };
      return { ok: false, message: "E-mail ou senha incorretos." };
    }
  }
  redirect(safeNext(str(form, "next")));
}

export async function signUpAction(_: AuthState, form: FormData): Promise<AuthState> {
  const name = str(form, "name");
  const email = str(form, "email").toLowerCase();
  const phone = onlyDigits(str(form, "phone"));
  const birthDate = str(form, "birthDate");
  const password = str(form, "password");

  const fe: Record<string, string> = {};
  if (name.length < 2) fe.name = "Como a galera te chama?";
  if (!isEmail(email)) fe.email = "Digite um e-mail válido.";
  if (!isValidMobile(phone)) fe.phone = "Digite um celular válido com DDD.";
  const age = ageFrom(birthDate);
  if (!birthDate || Number.isNaN(age)) fe.birthDate = "Informe sua data de nascimento.";
  else if (age < 18) fe.birthDate = "O Dartfy é só para maiores de 18 anos.";
  else if (age > 110) fe.birthDate = "Confira a data.";
  if (password.length < MIN_PASSWORD) fe.password = `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`;
  if (str(form, "terms") !== "on") fe.terms = "É preciso aceitar os termos para continuar.";
  if (Object.keys(fe).length) return invalid(fe);

  const next = safeNext(str(form, "next"));
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, birth_date: birthDate },
        emailRedirectTo: `${SITE_URL}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message)) return { ok: false, message: "Já existe uma conta com esse e-mail. Tente entrar." };
      if (/password/i.test(error.message)) return invalid({ password: "Escolha uma senha mais forte." });
      return { ok: false, message: "Não foi possível criar a conta agora. Tente de novo." };
    }
    // Com confirmação de e-mail ligada no Supabase, ainda não há sessão.
    if (!data.session) return { ok: true, message: `Conta criada! Enviamos um link de confirmação para ${email}.` };
  }
  redirect(next);
}

export async function forgotPasswordAction(_: AuthState, form: FormData): Promise<AuthState> {
  const email = str(form, "email").toLowerCase();
  if (!isEmail(email)) return invalid({ email: "Digite um e-mail válido." });
  if (!isDemoMode) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/auth/confirm?next=/redefinir-senha` });
  }
  // Mesma resposta exista ou não a conta (não revela quais e-mails estão cadastrados).
  return { ok: true, message: `Se houver uma conta com ${email}, você vai receber um link para criar uma nova senha.` };
}

export async function resetPasswordAction(_: AuthState, form: FormData): Promise<AuthState> {
  const password = str(form, "password");
  const confirm = str(form, "confirm");
  if (password.length < MIN_PASSWORD) return invalid({ password: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` });
  if (password !== confirm) return invalid({ confirm: "As senhas não conferem." });
  if (!isDemoMode) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, message: "O link expirou. Peça um novo em “Esqueci minha senha”." };
  }
  redirect("/");
}
