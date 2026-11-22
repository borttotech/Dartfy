import "server-only";
import { createClient } from "@supabase/supabase-js";
import { DB_SCHEMA, SUPABASE_URL } from "./env";

/**
 * Cliente com a chave secreta (ignora RLS). SOMENTE no servidor:
 * gravar o Pix gerado no Mercado Pago e confirmar pagamentos pelo webhook.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !key) throw new Error("SUPABASE_SECRET_KEY não configurada.");
  return createClient(SUPABASE_URL, key, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
