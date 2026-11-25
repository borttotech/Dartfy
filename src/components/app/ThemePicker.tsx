"use client";

import { useState } from "react";
import { IconCheck } from "@/components/ui/icons";
import { THEME_COLOR, THEME_COOKIE, THEMES, type ThemeId } from "@/lib/theme";

/**
 * Troca o tema na hora (atributo data-theme no <html>) e salva no cookie
 * para o servidor já renderizar certo na próxima visita.
 * TODO(produção): salvar também no perfil para acompanhar o usuário entre aparelhos.
 */
export function ThemePicker({ current }: { current: ThemeId }) {
  const [theme, setTheme] = useState<ThemeId>(current);

  function choose(id: ThemeId) {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    document.cookie = `${THEME_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[id]);
  }

  return (
    <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Tema do app">
      {THEMES.map((t) => {
        const active = t.id === theme;
        const [bg, mid, fg] = t.swatch;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(t.id)}
            className={`rounded-2xl p-1.5 text-left transition ${active ? "ring-2 ring-texto" : "ring-1 ring-tinta/10 hover:ring-tinta/25"}`}
          >
            {/* Mini prévia do tema */}
            <span className="relative block h-20 overflow-hidden rounded-xl" style={{ background: bg }}>
              <span className="absolute top-2.5 left-2.5 h-1.5 w-8 rounded-full" style={{ background: fg, opacity: 0.85 }} />
              <span className="absolute inset-x-2.5 top-6 h-6 rounded-md" style={{ background: mid, border: `1px solid ${fg}22` }} />
              <span
                className="absolute inset-x-2.5 bottom-2.5 h-4 rounded-md"
                style={{ background: t.id === "dartfy" ? "linear-gradient(100deg,#ff3fd0,#d046ff,#a24bff)" : fg }}
              />
              {active && (
                <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-texto text-noite">
                  <IconCheck size={12} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="mt-2 block px-1 text-sm font-semibold">{t.name}</span>
            <span className="block px-1 pb-1 text-[0.6875rem] leading-snug text-apagado">{t.description}</span>
          </button>
        );
      })}
    </div>
  );
}
