import type { Venue } from "@/lib/types";

const sizes = { sm: "size-12 rounded-xl text-base", md: "size-16 rounded-2xl text-xl", lg: "size-20 rounded-[1.4rem] text-2xl" } as const;

/** Logo do estabelecimento; sem logo enviada, monograma com as cores do bar. */
export function VenueMark({ venue, size = "md" }: { venue: Pick<Venue, "name" | "tone" | "logoUrl">; size?: keyof typeof sizes }) {
  const [a, b] = venue.tone;
  if (venue.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={venue.logoUrl} alt={venue.name} className={`${sizes[size]} shrink-0 object-cover ring-1 ring-tinta/10`} />;
  }
  const letters = venue.name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden font-display font-extrabold text-white ring-1 ring-tinta/15 ${sizes[size]}`}
      style={{ backgroundImage: `linear-gradient(140deg, ${a}, ${b})` }}
      aria-label={venue.name}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.35),transparent_55%)]" />
      <span className="relative drop-shadow">{letters}</span>
    </span>
  );
}

/** Faixa de capa (topo do convite) com as cores do bar. */
export function VenueCover({ venue, className = "" }: { venue: Pick<Venue, "tone">; className?: string }) {
  const [a, b] = venue.tone;
  return (
    <div
      className={`venue-cover absolute inset-0 [mask-image:linear-gradient(to_bottom,black_45%,transparent)] ${className}`}
      style={{
        background: `radial-gradient(90% 70% at 20% 0%, ${a}cc, transparent 70%), radial-gradient(80% 60% at 100% 30%, ${b}bb, transparent 70%), var(--color-noite)`,
      }}
    >
      <Skyline />
    </div>
  );
}

/** Silhueta de cidade — referência à arte atual do app, mas discreta. */
function Skyline() {
  return (
    <svg className="absolute inset-x-0 bottom-10 h-24 w-full opacity-40" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden>
      <path
        fill="var(--color-noite)"
        d="M0 100V62h14V48h10v14h8V30h16v32h10V54h12v-20h6v-8h4v8h6v20h10v46zM96 100V40h18v-12h8v12h12v60zM134 100V58h20V36h14v22h10V20h4V8h2v12h4v38h14v42zM202 100V46h16v-10h10v10h14v54zM242 100V30h20v-8h6v8h8v70zM276 100V56h12V40h18v16h10V26h14v74zM330 100V48h16V34h12v14h10v52zM368 100V60h14V44h18v56z"
      />
      <g fill="#ff2bd6" opacity="0.8">
        <rect x="102" y="46" width="2" height="2" />
        <rect x="110" y="56" width="2" height="2" />
        <rect x="248" y="40" width="2" height="2" />
        <rect x="256" y="52" width="2" height="2" />
        <rect x="336" y="56" width="2" height="2" />
      </g>
      <g fill="#5b7cfa" opacity="0.8">
        <rect x="140" y="66" width="2" height="2" />
        <rect x="208" y="54" width="2" height="2" />
        <rect x="290" y="62" width="2" height="2" />
        <rect x="376" y="70" width="2" height="2" />
      </g>
    </svg>
  );
}
