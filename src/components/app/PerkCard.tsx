import { IconGift } from "@/components/ui/icons";
import { formatWeekdays } from "@/lib/format";
import type { Perk } from "@/lib/types";

/** Destaque da cortesia — é o principal motivo para o convidado aceitar. */
export function PerkCard({ perk, valid = true, compact = false }: { perk: Perk; valid?: boolean; compact?: boolean }) {
  return (
    <div className={`surface flex gap-3 ${compact ? "p-3.5" : "p-4"}`}>
      <IconGift size={compact ? 20 : 22} className={`mt-0.5 shrink-0 ${valid ? "text-neon" : "text-apagado"}`} />
      <div className="min-w-0">
        <p className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>{perk.title}</p>
        {!compact && <p className="mt-0.5 text-sm text-suave">{perk.description}</p>}
        <p className="mt-1 text-xs text-apagado">
          {valid ? `Cortesia · vale ${formatWeekdays(perk.validWeekdays)}` : `Não vale nesta data · só ${formatWeekdays(perk.validWeekdays)}`}
        </p>
      </div>
    </div>
  );
}
