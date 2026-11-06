import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth";
import { isDemoMode, repo } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const meets = await repo().listMeetsForUser(user.id);
  const pending = meets.filter((m) => m.status === "open" && m.guests.some((g) => g.userId === user.id && g.status === "invited")).length;

  return (
    <div className="ambient min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-noite/70 px-5 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 backdrop-blur-xl">
          <Link href="/" aria-label="Início">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            {isDemoMode && <span className="text-xs text-apagado">demo</span>}
            <Link href="/perfil" aria-label="Meu perfil">
              <Avatar id={user.id} name={user.name} size="sm" />
            </Link>
          </div>
        </header>
        <main className="flex-1 px-5 pt-2 pb-36">{children}</main>
      </div>
      <BottomNav pendingInvites={pending} />
    </div>
  );
}
