"use client";

import Link from "next/link";
import { useState } from "react";
import { HeroIllustration } from "@/components/Illustration";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";

const ICONS = ["💰", "📍", "🛡️", "💳", "⭐"];

export default function BecomeANanny() {
  const { t, money } = useT();
  const [rate, setRate] = useState(2500);
  const [hours, setHours] = useState(20);
  const monthly = rate * hours * 4.3 * 0.9;
  return (
    <>
      <section className="bg-brand-light/60">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div className="min-w-0">
            <p className="font-bold text-brand-dark">{t("bec.eyebrow")}</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">{t("bec.title")}</h1>
            <p className="mt-4 text-lg text-ink/75">{t("bec.sub")}</p>
            <Link href="/signup?role=nanny" className="btn-primary mt-6 text-lg">{t("hero.become")}</Link>
          </div>
          <HeroIllustration className="mx-auto w-full max-w-sm" label={t("hero.illustration")} />
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.1fr_1fr]">
        <section className="card min-w-0 p-7">
          <h2 className="text-2xl font-black">{t("bec.calc")}</h2>
          <label className="mt-5 block"><span className="label">{t("bec.rate", { price: money(rate) })}</span><input type="range" min={1500} max={4500} step={100} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full accent-brand" /></label>
          <label className="mt-3 block"><span className="label">{t("bec.hours", { n: hours })}</span><input type="range" min={4} max={50} value={hours} onChange={(e) => setHours(+e.target.value)} className="w-full accent-brand" /></label>
          <p className="mt-6 text-sm font-bold text-ink/60">{t("bec.could")}</p>
          <p className="text-4xl font-black text-brand-dark"><span className="whitespace-nowrap">{money(monthly)}</span> <span className="text-lg text-ink/60">{t("bec.month")}</span></p>
          <p className="mt-2 text-xs text-ink/60">{t("bec.note")}</p>
        </section>
        <section className="min-w-0 space-y-3">
          {ICONS.map((e, i) => (
            <div key={e} className="card flex gap-4 p-5">
              <span className="shrink-0 text-3xl">{e}</span>
              <div className="min-w-0"><b>{t(`bec.${i + 1}t` as MessageKey)}</b><p className="text-sm text-ink/70">{t(`bec.${i + 1}d` as MessageKey)}</p></div>
            </div>
          ))}
        </section>
      </div>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-2xl font-black">{t("bec.needTitle")}</h2>
        <p className="mt-2 text-ink/75">{t("bec.needText")}</p>
        <Link href="/signup?role=nanny" className="btn-heart mt-6">{t("bec.start")}</Link>
      </div>
    </>
  );
}
