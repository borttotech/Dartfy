import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconChevronRight, IconGift, IconPin, IconUser, IconUsers } from "@/components/ui/icons";
import { Logo } from "@/components/ui/misc";
import crowd from "../../../../public/brand/dartfy-crowd.jpg";

export const metadata: Metadata = { title: "Bem-vindo" };

const FEATURES = [
  { icon: IconUsers, text: ["Convide amigos", "e saia junto"] },
  { icon: IconPin, text: ["Descubra bares", "e experiências"] },
  { icon: IconGift, text: ["Ganhe prêmios", "e brindes"] },
] as const;

/** Tela inicial (splash) — referência: Imagens/Dartfy/Dartfy Splash Original.png */
export default function WelcomePage() {
  return (
    <div className="relative -mx-5 flex min-h-dvh flex-col overflow-hidden">
      {/* Foto da galera ocupando o meio da tela, com fusão suave em cima e embaixo */}
      <div className="pointer-events-none absolute inset-x-0 top-[15%] bottom-[20%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_26%,black_74%,transparent_100%)]" aria-hidden>
        <Image
          src={crowd}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 448px) 100vw, 448px"
          className="venue-cover object-cover object-[50%_30%]"
        />
      </div>

      {/* Logo + slogan */}
      <header className="relative px-5 pt-[max(env(safe-area-inset-top),2.75rem)] text-center animate-rise">
        <h1 className="sr-only">Dartfy</h1>
        <Logo size="xl" className="mx-auto max-w-full" />
        <p className="tagline mt-5 text-[0.8125rem] sm:text-sm">
          Não deixe a noite
          <br />
          acontecer sem você.
        </p>
      </header>

      <div className="flex-1" />

      {/* Benefícios + ações */}
      <div className="relative px-5 pb-[max(env(safe-area-inset-bottom),1.75rem)]">
        <ul className="grid grid-cols-3 divide-x divide-tinta/25 animate-rise [animation-delay:120ms]">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text[0]} className="flex flex-col items-center gap-2.5 px-1.5 text-center">
              <Icon size={30} strokeWidth={1.6} className="neon-icon" />
              <span className="text-[0.6875rem] leading-snug font-medium tracking-wide text-texto/90 uppercase">
                {text[0]}
                <br />
                {text[1]}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-7 grid gap-3 animate-rise [animation-delay:200ms]">
          <Link
            href="/entrar?modo=criar"
            className="glow-neon bg-brand group relative flex h-15 items-center justify-center rounded-2xl text-lg font-semibold text-sobre-brand transition active:scale-[0.98]"
          >
            Começar agora
            <IconChevronRight size={24} className="absolute right-5 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/entrar"
            className="relative flex h-15 items-center justify-center rounded-2xl bg-noite/70 text-base font-semibold text-texto ring-1 ring-tinta/20 backdrop-blur transition hover:bg-tinta/[0.06] active:scale-[0.98]"
          >
            <IconUser size={22} className="absolute left-6 text-suave" />
            Entrar na minha conta
          </Link>
        </div>
        <p className="mt-4 text-center text-[0.6875rem] text-apagado">Para maiores de 18 anos · Beba com moderação.</p>
      </div>
    </div>
  );
}
