import { Avatar } from "@/components/ui/Avatar";
import { guestStatusLabel, Pill } from "@/components/ui/misc";
import type { MeetView } from "@/lib/types";

const ORDER = { checked_in: 0, accepted: 1, invited: 2, declined: 3 } as const;

export function GuestList({ meet, userId }: { meet: MeetView; userId: string }) {
  const people = [...meet.people].sort((a, b) => (a.role === "host" ? -1 : b.role === "host" ? 1 : ORDER[a.status] - ORDER[b.status]));
  return (
    <ul className="surface divide-y divide-tinta/[0.06]">
      {people.map((p) => {
        const s = guestStatusLabel[p.status];
        return (
          <li key={p.userId} className={`flex items-center gap-3 px-4 py-3 ${p.status === "declined" ? "opacity-55" : ""}`}>
            <Avatar id={p.userId} name={p.profile.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {p.profile.name}
                {p.userId === userId && <span className="text-apagado"> (você)</span>}
              </p>
              {p.role === "host" && <p className="text-xs text-apagado">Anfitrião</p>}
            </div>
            <Pill tone={s.tone}>{s.label}</Pill>
          </li>
        );
      })}
    </ul>
  );
}
