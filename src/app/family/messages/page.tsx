"use client";

import { RequireRole } from "@/components/Area";
import { Chat } from "@/components/Chat";
import { useT } from "@/lib/i18n";

export default function Page() {
  const { t } = useT();
  return (
    <RequireRole role="family">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-black">{t("chat.title")}</h1>
        <Chat as="family" />
      </div>
    </RequireRole>
  );
}
