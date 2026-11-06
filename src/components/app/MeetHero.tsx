import type { ReactNode } from "react";
import { IconCalendar, IconMapArrow, IconPin } from "@/components/ui/icons";
import { VenueCover, VenueMark } from "@/components/ui/VenueMark";
import { capitalize, formatDayLong, formatTime } from "@/lib/format";
import type { MeetView } from "@/lib/types";
import { mapsUrl } from "@/lib/venues";

/** Topo do meet: capa nas cores do bar, local, data e rota. Usado no convite público e no detalhe. */
export function MeetHero({ meet, eyebrow, top }: { meet: MeetView; eyebrow?: ReactNode; top?: ReactNode }) {
  return (
    <section className="relative -mx-5 overflow-hidden px-5 pt-5 pb-6">
      <VenueCover venue={meet.venue} />
      <div className="relative">
        {top}
        <div className="mt-10 flex items-end gap-4">
          <VenueMark venue={meet.venue} size="lg" />
          <div className="min-w-0 pb-1">
            {eyebrow}
            <h1 className="mt-1 text-[1.9rem] font-extrabold">{meet.venue.name}</h1>
          </div>
        </div>

        <div className="mt-5 grid gap-2.5">
          <div className="flex items-center gap-3 text-[0.9375rem]">
            <span className="grid w-5 place-items-center text-suave">
              <IconCalendar size={18} />
            </span>
            <span>
              <strong className="font-semibold">{capitalize(formatDayLong(meet.startsAt))}</strong>
              <span className="text-suave"> às {formatTime(meet.startsAt)}</span>
            </span>
          </div>
          <a href={mapsUrl(meet.venue)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-[0.9375rem]">
            <span className="grid w-5 place-items-center text-suave">
              <IconPin size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-suave">
              {meet.venue.address} · {meet.venue.neighborhood}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-suave group-hover:underline">
              <IconMapArrow size={14} /> Rota
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
