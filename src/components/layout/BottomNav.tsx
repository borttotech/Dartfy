"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconGlass, IconHome, IconPlus, IconTicket, IconUser } from "@/components/ui/icons";

const items = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/convites", label: "Convites", icon: IconTicket },
  { href: "/criar", label: "Criar", icon: IconPlus, primary: true },
  { href: "/meets", label: "Meets", icon: IconGlass },
  { href: "/perfil", label: "Perfil", icon: IconUser },
] as const;

export function BottomNav({ pendingInvites }: { pendingInvites: number }) {
  const pathname = usePathname();
  // Fluxo de criação é tela cheia: o wizard tem sua própria barra de ação.
  if (pathname.startsWith("/criar")) return null;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md px-3 pb-safe">
        <ul className="flex items-end justify-between rounded-[1.6rem] border border-tinta/10 bg-breu/85 px-2 pt-2 pb-2 shadow-[0_-10px_40px_-14px_rgb(0_0_0/0.45)] backdrop-blur-xl">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            if ("primary" in item) {
              return (
                <li key={item.href} className="flex-1">
                  <Link href={item.href} className="group flex flex-col items-center gap-1" aria-current={active ? "page" : undefined}>
                    <span className="-mt-6 grid size-14 place-items-center rounded-2xl bg-brand text-sobre-brand glow-neon ring-4 ring-noite transition group-active:scale-95">
                      <Icon size={26} strokeWidth={2.2} />
                    </span>
                    <span className={`text-[0.6875rem] font-semibold ${active ? "text-texto" : "text-apagado"}`}>{item.label}</span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${active ? "text-texto" : "text-apagado hover:text-suave"}`}
                >
                  <span className="relative">
                    <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                    {item.href === "/convites" && pendingInvites > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 grid min-w-4.5 place-items-center rounded-full bg-neon px-1 text-[0.625rem] font-bold leading-4.5 text-sobre-brand ring-2 ring-breu">
                        {pendingInvites}
                      </span>
                    )}
                  </span>
                  <span className="text-[0.6875rem] font-semibold">{item.label}</span>
                  {active && <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-brand" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
