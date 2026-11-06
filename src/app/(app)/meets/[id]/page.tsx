import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/app/ActionButton";
import { GuestList } from "@/components/app/GuestList";
import { MeetHero } from "@/components/app/MeetHero";
import { PerkCard } from "@/components/app/PerkCard";
import { ShareInvite } from "@/components/app/ShareInvite";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck, IconChevronLeft, IconQr, IconShield, IconWallet } from "@/components/ui/icons";
import { Alert, MeetStatusPill, SectionTitle } from "@/components/ui/misc";
import { pricing, SITE_URL } from "@/config/site";
import { requireUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { firstName, formatBRL, formatTime, pluralize, relativeDay } from "@/lib/format";
import { checkinBlockReason, guestOf, isGoing, peopleCount } from "@/lib/meets/rules";
import { meetPriceCents } from "@/lib/pricing";
import { qrSvg, voucherPayload } from "@/lib/qr";
import { headlinePerk } from "@/lib/venues";
import { cancelMeetAction, checkInAction, closeMeetAction } from "./actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string; pago?: string }> };

export const metadata: Metadata = { title: "Meet" };

const STAGES = [
  { key: "open", label: "Lista aberta" },
  { key: "closed", label: "Pix" },
  { key: "paid", label: "Confirmado" },
  { key: "here", label: "No bar" },
] as const;

export default async function MeetPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const user = await requireUser(`/meets/${id}`);
  const meet = await repo().getMeet(id);
  if (!meet || !guestOf(meet, user.id)) notFound();

  const me = guestOf(meet, user.id)!;
  const isHost = meet.hostId === user.id;
  const people = peopleCount(meet);
  const price = meetPriceCents(people);
  const { perk, valid } = headlinePerk(meet.venue, new Date(meet.startsAt));
  const inviteUrl = `${SITE_URL}/c/${meet.code}`;
  const inviteText = `Bora? ${relativeDay(meet.startsAt)} às ${formatTime(meet.startsAt)} no ${meet.venue.name}.${perk ? ` Quem confirmar ganha: ${perk.title.toLowerCase()} 🍻` : ""}`;
  const checkinBlock = checkinBlockReason(meet, user.id);
  const voucher = me.status === "checked_in" ? await qrSvg(voucherPayload(meet.code, user.id)) : null;
  const stageIdx = meet.status === "open" ? 0 : meet.status === "closed" ? 1 : me.status === "checked_in" || meet.status === "finished" ? 3 : 2;
  const checkedIn = meet.people.filter((p) => p.status === "checked_in").length;

  return (
    <div className="space-y-7">
      <MeetHero
        meet={meet}
        top={
          <div className="flex items-center justify-between">
            <Link href="/meets" className="-ml-2 grid size-9 place-items-center rounded-xl bg-tinta/10 text-texto backdrop-blur hover:bg-tinta/15" aria-label="Voltar">
              <IconChevronLeft />
            </Link>
            <MeetStatusPill status={meet.status} />
          </div>
        }
        eyebrow={<p className="text-sm text-suave">{isHost ? "Você organiza" : `Meet de ${firstName(meet.host.name)}`}</p>}
      />

      {sp.novo && meet.status === "open" && (
        <div className="animate-pop">
          <Alert tone="ok">
            <strong className="font-semibold">Meet criado!</strong> Agora mande o convite. A galera confirma pelo link, sem baixar nada.
          </Alert>
        </div>
      )}
      {sp.pago && meet.status === "paid" && (
        <div className="animate-pop">
          <Alert tone="ok">
            <strong className="font-semibold">Pagamento confirmado!</strong> Cortesias liberadas para {pluralize(people, "pessoa", "pessoas")}.
          </Alert>
        </div>
      )}

      {meet.status !== "cancelled" && (
        <ol className="grid grid-cols-4 gap-1.5" aria-label="Andamento do meet">
          {STAGES.map((s, i) => (
            <li key={s.key} className="space-y-1.5">
              <span className={`block h-1 rounded-full ${i <= stageIdx ? "bg-brand" : "bg-tinta/10"}`} />
              <span className={`block text-[0.6875rem] font-semibold ${i === stageIdx ? "text-texto" : "text-apagado"}`}>{s.label}</span>
            </li>
          ))}
        </ol>
      )}

      {meet.message && <blockquote className="border-l-2 border-neon/60 pl-4 text-suave italic">“{meet.message}”</blockquote>}

      {/* No bar: QR de check-in */}
      {voucher && (
        <section className="surface overflow-hidden p-5 text-center animate-pop">
          <p className="eyebrow">Check-in feito</p>
          <h2 className="mt-1 text-xl font-bold">Mostre este QR ao garçom</h2>
          <div className="mx-auto mt-4 w-56 rounded-2xl bg-white p-3" dangerouslySetInnerHTML={{ __html: voucher }} />
          {perk && <p className="mt-4 text-sm text-suave">Vale: <strong className="text-texto">{perk.title}</strong></p>}
          <p className="mt-1 text-xs text-apagado">
            {checkedIn} de {people} já chegaram
          </p>
        </section>
      )}

      {meet.status === "paid" && me.status !== "checked_in" && (
        <section className="surface p-5">
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-ok">
              <IconQr size={22} />
            </span>
            <div>
              <h2 className="font-semibold">Chegou no {meet.venue.name}?</h2>
              <p className="text-sm text-suave">{checkinBlock ?? "Faça o check-in para liberar sua cortesia."}</p>
            </div>
          </div>
          {!checkinBlock && (
            <div className="mt-4">
              <ActionButton action={checkInAction} fields={{ meetId: meet.id }} variant="success" pendingLabel="Confirmando…" icon={<IconCheck size={20} strokeWidth={2.4} />}>
                Fazer check-in
              </ActionButton>
            </div>
          )}
        </section>
      )}

      {/* Anfitrião: convidar */}
      {isHost && meet.status === "open" && (
        <section>
          <SectionTitle>Chame a galera</SectionTitle>
          <ShareInvite url={inviteUrl} text={inviteText} />
        </section>
      )}

      {perk && <PerkCard perk={perk} valid={valid} />}

      <section>
        <SectionTitle action={<span className="text-sm text-suave">{pluralize(people, "confirmado", "confirmados")}</span>}>Quem vai</SectionTitle>
        <GuestList meet={meet} userId={user.id} />
      </section>

      {/* Anfitrião: fechar e pagar */}
      {isHost && meet.status === "open" && (
        <section className="surface space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Fechar a lista</h2>
              <p className="mt-0.5 text-sm text-suave">
                Quem não respondeu sai da lista. {people > pricing.includedPeople ? `Inclui ${people - pricing.includedPeople} pessoa(s) extra.` : `Até ${pricing.includedPeople} pessoas pelo preço base.`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold">{formatBRL(price)}</p>
              <p className="text-xs text-apagado">{pluralize(people, "pessoa", "pessoas")}</p>
            </div>
          </div>
          <ActionButton action={closeMeetAction} fields={{ meetId: meet.id }} pendingLabel="Gerando Pix…" icon={<IconWallet size={20} />}>
            Fechar e pagar {formatBRL(price)}
          </ActionButton>
          <p className="flex items-center justify-center gap-1.5 text-xs text-apagado">
            <IconShield size={14} /> Pagamento via Pix com Mercado Pago
          </p>
        </section>
      )}

      {isHost && meet.status === "closed" && (
        <ButtonLink href={`/meets/${meet.id}/pagamento`} block size="lg" icon={<IconWallet size={20} />}>
          Pagar {formatBRL(meet.payment?.amountCents ?? price)} no Pix
        </ButtonLink>
      )}

      {!isHost && me.status === "invited" && meet.status === "open" && (
        <ButtonLink href={`/c/${meet.code}`} block size="lg">
          Responder convite
        </ButtonLink>
      )}

      {!isHost && isGoing(me) && (meet.status === "open" || meet.status === "closed") && (
        <Alert tone="anil">
          Presença confirmada. Avisaremos quando {firstName(meet.host.name)} fechar a lista e as cortesias forem liberadas.
        </Alert>
      )}

      {isHost && (meet.status === "open" || meet.status === "closed") && (
        <div className="pt-2">
          <ActionButton action={cancelMeetAction} fields={{ meetId: meet.id }} variant="ghost" size="md" confirm="Cancelar este meet? Todos os convidados serão avisados.">
            Cancelar meet
          </ActionButton>
        </div>
      )}
    </div>
  );
}
