import { createBrowserClient } from "@supabase/ssr";
import { DB_SCHEMA, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/** Cliente para componentes de navegador (sessão em cookies, compartilhada com o servidor). */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { db: { schema: DB_SCHEMA } });
}
