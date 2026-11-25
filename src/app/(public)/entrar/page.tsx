import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { Alert, Logo } from "@/components/ui/misc";
import { isDemoMode } from "@/lib/data";
import crowd from "../../../../public/brand/dartfy-crowd.jpg";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; modo?: string; erro?: string }> }) {
  const { next = "/", modo, erro } = await searchParams;
  const fromInvite = next.startsWith("/c/");
  return (
    <div className="relative flex min-h-dvh flex-col pt-[max(env(safe-area-inset-top),1rem)] pb-10">
      {/* Faixa da foto da splash, bem apagada, atrás da logo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -mx-5 h-72 overflow-hidden [mask-image:linear-gradient(to_bottom,black_35%,transparent_100%)]" aria-hidden>
        <Image src={crowd} alt="" fill priority placeholder="blur" sizes="448px" className="venue-cover object-cover object-[50%_20%] opacity-35" />
      </div>

      <div className="relative">
        {!fromInvite && (
          <Link href="/bem-vindo" className="-ml-2 grid size-9 place-items-center rounded-xl text-suave hover:bg-tinta/[0.06] hover:text-texto" aria-label="Voltar">
            <IconChevronLeft />
          </Link>
        )}
        <div className="mt-6 mb-9 text-center">
          <Logo size="lg" className="mx-auto" />
          <p className="tagline mx-auto mt-3 max-w-[28ch] text-[0.6875rem]">Não deixe a noite acontecer sem você.</p>
        </div>

        <h1 className="text-[1.6rem] font-extrabold">
          {fromInvite ? (
            <>Falta pouco pra confirmar sua presença.</>
          ) : modo === "criar" ? (
            <>
              Bora pro <span className="text-brand">rolê?</span>
            </>
          ) : (
            <>
              Que bom te ver <span className="text-brand">de novo.</span>
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
