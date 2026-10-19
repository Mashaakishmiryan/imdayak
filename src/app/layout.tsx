import type { Metadata, Viewport } from "next";
import { Noto_Sans_Armenian, Nunito } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { getLang, getServerT } from "@/i18n/server";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "cyrillic"], weight: ["400", "600", "700", "800", "900"] });
const armenian = Noto_Sans_Armenian({ variable: "--font-armenian", subsets: ["armenian"], weight: ["400", "600", "700", "800", "900"] });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: { default: `ImDayak — ${t("hero.title1")} ${t("hero.title2")}`, template: "%s · ImDayak" },
    description: t("hero.sub"),
  };
}

export const viewport: Viewport = { themeColor: "#0C8FA0" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className={`${nunito.variable} ${armenian.variable} font-sans antialiased`}>
        <Providers lang={lang}>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
