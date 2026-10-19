"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/Bits";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";

const CATS = ["All", "Families", "Nannies", "Payments", "Safety"] as const;
/** Category of each FAQ entry faqp.{n}q / faqp.{n}a */
const ENTRIES: [number, (typeof CATS)[number]][] = [
  [1, "Families"], [2, "Families"], [3, "Families"], [4, "Families"],
  [5, "Payments"], [6, "Payments"], [7, "Payments"],
  [8, "Nannies"], [9, "Nannies"], [10, "Nannies"],
  [11, "Safety"], [12, "Safety"],
];

export default function FaqPage() {
  const { t, locale } = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  // Search the translated text, case-insensitively in the current locale (Armenian and Cyrillic have case too)
  const needle = q.toLocaleLowerCase(locale);
  const list = ENTRIES.map(([n, c]) => ({ n, c, q: t(`faqp.${n}q` as MessageKey), a: t(`faqp.${n}a` as MessageKey) })).filter(
    (e) => (cat === "All" || e.c === cat) && (e.q + " " + e.a).toLocaleLowerCase(locale).includes(needle),
  );
  return (
    <>
      <PageHeader eyebrow={t("faqp.eyebrow")} title={t("faqp.title")} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <input type="search" className="input text-lg" placeholder={t("faqp.search")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("faqp.search")} />
        <div className="mt-4 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`rounded-full px-4 py-1.5 text-sm font-bold ${cat === c ? "bg-brand text-white" : "bg-white shadow-soft"}`}>{t(`faqp.cat.${c}`)}</button>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {list.length === 0 && <p className="text-ink/60">{t("faqp.none")} <Link href="/about" className="font-bold text-brand-dark underline">{t("faqp.contact")}</Link></p>}
          {list.map((e) => (
            <details key={e.n} className="card p-5">
              <summary className="cursor-pointer font-black">{e.q} <span className="chip ml-2 text-xs">{t(`faqp.cat.${e.c}`)}</span></summary>
              <p className="mt-2 text-ink/75">{e.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
