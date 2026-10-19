"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/Bits";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";

export default function HowItWorks() {
  const { t } = useT();
  const [tab, setTab] = useState<"f" | "n">("f");
  const k = (x: string) => x as MessageKey;
  return (
    <>
      <PageHeader eyebrow={t("nav.how")} title={t("hiw.title")} sub={t("hiw.sub")} />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mx-auto flex w-fit max-w-full rounded-full bg-white p-1 shadow-soft">
          <button onClick={() => setTab("f")} aria-pressed={tab === "f"} className={`rounded-full px-4 py-2 font-bold sm:px-6 ${tab === "f" ? "bg-brand text-white" : ""}`}>{t("hiw.forFamilies")}</button>
          <button onClick={() => setTab("n")} aria-pressed={tab === "n"} className={`rounded-full px-4 py-2 font-bold sm:px-6 ${tab === "n" ? "bg-brand text-white" : ""}`}>{t("hiw.forNannies")}</button>
        </div>
        <ol className="mt-10 space-y-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <li key={i} className="card flex gap-4 p-6 sm:gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-heart text-xl font-black">{i}</span>
              <div className="min-w-0">
                <h2 className="text-xl font-black">{t(k(`hiw.${tab}${i}t`))}</h2>
                <p className="mt-1 text-ink/75">{t(k(`hiw.${tab}${i}d`))}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href={tab === "f" ? "/signup?role=family" : "/signup?role=nanny"} className="btn-primary text-lg">{tab === "f" ? t("hero.find") : t("hero.become")}</Link>
        </div>
      </div>
    </>
  );
}
