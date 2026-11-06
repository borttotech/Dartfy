import { initials } from "@/lib/format";

const PALETTE = [
  ["#ff2bd6", "#8b5cf6"],
  ["#5b7cfa", "#22d3ee"],
  ["#f97316", "#ff2bd6"],
  ["#34e5a0", "#5b7cfa"],
  ["#8b5cf6", "#f472b6"],
  ["#facc15", "#f97316"],
] as const;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const sizes = { xs: "size-7 text-[0.625rem]", sm: "size-9 text-xs", md: "size-11 text-sm", lg: "size-16 text-lg" } as const;

export function Avatar({ id, name, size = "sm", ring = false }: { id: string; name: string; size?: keyof typeof sizes; ring?: boolean }) {
  const [a, b] = PALETTE[hash(id) % PALETTE.length];
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-display font-bold text-white ${sizes[size]} ${ring ? "ring-2 ring-noite" : ""}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${a}, ${b})` }}
      title={name}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

/** "Fulano, Ciclano +3" em forma de rostinhos sobrepostos. */
export function AvatarStack({ people, max = 4, size = "sm" }: { people: { id: string; name: string }[]; max?: number; size?: keyof typeof sizes }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex -space-x-2.5">
      {shown.map((p) => (
        <Avatar key={p.id} id={p.id} name={p.name} size={size} ring />
      ))}
      {rest > 0 && (
        <span className={`inline-grid place-items-center rounded-full bg-elevado font-semibold text-suave ring-2 ring-noite ${sizes[size]}`}>+{rest}</span>
      )}
    </div>
  );
}
