import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemePicker } from "@/components/app/ThemePicker";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";
import { Avatar } from "@/components/ui/Avatar";
import { IconLogout, IconPhone, IconShield } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { formatPhone } from "@/lib/format";
import { isGoing } from "@/lib/meets/rules";
import { signOutAction } from "./actions";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  const meets = await repo().listMeetsForUser(user.id);
  const hosted = meets.filter((m) => m.hostId === user.id && m.status !== "cancelled").length;
  const attended = meets.filter((m) => m.people.some((p) => p.userId === user.id && p.status === "checked_in")).length;
  const going = meets.filter((m) => m.people.some((p) => p.userId === user.id && isGoing(p))).length;
  const incomplete = !user.email || !user.birthDate;
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center pt-2 text-center">
        <Avatar id={user.id} name={user.name} size="lg" />
        <h1 className="mt-3 text-2xl font-bold">{user.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-suave">
          <IconPhone size={14} /> {formatPhone(user.phone)}
        </p>
      </section>

      <dl className="grid grid-cols-3 gap-2.5 text-center">
        {[
          { v: hosted, l: "organizados" },
          { v: going, l: "confirmados" },
          { v: attended, l: "check-ins" },
        ].map((s) => (
          <div key={s.l} className="surface py-3">
            <dd className="font-display text-2xl font-bold">{s.v}</dd>
            <dt className="text-xs text-apagado">{s.l}</dt>
          </div>
        ))}
      </dl>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold">Seus dados</h2>
        <p className="mt-1 mb-5 text-sm text-suave">
          {incomplete ? "Complete o perfil para os bares liberarem cortesias com mais rapidez." : "Tudo certo com seu cadastro."}
        </p>
        <ProfileForm profile={user} />
      </section>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold">Aparência</h2>
        <p className="mt-1 mb-4 text-sm text-suave">Escolha o visual do app neste aparelho.</p>
        <ThemePicker current={theme} />
      </section>

      <p className="flex items-start gap-2 px-1 text-xs text-apagado">
        <IconShield size={14} className="mt-0.5 shrink-0" />
        Seus dados não são compartilhados com os bares sem sua autorização. O telefone serve para login e para validar convites.
      </p>

      <form action={signOutAction} className="text-center">
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-apagado transition hover:bg-tinta/[0.05] hover:text-erro">
          <IconLogout size={16} /> Sair da conta
        </button>
      </form>
    </div>
  );
}
