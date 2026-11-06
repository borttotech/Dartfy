"use client";

import { useActionState, useMemo, useState } from "react";
import { PerkCard } from "@/components/app/PerkCard";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/fields";
import dynamic from "next/dynamic";
import Link from "next/link";
import { IconCalendar, IconCheck, IconChevronLeft, IconClock, IconGift, IconMap, IconPin, IconSearch, IconX } from "@/components/ui/icons";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { VenueMark } from "@/components/ui/VenueMark";
import { pricing, rules } from "@/config/site";
import { capitalize, formatBRL, formatDayLong, localDateKey, zonedIso } from "@/lib/format";
import { initialActionState, type Venue } from "@/lib/types";
import { headlinePerk } from "@/lib/venues";
import { createMeetAction } from "./actions";

type Step = 0 | 1 | 2;
const STEPS = ["Onde", "Quando", "Revisar"] as const;

const TIMES = Array.from({ length: 16 }, (_, i) => {
  const mins = 16 * 60 + i * 30; // 16:00 → 23:30
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});

function nextDays(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getTime() + i * 864e5);
    const key = localDateKey(d);
    const label = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : capitalize(new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" }).format(d).replace(".", ""));
    const day = new Intl.DateTimeFormat("pt-BR", { day: "numeric", timeZone: "America/Sao_Paulo" }).format(d);
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).format(d).replace(".", "");
    return { key, label, day, month };
  });
}

/** Leaflet só existe no navegador: carrega o mapa sob demanda, sem SSR. */
const VenueMap = dynamic(() => import("@/components/app/VenueMap").then((m) => m.VenueMap), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-breu text-sm text-apagado">Carregando mapa…</div>,
});

function VenueOption({ v, selected, onSelect }: { v: Venue; selected: boolean; onSelect: (id: string) => void }) {
  const { perk, valid } = headlinePerk(v, new Date());
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(v.id)}
      className={`surface flex w-full items-center gap-3.5 p-3.5 text-left transition ${selected ? "!border-neon/70" : "hover:border-tinta/15"}`}
    >
      <VenueMark venue={v} size="md" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{v.name}</p>
        <p className="flex items-center gap-1 truncate text-sm text-suave">
          <IconPin size={14} className="shrink-0" />
          {v.neighborhood} · {v.address}
        </p>
        {perk && (
          <p className={`mt-1.5 flex items-center gap-1.5 text-[0.8125rem] ${valid ? "text-suave" : "text-apagado"}`}>
            <IconGift size={14} className={`shrink-0 ${valid ? "text-neon" : ""}`} />
            <span className="truncate">{perk.title}</span>
          </p>
        )}
      </div>
      <span className={`grid size-6 shrink-0 place-items-center rounded-full ring-2 transition ${selected ? "bg-brand text-sobre-brand ring-transparent" : "ring-tinta/20"}`}>
        {selected && <IconCheck size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}

export function CreateMeetWizard({ venues, initialVenueId }: { venues: Venue[]; initialVenueId: string | null }) {
  const [state, formAction] = useActionState(createMeetAction, initialActionState);
  const [step, setStep] = useState<Step>(initialVenueId ? 1 : 0);
  const [venueId, setVenueId] = useState<string | null>(initialVenueId);
  const [query, setQuery] = useState("");
  const [hood, setHood] = useState<string | null>(null);
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const days = useMemo(() => nextDays(14), []);
  const [date, setDate] = useState(days[0].key);
  const [time, setTime] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const venue = venues.find((v) => v.id === venueId) ?? null;
  const hoods = useMemo(() => [...new Set(venues.map((v) => v.neighborhood))].sort(), [venues]);
  const filtered = venues.filter(
    (v) => (!hood || v.neighborhood === hood) && (!query || `${v.name} ${v.neighborhood} ${v.address}`.toLowerCase().includes(query.toLowerCase())),
  );

  const minStart = Date.now() + rules.minLeadMinutes * 60_000;
  const timeOk = (t: string) => new Date(zonedIso(date, t)).getTime() >= minStart;
  const startsAt = time ? zonedIso(date, time) : null;
  const perkInfo = venue ? headlinePerk(venue, startsAt ? new Date(startsAt) : new Date(`${date}T20:00:00-03:00`)) : null;

  const canNext = step === 0 ? Boolean(venue) : step === 1 ? Boolean(time && timeOk(time)) : true;

  return (
    <form action={formAction} className="pb-24">
      <input type="hidden" name="venueId" value={venueId ?? ""} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time ?? ""} />
      <input type="hidden" name="message" value={message} />

      {/* Cabeçalho + progresso */}
      <div className="mb-5 flex items-center gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="-ml-1 grid size-9 place-items-center rounded-xl text-suave hover:bg-tinta/[0.06]" aria-label="Voltar">
            <IconChevronLeft />
          </button>
        ) : (
          <Link href="/" className="-ml-1 grid size-9 place-items-center rounded-xl text-suave hover:bg-tinta/[0.06]" aria-label="Fechar">
            <IconX />
          </Link>
        )}
        <div className="flex-1">
          <p className="eyebrow">
            Passo {step + 1} de 3 · {STEPS[step]}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{["Onde vai ser?", "Quando?", "Tudo certo?"][step]}</h1>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className={`h-1 rounded-full transition-colors ${i <= step ? "bg-brand" : "bg-tinta/10"}`} />
        ))}
      </div>

      {state.message && !state.ok && (
        <div className="mb-4">
          <Alert>{state.message}</Alert>
        </div>
      )}

      {/* PASSO 1 — Local */}
      {step === 0 && (
        <div className="space-y-4 animate-rise">
          <label className="relative block">
            <span className="sr-only">Buscar bar ou bairro</span>
            <IconSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-apagado" size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar bar ou bairro" className={`${inputClass} pl-11`} />
          </label>

          <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5">
            <button
              type="button"
              onClick={() => setView((v) => (v === "mapa" ? "lista" : "mapa"))}
              aria-pressed={view === "mapa"}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${view === "mapa" ? "bg-texto text-noite" : "bg-tinta/[0.06] text-suave hover:bg-tinta/10"}`}
            >
              <IconMap size={16} />
              Mapa
            </button>
            <span className="h-5 w-px shrink-0 bg-tinta/10" aria-hidden />
            {[null, ...hoods].map((h) => (
              <button
                key={h ?? "todos"}
                type="button"
                onClick={() => setHood(h)}
                className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition ${hood === h ? "bg-texto text-noite" : "bg-tinta/[0.06] text-suave hover:bg-tinta/10"}`}
              >
                {h ?? "Todos"}
              </button>
            ))}
          </div>

          {view === "mapa" ? (
            <div className="space-y-3">
              <div className="relative isolate h-[min(26rem,calc(100dvh-24rem))] min-h-72 overflow-hidden rounded-[1.25rem] border border-tinta/10">
                <VenueMap venues={filtered} selectedId={venueId} onSelect={setVenueId} />
                {filtered.length === 0 && (
                  <p className="absolute inset-x-4 top-4 z-[500] rounded-xl bg-breu/90 px-3 py-2 text-center text-sm text-suave">Nenhum parceiro com esse filtro.</p>
                )}
              </div>
              {venue && filtered.some((v) => v.id === venue.id) ? (
                <VenueOption v={venue} selected onSelect={setVenueId} />
              ) : (
                <p className="text-center text-sm text-apagado">Toque num ponto do mapa para escolher o bar.</p>
              )}
            </div>
          ) : (
            <ul className="space-y-2.5" role="radiogroup" aria-label="Locais parceiros">
              {filtered.map((v) => (
                <li key={v.id}>
                  <VenueOption v={v} selected={v.id === venueId} onSelect={setVenueId} />
                </li>
              ))}
              {filtered.length === 0 && <li className="py-8 text-center text-sm text-suave">Nenhum parceiro encontrado com esse filtro.</li>}
            </ul>
          )}
        </div>
      )}

      {/* PASSO 2 — Data e hora */}
      {step === 1 && venue && (
        <div className="space-y-6 animate-rise">
          <div className="surface flex items-center gap-3 p-3">
            <VenueMark venue={venue} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{venue.name}</p>
              <p className="truncate text-xs text-apagado">{venue.openingHours}</p>
            </div>
            <button type="button" onClick={() => setStep(0)} className="text-sm font-semibold text-neon">
              Trocar
            </button>
          </div>

          <fieldset className="min-w-0">
            <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-suave">
              <IconCalendar size={16} /> Dia
            </legend>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {days.map((d) => {
                const active = d.key === date;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDate(d.key)}
                    aria-pressed={active}
                    className={`flex w-16 shrink-0 flex-col items-center rounded-2xl py-2.5 transition ${active ? "bg-texto text-noite" : "bg-tinta/[0.05] text-suave ring-1 ring-inset ring-tinta/10 hover:bg-tinta/[0.08]"}`}
                  >
                    <span className="text-[0.6875rem] font-semibold">{d.label}</span>
                    <span className="font-display text-xl font-bold">{d.day}</span>
                    <span className="text-[0.625rem] uppercase opacity-80">{d.month}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-suave">
              <IconClock size={16} /> Horário
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {TIMES.map((t) => {
                const ok = timeOk(t);
                const active = t === time;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!ok}
                    onClick={() => setTime(t)}
                    aria-pressed={active}
                    className={`h-11 rounded-xl text-sm font-semibold transition disabled:opacity-25 ${active ? "bg-texto text-noite" : "bg-tinta/[0.05] text-texto ring-1 ring-inset ring-tinta/10 hover:bg-tinta/[0.09]"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <label className="mt-3 flex items-center justify-between gap-3 text-sm text-suave">
              Outro horário
              <input
                type="time"
                value={time && !TIMES.includes(time) ? time : ""}
                onChange={(e) => e.target.value && setTime(e.target.value)}
                className={`${inputClass} !h-10 !w-32`}
              />
            </label>
            {time && !timeOk(time) && <p className="mt-2 text-xs text-erro">Marque com pelo menos {rules.minLeadMinutes} minutos de antecedência.</p>}
          </fieldset>

          {perkInfo?.perk && <PerkCard perk={perkInfo.perk} valid={perkInfo.valid} compact />}
        </div>
      )}

      {/* PASSO 3 — Revisão */}
      {step === 2 && venue && startsAt && (
        <div className="space-y-4 animate-rise">
          <div className="surface overflow-hidden">
            <div className="flex items-center gap-3.5 p-4">
              <VenueMark venue={venue} size="md" />
              <div className="min-w-0">
                <p className="text-lg font-semibold">{venue.name}</p>
                <p className="text-sm text-suave">{venue.address}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 border-t border-tinta/[0.06] text-sm">
              <div className="border-r border-tinta/[0.06] p-4">
                <dt className="eyebrow">Dia</dt>
                <dd className="mt-1 font-semibold">{capitalize(formatDayLong(startsAt))}</dd>
              </div>
              <div className="p-4">
                <dt className="eyebrow">Horário</dt>
                <dd className="mt-1 font-semibold">{time}</dd>
              </div>
            </dl>
          </div>

          {perkInfo?.perk && <PerkCard perk={perkInfo.perk} valid={perkInfo.valid} />}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-suave">Recado para a galera (opcional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={140}
              rows={2}
              placeholder="Ex.: Aniversário da Carol 🎂"
              className={`${inputClass} h-auto resize-none py-3`}
            />
          </label>

          <div className="rounded-2xl border border-tinta/10 bg-tinta/[0.03] p-4 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-suave">Valor do meet</span>
              <span className="font-display text-xl font-bold">{formatBRL(pricing.baseCents)}</span>
            </div>
            <p className="mt-1.5 text-apagado">
              Até {pricing.includedPeople} pessoas, +{formatBRL(pricing.extraPersonCents)} por pessoa extra. <strong className="font-semibold text-suave">Nada é cobrado agora:</strong> você paga no Pix quando fechar a lista.
            </p>
          </div>
        </div>
      )}

      {/* Barra de ação fixa no rodapé (mesma nos 3 passos): resumo à esquerda, botão à direita. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-tinta/[0.08] bg-breu/95 backdrop-blur-xl">
          <div className="mx-auto max-w-md px-5 pt-3 pb-safe">
            <div className="flex items-center gap-3 pb-1">
              <div className="min-w-0 flex-1 leading-tight">
                {step === 0 ? (
                  venue ? (
                    <>
                      <p className="truncate text-sm font-semibold">{venue.name}</p>
                      <p className="truncate text-xs text-suave">{venue.neighborhood}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-suave">Nenhum local</p>
                      <p className="truncate text-xs text-apagado">Escolha um bar parceiro</p>
                    </>
                  )
                ) : step === 1 && venue ? (
                  <>
                    <p className="truncate text-sm font-semibold">{venue.name}</p>
                    <p className={`truncate text-xs ${time && timeOk(time) ? "text-suave" : "text-apagado"}`}>
                      {time && timeOk(time) ? `${days.find((d) => d.key === date)?.label ?? ""} ${days.find((d) => d.key === date)?.day ?? ""} · ${time}` : "Escolha um horário"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold">{formatBRL(pricing.baseCents)}</p>
                    <p className="truncate text-xs text-apagado">Pago só ao fechar a lista</p>
                  </>
                )}
              </div>
              {step < 2 ? (
                <Button type="button" size="md" className="!h-11 !px-6" disabled={!canNext} onClick={() => setStep((s) => (s + 1) as Step)}>
                  Continuar
                </Button>
              ) : (
                <SubmitButton size="md" className="!h-11 !px-6" pendingLabel="Criando…">
                  Criar e convidar
                </SubmitButton>
              )}
            </div>
          </div>
      </div>
    </form>
  );
}
