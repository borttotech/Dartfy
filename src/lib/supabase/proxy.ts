import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/** Rotas que exigem login. O convite público (/c/[code]) fica de fora de propósito. */
const PRIVATE_PREFIXES = ["/convites", "/meets", "/criar", "/perfil"];

/** Renova a sessão a cada requisição e manda visitantes não autenticados para o login. */
export async function updateSession(request: NextRequest) {
  // Modo demo: sem autenticação real.
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Não colocar código entre createServerClient e getClaims (recomendação do Supabase).
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const isPrivate = pathname === "/" || PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPrivate && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.search = "";
    if (pathname === "/") {
      // Visitante na raiz: tela de boas-vindas (splash).
      url.pathname = "/bem-vindo";
    } else {
      url.pathname = "/entrar";
      url.searchParams.set("next", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  }

  if ((pathname === "/entrar" || pathname === "/bem-vindo") && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
