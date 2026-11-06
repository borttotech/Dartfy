import Link from "next/link";
import { MeetCard } from "@/components/app/MeetCard";
import { AvatarStack } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { IconChevronRight, IconGift, IconPlus, IconQr, IconShare, IconUsers } from "@/components/ui/icons";
import { SectionTitle } from "@/components/ui/misc";
import { VenueMark } from "@/components/ui/VenueMark";
import { pricing } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { countdown, firstName, formatBRL, formatTime, relativeDay } from "@/lib/format";
import { isGoing } from "@/lib/meets/rules";
import { perksFor } from "@/lib/venues";

export default async function HomePage() {
  const user = (await getCurrentUser())!;
  const [meets, venues] = await Promise.all([repo().listMeetsForUser(user.id), repo().listVenues()]);
  const now = new Date();

  const upcoming = meets.filter((m) => new Date(m.startsAt).getTime() > now.getTime() - 6 * 3_600_000 && m.status !== "cancelled" && m.status !== "finished");
  const invites = upcoming.filter((m) => m.status === "open" && m.people.some((p) => p.userId === user.id && p.status === "invited"));
  const next = upcoming.find((m) => m.people.some((p) => p.userId === user.id && isGoing(p)));
  const others = upcoming.filter((m) => m !== next && !invites.includes(m) && m.people.some((p) => p.userId === user.id && isGoing(p)));
  const tonight = venues.map((v) => ({ venue: v, perks: perksFor(v, now) })).filter((x) => x.perks.length > 0);

  return (
    <div className="space-y-8">
      <section className="animate-rise">
        <p className="text-suave">E aí, {firstName(user.name)} 👋</p>
        <h1 className="mt-1 text-[1.75rem] font-bold">
          Bora tirar o rolê do grupo?
        </h1>
      </section>

      {invites.map((m) => {
        const going = m.people.filter(isGoing).map((p) => ({ id: p.userId, name: p.profile.name }));
        return (
          <Link
            key={m.id}
            href={`/c/${m.code}`}
            className="surface block !border-neon/50 animate-rise"
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <VenueMark venue={m.venue} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">Convite pra você</p>
                  <p className="truncate font-semibold">
                    {firstName(m.host.name)} te chamou pro {m.venue.name}
                  </p>
                  <p className="text-sm text-suave">
                    {relativeDay(m.startsAt)} · {formatTime(m.startsAt)}
                  </p>
                </div>
                <IconChevronRight className="text-suave" />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-tinta/10 pt-3">
                <div className="flex items-center gap-2">
                  <AvatarStack people={going} size="xs" />
                  <span className="text-xs text-suave">{going.length} confirmados</span>
                </div>
                <span className="text-sm font-semibold text-neon">Responder →</span>
              </div>
            </div>
          </Link>
        );
      })}

      {next ? (
        <section>
          <SectionTitle action={<span className="text-sm font-semibold text-neon">{countdown(next.startsAt)}</span>}>Seu próximo meet</SectionTitle>
          <MeetCard meet={next} userId={user.id} />
          {others.length > 0 && (
            <div className="mt-3 space-y-3">
              {others.map((m) => (
                <MeetCard key={m.id} meet={m} userId={user.id} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="surface p-5">
          <p className="font-semibold">Nenhum meet marcado</p>
          <p className="mt-1 text-sm text-suave">Escolha um bar, chame a galera pelo WhatsApp e todo mundo ganha cortesia.</p>
        </section>
      )}

      <section className="surface p-5">
        <div>
          <h2 className="text-xl font-bold">Organize o próximo rolê</h2>
          <p className="mt-1.5 text-sm text-suave">
            {formatBRL(pricing.baseCents)} para até {pricing.includedPeople} pessoas. Cada um ganha cortesia no bar. Você só paga quando fechar a lista.
          </p>
          <ButtonLink href="/criar" block className="mt-4" icon={<IconPlus size={20} strokeWidth={2.2} />}>
            Criar meet
          </ButtonLink>
        </div>
      </section>

      {tonight.length > 0 && (
        <section>
          <SectionTitle>Cortesias valendo hoje</SectionTitle>
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
            {tonight.map(({ venue, perks }) => (
              <Link key={venue.id} href={`/criar?local=${venue.id}`} className="surface w-60 shrink-0 snap-start p-4 transition hover:border-tinta/15">
                <div className="flex items-center gap-3">
                  <VenueMark venue={venue} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{venue.name}</p>
                    <p className="truncate text-xs text-apagado">{venue.neighborhood}</p>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-sm text-suave">
                  <IconGift size={16} className="mt-0.5 shrink-0 text-neon" />
                  {perks[0].title}
                </p>
                <p className="mt-1 text-xs text-apagado">{perks[0].remainingToday} disponíveis hoje</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>Como funciona</SectionTitle>
        <ol className="surface divide-y divide-tinta/[0.06]">
          {[
            { icon: IconPlus, t: "Crie o meet", d: "Escolha o bar parceiro, o dia e o horário." },
            { icon: IconShare, t: "Chame a galera", d: "Mande o link no WhatsApp; cada um confirma em 1 toque." },
            { icon: IconUsers, t: "Feche a lista", d: `Pague ${formatBRL(pricing.baseCents)} no Pix e libere as cortesias.` },
            { icon: IconQr, t: "Check-in no bar", d: "Mostre o QR na chegada e aproveite." },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3.5 p-4">
              <span className="mt-0.5 shrink-0 text-apagado">
                <s.icon size={18} />
              </span>
              <div>
                <p className="font-semibold">
                  <span className="mr-1.5 text-apagado">{i + 1}.</span>
                  {s.t}
                </p>
                <p className="text-sm text-suave">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
