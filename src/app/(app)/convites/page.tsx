import type { Metadata } from "next";
import { MeetCard } from "@/components/app/MeetCard";
import { Tabs } from "@/components/app/Tabs";
import { ButtonLink } from "@/components/ui/Button";
import { IconTicket } from "@/components/ui/icons";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { isGoing } from "@/lib/meets/rules";

export const metadata: Metadata = { title: "Convites" };

export default async function InvitesPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { aba } = await searchParams;
  const user = (await getCurrentUser())!;
  const meets = (await repo().listMeetsForUser(user.id)).filter((m) => m.hostId !== user.id);
  const now = Date.now();
  const isPast = (iso: string) => new Date(iso).getTime() < now - 6 * 3_600_000;

  const me = (m: (typeof meets)[number]) => m.people.find((p) => p.userId === user.id)!;
  const groups = {
    pendentes: meets.filter((m) => me(m).status === "invited" && m.status === "open" && !isPast(m.startsAt)),
    confirmados: meets.filter((m) => isGoing(me(m)) && !isPast(m.startsAt) && m.status !== "cancelled" && m.status !== "finished"),
    anteriores: meets.filter((m) => isPast(m.startsAt) || m.status === "finished" || m.status === "cancelled" || me(m).status === "declined").reverse(),
  };
  const tab = (aba && aba in groups ? aba : groups.pendentes.length ? "pendentes" : "confirmados") as keyof typeof groups;
  const list = groups[tab];

  return (
    <div>
      <PageHeader title="Convites" subtitle="Rolês para os quais te chamaram." />
      <Tabs
        base="/convites"
        current={tab}
        tabs={[
          { key: "pendentes", label: "Pendentes", count: groups.pendentes.length },
          { key: "confirmados", label: "Vou" },
          { key: "anteriores", label: "Anteriores" },
        ]}
      />
      {list.length ? (
        <div className="space-y-3">
          {list.map((m) => (
            <MeetCard key={m.id} meet={m} userId={user.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IconTicket size={26} />}
          title={tab === "pendentes" ? "Nenhum convite esperando resposta" : tab === "confirmados" ? "Nenhum rolê confirmado" : "Nada por aqui ainda"}
          text="Quando alguém te mandar um link do Dartfy, o convite aparece aqui. Ou tome a iniciativa e chame a galera."
          action={
            <ButtonLink href="/criar" block>
              Criar um meet
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
