/** Variáveis do Supabase. A chave secreta nunca é lida aqui. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** Todas as tabelas do Dartfy ficam no schema "dartfy". */
export const DB_SCHEMA = "dartfy" as const;

/** Sem Supabase configurado, o app roda em modo demo (src/lib/data/demo). */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
