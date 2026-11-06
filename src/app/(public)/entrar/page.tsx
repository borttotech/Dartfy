import type { Metadata } from "next";
import { Logo } from "@/components/ui/misc";
import { isDemoMode } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  const fromInvite = next.startsWith("/c/");
  return (
    <div className="flex min-h-dvh flex-col justify-center py-10">
      <Logo size="lg" className="mb-10" />
      <h1 className="text-[2rem] font-extrabold">
        {fromInvite ? "Falta pouco pra confirmar" : "Não deixe o rolê"} <span className="text-brand">{fromInvite ? "sua presença." : "acontecer sem você."}</span>
      </h1>
      <p className="mt-3 mb-8 text-suave">Entre com seu celular. Leva 10 segundos.</p>
      <LoginForm next={next} demo={isDemoMode} />
      <p className="mt-8 text-center text-xs text-apagado">Ao continuar você confirma ter 18 anos ou mais e aceita os termos de uso.</p>
    </div>
  );
}
