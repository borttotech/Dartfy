import Link from "next/link";
import { AvatarStack } from "@/components/ui/Avatar";
import { IconChevronRight, IconGift } from "@/components/ui/icons";
import { MeetStatusPill, Pill } from "@/components/ui/misc";
import { VenueMark } from "@/components/ui/VenueMark";
import { firstName, formatTime, relativeDay } from "@/lib/format";
import { isGoing } from "@/lib/meets/rules";
import type { MeetView } from "@/lib/types";
import { headlinePerk } from "@/lib/venues";

/** Card compacto de meet para listas (Início, Convites, Meets). */
export function MeetCard({ meet, userId, href }: { meet: MeetView; userId: string; href?: string }) {
  const going = meet.people.filter(isGoing).map((p) => ({ id: p.userId, name: p.profile.name }));
  const me = meet.people.find((p) => p.userId === userId);
  const isHost = meet.hostId === userId;
  const { perk } = headlinePerk(meet.venue, new Date(meet.startsAt));
  const awaitingMe = me?.status === "invited" && meet.status === "open";

  return (
    <Link
      href={href ?? (awaitingMe ? `/c/${meet.code}` : `/meets/${meet.id}`)}
      className="surface group block p-4 transition hover:border-tinta/15 hover:bg-tinta/[0.04] active:scale-[0.99]"
    >
      <div className="flex gap-3.5">
        <VenueMark venue={meet.venue} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{meet.venue.name}</p>
              <p className="text-sm text-suave">
                {relativeDay(meet.startsAt)} · {formatTime(meet.startsAt)} · {meet.venue.neighborhood}
              </p>
            </div>
            <IconChevronRight className="mt-0.5 shrink-0 text-apagado transition group-hover:translate-x-0.5 group-hover:text-suave" size={18} />
          </div>

          {perk && (
            <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-suave">
              <IconGift size={15} className="shrink-0 text-neon" />
              <span className="truncate">{perk.title}</span>
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AvatarStack people={going} size="xs" max={4} />
              <span className="text-xs text-apagado">{isHost ? "Você organiza" : `por ${firstName(meet.host.name)}`}</span>
            </div>
            {awaitingMe ? <Pill tone="neon" dot>Responder</Pill> : <MeetStatusPill status={meet.status} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
