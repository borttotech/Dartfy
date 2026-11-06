import type { Metadata } from "next";
import { MeetCard } from "@/components/app/MeetCard";
import { Tabs } from "@/components/app/Tabs";
import { ButtonLink } from "@/components/ui/Button";
import { IconGlass, IconPlus } from "@/components/ui/icons";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { isGoing } from "@/lib/meets/rules";

export const metadata: Metadata = { title: "Meus meets" };

export default async function MeetsPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { aba } = await searchParams;
  const user = (await getCurrentUser())!;
  const all = await repo().listMeetsForUser(user.id);
  const now = Date.now();
  const done = (m: (typeof all)[number]) => m.status === "finished" || m.status === "cancelled" || new Date(m.startsAt).getTime() < now - 6 * 3_600_000;
  const mineOrGoing = all.filter((m) => m.hostId === user.id || m.people.some((p) => p.userId === user.id && isGoing(p)));

  const tab = aba === "historico" ? "historico" : "proximos";
  const list = tab === "proximos" ? mineOrGoing.filter((m) => !done(m)) : mineOrGoing.filter(done).reverse();

  return (
    <div>
      <PageHeader
        title="Meus meets"
        subtitle="Os que você organiza e os que vai."
        action={
          <ButtonLink href="/criar" size="sm" variant="secondary" icon={<IconPlus size={16} />}>
            Novo
          </ButtonLink>
        }
      />
      <Tabs base="/meets" current={tab} tabs={[{ key: "proximos", label: "Próximos" }, { key: "historico", label: "Histórico" }]} />
      {list.length ? (
        <div className="space-y-3">
          {list.map((m) => (
            <MeetCard key={m.id} meet={m} userId={user.id} href={`/meets/${m.id}`} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IconGlass size={26} />}
          title={tab === "proximos" ? "Nenhum meet marcado" : "Seu histórico aparece aqui"}
          text="Escolha um bar parceiro, marque o horário e mande o link no grupo."
          action={
            <ButtonLink href="/criar" block>
              Criar meet
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
