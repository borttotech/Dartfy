import Link from "next/link";

/** Abas por query string (?aba=) — funcionam sem JavaScript e mantêm o link compartilhável. */
export function Tabs({ base, current, tabs }: { base: string; current: string; tabs: { key: string; label: string; count?: number }[] }) {
  return (
    <nav className="mb-5 flex gap-1 rounded-2xl bg-tinta/[0.04] p-1 ring-1 ring-inset ring-tinta/[0.06]" aria-label="Filtros">
      {tabs.map((t) => {
        const active = t.key === current;
        return (
          <Link
            key={t.key}
            href={`${base}?aba=${t.key}`}
            replace
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition ${active ? "bg-tinta/[0.1] text-texto shadow" : "text-apagado hover:text-suave"}`}
          >
            {t.label}
            {t.count ? <span className={`rounded-full px-1.5 text-[0.6875rem] ${active ? "bg-neon text-sobre-brand" : "bg-tinta/10"}`}>{t.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
