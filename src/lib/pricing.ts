import { pricing } from "@/config/site";

/** Valor do Meet em centavos: preço-base até N pessoas + adicional por pessoa extra. */
export function meetPriceCents(people: number) {
  const extra = Math.max(0, people - pricing.includedPeople);
  return pricing.baseCents + extra * pricing.extraPersonCents;
}

/** Quanto sai por pessoa, para o anfitrião dividir ("≈ R$ 1,00 por pessoa"). */
export function pricePerPersonCents(people: number) {
  const n = Math.max(1, people);
  return Math.ceil(meetPriceCents(n) / n);
}
