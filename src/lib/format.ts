import { site } from "@/config/site";

const tz = site.timeZone;

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** "sáb., 31 de out." */
export function formatDayShort(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
}

/** "sábado, 31 de outubro" */
export function formatDayLong(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}

/** "19:00" */
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** Data local (yyyy-mm-dd) no fuso de Curitiba. */
export function localDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** "Hoje", "Amanhã" ou "Sáb., 31 de out." */
export function relativeDay(iso: string, now = new Date()) {
  const key = localDateKey(new Date(iso));
  if (key === localDateKey(now)) return "Hoje";
  if (key === localDateKey(new Date(now.getTime() + 864e5))) return "Amanhã";
  return capitalize(formatDayShort(iso));
}

/** "Em 40 min", "Em 2 h", "Em 3 dias", "Agora" */
export function countdown(iso: string, now = new Date()) {
  const diff = new Date(iso).getTime() - now.getTime();
  if (diff <= 0) return "Agora";
  const min = Math.round(diff / 60000);
  if (min < 60) return `Em ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Em ${h} h`;
  const d = Math.round(h / 24);
  return `Em ${d} ${d === 1 ? "dia" : "dias"}`;
}

/** Combina "2026-11-07" + "19:30" no fuso de Brasília (UTC-3, sem horário de verão). */
export function zonedIso(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00-03:00`).toISOString();
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** 41998848675 → (41) 99884-8675 */
export function formatPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

/** Celular brasileiro com DDD: 11 dígitos, nono dígito obrigatório. */
export function isValidMobile(digits: string) {
  return /^[1-9]{2}9\d{8}$/.test(digits);
}

/** Dia da semana (0 = domingo) no fuso de Curitiba. */
export function localWeekday(date: Date) {
  const key = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(key);
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** [0,2,3,4] → "dom, ter, qua, qui"; todos os dias → "todos os dias". */
export function formatWeekdays(days: number[]) {
  if (days.length === 7) return "todos os dias";
  return [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => WEEKDAYS[d]).join(", ");
}

export function pluralize(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
