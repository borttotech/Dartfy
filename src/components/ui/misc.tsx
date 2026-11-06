import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { GuestStatus, MeetStatus } from "@/lib/types";
import { IconChevronLeft } from "./icons";

type Tone = "neutral" | "ok" | "alerta" | "erro" | "neon" | "anil";

/** Cor só no ponto; o texto fica neutro (sem "tag" com fundo pastel). */
const dots: Record<Tone, string> = {
  neutral: "bg-apagado",
  ok: "bg-ok",
  alerta: "bg-alerta",
  erro: "bg-erro",
  neon: "bg-neon",
  anil: "bg-anil",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium whitespace-nowrap text-suave">
      <span className={`size-1.5 rounded-full ${dots[tone]}`} />
      {children}
    </span>
  );
}

export const meetStatusLabel: Record<MeetStatus, { label: string; tone: Tone }> = {
  open: { label: "Lista aberta", tone: "anil" },
  closed: { label: "Aguardando Pix", tone: "alerta" },
  paid: { label: "Confirmado", tone: "ok" },
  finished: { label: "Encerrado", tone: "neutral" },
  cancelled: { label: "Cancelado", tone: "erro" },
};

export const guestStatusLabel: Record<GuestStatus, { label: string; tone: Tone }> = {
  invited: { label: "Não respondeu", tone: "neutral" },
  accepted: { label: "Vai", tone: "ok" },
  declined: { label: "Não vai", tone: "erro" },
  checked_in: { label: "No local", tone: "neon" },
};

export function MeetStatusPill({ status }: { status: MeetStatus }) {
  const s = meetStatusLabel[status];
  return (
    <Pill tone={s.tone} dot>
      {s.label}
    </Pill>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-10 text-center animate-rise">
      <div className="mb-3 text-apagado">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-[30ch] text-sm text-suave">{text}</p>
      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  );
}

/** Cabeçalho de página interna: voltar + título. */
export function PageHeader({ title, back, subtitle, action }: { title: string; back?: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-5 flex items-start gap-3">
      {back && (
        <Link href={back} className="-ml-1 mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl text-suave hover:bg-tinta/[0.06] hover:text-texto" aria-label="Voltar">
          <IconChevronLeft />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-suave">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-lg font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function Alert({ tone = "erro", children }: { tone?: "erro" | "ok" | "alerta" | "anil"; children: ReactNode }) {
  // Fundo neutro; a cor aparece só no filete à esquerda.
  const t = { erro: "border-erro", ok: "border-ok", alerta: "border-alerta", anil: "border-anil" }[tone];
  return (
    <div role={tone === "erro" ? "alert" : "status"} className={`rounded-r-xl border-l-2 bg-tinta/[0.04] px-4 py-3 text-sm text-texto/90 ${t}`}>
      {children}
    </div>
  );
}

/**
 * Logo oficial (ref/image.png). Padrão: escrita monocromática branca, mais sóbria no app.
 * Variações em public/brand: white (fundo escuro), dark (fundo claro), color (neon original, para peças de marketing).
 */
const LOGO_RATIO = 233 / 63;
const LOGO_SIZES = { sm: 22, md: 26, lg: 36 } as const;

/** Versão da logo por tema: Dartfy = neon colorida, Darkfy = branca, Whitefy = escura. */
const LOGO_BY_THEME = [
  { theme: "dartfy", file: "color" },
  { theme: "darkfy", file: "white" },
  { theme: "whitefy", file: "dark" },
] as const;

export function Logo({ variant, size = "md", className = "" }: { variant?: "white" | "dark" | "color"; size?: keyof typeof LOGO_SIZES; className?: string }) {
  const h = LOGO_SIZES[size];
  const img = (file: string, extra = "") => (
    <Image
      key={file + extra}
      src={`/brand/dartfy-wordmark-${file}.png`}
      alt="Dartfy"
      width={Math.round(h * LOGO_RATIO)}
      height={h}
      priority
      className={`select-none ${extra}`}
      style={{ height: h, width: "auto" }}
    />
  );
  return (
    <span className={`inline-block shrink-0 self-start ${className}`} style={{ height: h }}>
      {variant ? img(variant, "block") : LOGO_BY_THEME.map((l) => img(l.file, `logo-variant logo-${l.theme}`))}
    </span>
  );
}
