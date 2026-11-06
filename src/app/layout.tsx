import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { SITE_URL, site } from "@/config/site";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-outfit", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta", display: "swap" });

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
