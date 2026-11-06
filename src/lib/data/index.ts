import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { demoRepository } from "./demo/repository";
import type { DartfyRepository } from "./repository";

/**
 * Ponto único de acesso a dados.
 *
 * Hoje: modo demo (memória). Para produção, criar `./supabase/repository.ts`
 * implementando DartfyRepository sobre as funções SQL de supabase/migrations
 * e devolvê-lo aqui quando isSupabaseConfigured for true.
 */
export function repo(): DartfyRepository {
  if (isSupabaseConfigured) {
    throw new Error("Supabase configurado, mas o repositório Supabase ainda não foi implementado (src/lib/data/supabase).");
  }
  return demoRepository;
}

export const isDemoMode = !isSupabaseConfigured;
