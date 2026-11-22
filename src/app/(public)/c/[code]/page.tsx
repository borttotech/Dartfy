import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MeetHero } from "@/components/app/MeetHero";
import { PerkCard } from "@/components/app/PerkCard";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { IconCalendar, IconCheck, IconPlus } from "@/components/ui/icons";
import { Alert, Logo } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { firstName, formatTime, pluralize, relativeDay } from "@/lib/format";
import { guestOf, isGoing, joinBlockReason } from "@/lib/meets/rules";
import { headlinePerk } from "@/lib/venues";
import { RespondButtons } from "./RespondButtons";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const meet = await repo().getMeetByCode(code);
  if (!meet) return { title: "Convite" };
  const title = `${firstName(meet.host.name)} te chamou pro ${meet.venue.name}`;
  const description = `${relativeDay(meet.startsAt)} às ${formatTime(meet.startsAt)} · confirme pelo Dartfy e ganhe cortesia.`;
  return { title, description, openGraph: { title, description }, robots: { index: false } };
}

function calendarUrl(title: string, startIso: string, location: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = new Date(startIso);
  const end = new Date(start.getTime() + 3 * 3_600_000);
  const q = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${fmt(start)}/${fmt(end)}`, location });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export default async function InvitePage({ params }: Props) {
  const { code } = await params;
  const [meet, user] = await Promise.all([repo().getMeetByCode(code), getCurrentUser()]);
  if (!meet) notFound();
  if (user && meet.hostId === user.id) redirect(`/meets/${meet.id}`);

  // Registra que o convite foi aberto (aparece em "Convites" do usuário). Idempotente.
  if (user && meet.status === "open") await repo().markInviteSeen(meet.code, user.id);

  const me = guestOf(meet, user?.id);
  const going = meet.people.filter(isGoing);
  const block = joinBlockReason(meet);
  const { perk, valid } = headlinePerk(meet.venue, new Date(meet.startsAt));
  const accepted = me && isGoing(me);
  const declined = me?.status === "declined";

  return (
    <div className="pb-48">
      <MeetHero
        meet={meet}
        top={
          <div className="flex items-center justify-between">
            <Logo />
            {user && (
              <Link href="/" className="text-sm font-semibold text-suave hover:text-texto">
                Meus rolês
              </Link>
            )}
          </div>
        }
        eyebrow={
          <p className="flex items-center gap-2 text-sm text-suave">
            <Avatar id={meet.host.id} name={meet.host.name} size="xs" />
            <span>
              <strong className="font-semibold text-texto">{firstName(meet.host.name)}</strong> te chamou pra
            </span>
          </p>
        }
      />

      <div className="mt-1 space-y-6">
        {meet.message && <blockquote className="border-l-2 border-neon/60 pl-4 text-suave italic">“{meet.message}”</blockquote>}

        {perk && (
          <div>
            <p className="mb-2 text-sm font-semibold text-suave">Confirmando, você ganha</p>
            <PerkCard perk={perk} valid={valid} />
          </div>
        )}

        <section>
          <p className="mb-3 text-sm font-semibold text-suave">{going.length ? `${pluralize(going.length, "pessoa confirmada", "pessoas confirmadas")}` : "Seja o primeiro a confirmar"}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-3">
            {going.map((p) => (
              <li key={p.userId} className="flex w-14 flex-col items-center gap-1.5 text-center">
                <Avatar id={p.userId} name={p.profile.name} size="md" />
                <span className="w-full truncate text-xs text-suave">{p.userId === user?.id ? "Você" : firstName(p.profile.name)}</span>
              </li>
            ))}
          </ul>
        </section>

        {accepted && (
          <section className="surface p-5 text-center animate-pop">
            <span className="mx-auto grid place-items-center text-ok">
              <IconCheck size={26} strokeWidth={2.4} />
            </span>
            <h2 className="mt-3 text-xl font-bold">Você está dentro!</h2>
            <p className="mt-1 text-sm text-suave">
              Quando {firstName(meet.host.name)} fechar a lista, sua cortesia é liberada. No bar, é só fazer o check-in.
            </p>
            <div className="mt-4 grid gap-2.5">
              <ButtonLink href={`/meets/${meet.id}`} variant="secondary" block>
                Ver detalhes do meet
              </ButtonLink>
              <a
                href={calendarUrl(`Meet no ${meet.venue.name}`, meet.startsAt, `${meet.venue.address}, ${meet.venue.city}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-suave hover:underline"
              >
                <IconCalendar size={16} /> Adicionar à agenda
              </a>
            </div>
          </section>
        )}

        {block && !accepted && <Alert tone="alerta">{block}</Alert>}

        <section className="rounded-[1.25rem] border border-tinta/[0.08] p-5">
          <p className="font-semibold">Quer organizar o seu?</p>
          <p className="mt-1 text-sm text-suave">Escolha um bar parceiro, chame os amigos e todo mundo ganha cortesia.</p>
          <ButtonLink href="/criar" variant="ghost" size="sm" className="-ml-3 mt-2 !text-neon" icon={<IconPlus size={16} />}>
            Criar meu meet
          </ButtonLink>
        </section>
      </div>

      {!block && !accepted && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-noite via-noite/95 to-transparent pt-10">
          <div className="mx-auto max-w-md px-5 pb-safe">
            <RespondButtons code={meet.code} declined={declined} loggedIn={Boolean(user)} />
          </div>
        </div>
      )}
    </div>
  );
}
