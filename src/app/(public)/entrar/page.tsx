import type { Metadata } from "next";
import { Alert, Logo } from "@/components/ui/misc";
import { isDemoMode } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; modo?: string; erro?: string }> }) {
  const { next = "/", modo, erro } = await searchParams;
  const fromInvite = next.startsWith("/c/");
  return (
    <div className="flex min-h-dvh flex-col py-[max(env(safe-area-inset-top),2.5rem)]">
      <div className="my-auto">
        <Logo size="lg" className="mb-8" />
        <h1 className="text-[1.75rem] font-extrabold">
          {fromInvite ? (
            <>Falta pouco pra confirmar sua presença.</>
          ) : (
            <>
              Não deixe o rolê acontecer <span className="text-brand">sem você.</span>
            </>
          )}
        </h1>
        <p className="mt-2 mb-7 text-suave">Entre ou crie sua conta em poucos segundos.</p>
        {erro === "link" && (
          <div className="mb-5">
            <Alert tone="alerta">Esse link expirou ou já foi usado. Entre com sua senha ou peça um novo.</Alert>
          </div>
        )}
        <LoginForm next={next} demo={isDemoMode} initialMode={modo === "criar" ? "criar" : "entrar"} />
      </div>
    </div>
  );
}
