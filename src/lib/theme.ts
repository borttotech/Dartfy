/** Temas visuais do app (ver globals.css → TEMAS). */
export const THEMES = [
  { id: "dartfy", name: "Dartfy", description: "Neon noturno, a cara da marca.", swatch: ["#07061a", "#ff2bd6", "#5b7cfa"] },
  { id: "darkfy", name: "Darkfy", description: "Escuro e minimalista, sem neon.", swatch: ["#0b0b0c", "#1e1e22", "#f4f4f5"] },
  { id: "whitefy", name: "Whitefy", description: "Claro e minimalista.", swatch: ["#ffffff", "#f4f4f5", "#18181b"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_COOKIE = "dartfy-theme";
export const DEFAULT_THEME: ThemeId = "dartfy";

export function parseTheme(v: string | undefined | null): ThemeId {
  return THEMES.some((t) => t.id === v) ? (v as ThemeId) : DEFAULT_THEME;
}

/** Cor da barra do navegador/sistema por tema. */
export const THEME_COLOR: Record<ThemeId, string> = { dartfy: "#07061a", darkfy: "#0b0b0c", whitefy: "#ffffff" };
