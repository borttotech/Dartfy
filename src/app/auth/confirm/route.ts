import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Retorno dos links enviados por e-mail pelo Supabase (confirmar conta e redefinir senha).
 * Aceita ?token_hash=…&type=… (modelos de e-mail) e ?code=… (fluxo PKCE).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const raw = searchParams.get("next") ?? "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  const fail = NextResponse.redirect(`${origin}/entrar?erro=link`);

  if (searchParams.get("error") || searchParams.get("error_code")) return fail;

  const supabase = await createClient();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    return error ? fail : NextResponse.redirect(`${origin}${next}`);
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? fail : NextResponse.redirect(`${origin}${next}`);
  }
  return fail;
}
