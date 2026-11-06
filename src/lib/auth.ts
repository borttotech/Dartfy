import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { repo, isDemoMode } from "@/lib/data";
import { DEMO_USER_ID } from "@/lib/data/demo/seed";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Usuário logado (ou null). Em modo demo, sempre o usuário de demonstração. */
export const getCurrentUser = cache(async (): Promise<Profile | null> => {
  if (isDemoMode) {
    // Sem cookies não há sinal de requisição: força renderização dinâmica (dados mudam a cada ação).
    await connection();
    return repo().getProfile(DEMO_USER_ID);
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  return id ? repo().getProfile(id) : null;
});

/** Para páginas/ações privadas: garante usuário ou manda para o login. */
export async function requireUser(next = "/"): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return user;
}
