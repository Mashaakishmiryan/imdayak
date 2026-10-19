"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/Bits";
import { useT } from "@/lib/i18n";
import { priceBreakdown } from "@/lib/pricing";

export default function Pricing() {
  const { t, money } = useT();
  const [hours, setHours] = useState(2);
  const [rate, setRate] = useState(2500);
  const p = priceBreakdown(hours * rate);
  const rows: [string, string, string][] = [
    [t("price.c1"), "100%", "0%"],
    [t("price.c2"), "50%", "50%"],
    [t("price.c3"), "0%", "100%"],
    [t("price.c4"), t("price.rematch"), t("price.strike")],
  ];
  return (
    <>
      <PageHeader eyebrow={t("nav.pricing")} title={t("price.title")} sub={t("price.sub")} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        <section className="card min-w-0 p-7">
          <h2 className="text-2xl font-black">{t("price.calc")}</h2>
          <label className="mt-5 block"><span className="label">{t("price.hours", { n: hours })}</span><input type="range" min={1} max={8} value={hours} onChange={(e) => setHours(+e.target.value)} className="w-full accent-brand" /></label>
          <label className="mt-3 block"><span className="label">{t("price.rate", { price: money(rate) })}</span><input type="range" min={1500} max={4000} step={100} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full accent-brand" /></label>
          <dl className="mt-6 space-y-2">
            <div className="flex justify-between gap-3"><dt>{t("price.line", { h: hours, price: money(rate) })}</dt><dd className="whitespace-nowrap font-bold">{money(p.base)}</dd></div>
            <div className="flex justify-between gap-3"><dt>{t("book.fee")}</dt><dd className="whitespace-nowrap font-bold">{money(p.fee)}</dd></div>
            <div className="flex justify-between gap-3 border-t border-ink/10 pt-2 text-xl"><dt className="font-black">{t("price.youPay")}</dt><dd className="whitespace-nowrap font-black text-brand-dark">{money(p.total)}</dd></div>
            <div className="flex justify-between gap-3 text-sm text-ink/60"><dt>{t("price.nannyGets")}</dt><dd className="whitespace-nowrap">{money(p.payout)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-ink/60">{t("price.dayNote")}</p>
        </section>
        <section className="min-w-0 space-y-6">
          <div className="card p-7">
            <h2 className="text-2xl font-black">{t("price.howTitle")}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink/80">
              {(["price.how1", "price.how2", "price.how3", "price.how4"] as const).map((x) => <li key={x}>{t(x)}</li>)}
            </ol>
            <p className="mt-3 text-sm text-ink/60">{t("price.methods")}</p>
          </div>
          <div className="card p-7">
            <h2 className="text-2xl font-black">{t("price.cancelTitle")}</h2>
            {/* Stacked rows instead of a 3-column table: long Russian/Armenian labels fit at 320 px */}
            <dl className="mt-3 divide-y divide-ink/5 text-sm">
              {rows.map(([when, refund, nanny]) => (
                <div key={when} className="grid gap-1 py-2 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-3">
                  <dt className="font-bold">{when}</dt>
                  <dd><span className="text-ink/50 sm:hidden">{t("price.th2")}: </span>{refund}</dd>
                  <dd><span className="text-ink/50 sm:hidden">{t("price.th3")}: </span>{nanny}</dd>
                </div>
              ))}
            </dl>
            <div className="hidden border-t border-ink/10 pt-2 text-xs text-ink/50 sm:grid sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-3">
              <span>{t("price.th1")}</span><span>{t("price.th2")}</span><span>{t("price.th3")}</span>
            </div>
          </div>
        </section>
      </div>
      <div className="text-center"><Link href="/family/matches" className="btn-primary">{t("hero.find")}</Link></div>
    </>
  );
}
