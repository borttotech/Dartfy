import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { SITE_URL, site } from "@/config/site";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

/*
 * Fontes locais (src/app/fonts, licença OFL). Não usar next/font/google:
 * ele baixa do Google durante o build e falha/trava em hosts sem esse acesso (ex.: Hostinger).
 */
const outfit = localFont({
  src: [
    { path: "./fonts/outfit-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/outfit-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/outfit-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/outfit-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-outfit",
  display: "swap",
});
const jakarta = localFont({
  src: [
    { path: "./fonts/jakarta-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jakarta-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/jakarta-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/jakarta-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
  openGraph: { type: "website", locale: site.locale, siteName: site.name, title: site.name, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#07061a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <html lang="pt-BR" data-theme={theme} className={`${outfit.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
