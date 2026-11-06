import { localWeekday } from "@/lib/format";
import type { Perk, Venue } from "@/lib/types";

/** Cortesias que valem na data informada e ainda têm saldo. */
export function perksFor(venue: Venue, date: Date) {
  const wd = localWeekday(date);
  return venue.perks.filter((p) => p.validWeekdays.includes(wd) && p.remainingToday > 0);
}

/** Cortesia principal para destacar no card (a primeira válida, senão a primeira cadastrada). */
export function headlinePerk(venue: Venue, date: Date): { perk: Perk | null; valid: boolean } {
  const valid = perksFor(venue, date);
  if (valid[0]) return { perk: valid[0], valid: true };
  return { perk: venue.perks[0] ?? null, valid: false };
}

export function mapsUrl(venue: Pick<Venue, "name" | "address" | "city">) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.city}`)}`;
}
