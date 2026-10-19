"use client";

import { useState } from "react";
import { RequireRole } from "@/components/Area";
import { getNanny } from "@/lib/data";
import { LANGS, useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";

function Settings() {
  const { bookings, user, reset } = useStore();
  const { lang, setLang, t, money, date: fmtDate } = useT();
  const [sms, setSms] = useState(true);
  const [email, setEmail] = useState(true);
  const paid = bookings.filter((b) => !["rejected", "expired"].includes(b.status));

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ user, bookings }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-imdayak-data.json";
    a.click();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-black">{t("set.title")}</h1>
      <section className="card p-6">
        <h2 className="text-xl font-black">{t("set.card")}</h2>
        <p className="mt-2 text-sm text-ink/70">{t("set.cardNote")}</p>
        <div className="mt-3 inline-flex flex-wrap items-center gap-3 rounded-xl bg-brand-light px-4 py-3 font-bold">💳 ArCa •••• 4242 <span className="text-xs text-ink/60">{t("set.testCard")}</span></div>
      </section>
      <section className="card p-6">
        <h2 className="text-xl font-black">{t("set.payments")}</h2>
        <div className="-mx-6 overflow-x-auto px-6">
        <table className="mt-3 w-full min-w-[560px] text-sm">
          <thead><tr className="text-left text-ink/60"><th className="py-1">{t("th.date")}</th><th>{t("th.nanny")}</th><th>{t("th.type")}</th><th>{t("th.status")}</th><th className="text-right">{t("th.amount")}</th></tr></thead>
          <tbody>
            {paid.length === 0 && <tr><td colSpan={5} className="py-3 text-ink/60">{t("set.none")}</td></tr>}
            {paid.map((b) => (
              <tr key={b.id} className="border-t border-ink/5">
                <td className="py-2">{fmtDate(b.date)}</td><td>{getNanny(b.nannyId)?.firstName}</td><td>{t(`type.${b.type}`)}</td><td>{t(`status.${b.status}`)}{b.refund !== undefined ? ` (${t("set.refund", { amount: money(b.refund) })})` : ""}</td>
                <td className="whitespace-nowrap text-right font-bold">{money(b.nannyPrice + b.serviceFee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="mt-2 text-xs text-ink/60">{t("set.receipt")}</p>
      </section>
      <section className="card space-y-3 p-6">
        <h2 className="text-xl font-black">{t("set.notif")}</h2>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand" checked={sms} onChange={(e) => setSms(e.target.checked)} /> {t("set.sms")}</label>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand" checked={email} onChange={(e) => setEmail(e.target.checked)} /> {t("set.email")}</label>
        <div className="flex flex-wrap gap-2">{LANGS.map((l) => <button key={l.id} lang={l.id} aria-pressed={lang === l.id} onClick={() => setLang(l.id)} className={`rounded-full px-4 py-1.5 font-bold ${lang === l.id ? "bg-brand text-white" : "bg-brand-light"}`}>{l.name}</button>)}</div>
      </section>
      <section className="card space-y-3 p-6">
        <h2 className="text-xl font-black">{t("set.data")}</h2>
        <p className="text-sm text-ink/70">{t("set.dataNote")}</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost btn-sm" onClick={exportData}>{t("set.download")}</button>
          <button className="btn-sm btn bg-bad/10 text-bad" onClick={() => confirm(t("set.confirmReset")) && reset()}>{t("set.delete")}</button>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return <RequireRole role="family"><Settings /></RequireRole>;
}
