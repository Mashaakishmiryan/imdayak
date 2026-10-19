"use client";

import type { Lang } from "@/i18n/config";
import { LangProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <LangProvider initialLang={lang}>
      <StoreProvider>{children}</StoreProvider>
    </LangProvider>
  );
}
