import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { demoRepository } from "./demo/repository";
import type { DartfyRepository } from "./repository";
import { supabaseRepository } from "./supabase/repository";

/**
 * Ponto único de acesso a dados.
 * Com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY → Supabase (schema "dartfy").
 * Sem elas → modo demo (memória).
 */
export function repo(): DartfyRepository {
  return isSupabaseConfigured ? supabaseRepository : demoRepository;
}

export const isDemoMode = !isSupabaseConfigured;
