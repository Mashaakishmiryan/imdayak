"use client";

import { useT } from "@/lib/i18n";
import { priceBreakdown } from "@/lib/pricing";
import { useMine } from "../useMine";

export default function Earnings() {
  const { mine, now } = useMine();
  const { t, money, date: fmtDate } = useT();
  const rows = mine
    .filter((b) => ["accepted", "inProgress", "completed", "disputed", "cancelled"].includes(b.status))
    .map((b) => {
      const p = priceBreakdown(b.nannyPrice);
      let state: "upcoming" | "pending" | "paid" | "none" = "none";
      let amount = p.payout;
      if (b.status === "accepted" || b.status === "inProgress") state = "upcoming";
      else if (b.status === "disputed") state = "pending";
      else if (b.status === "completed") state = now - (b.checkOutAt ?? now) > 24 * 3_600_000 ? "paid" : "pending";
      else if (b.status === "cancelled" && b.refund !== undefined && b.refund < b.nannyPrice + b.serviceFee) {
        // Late family cancellation → nanny keeps the non-refunded share (minus commission)
        amount = Math.round((b.nannyPrice + b.serviceFee - b.refund) / 1.1 * 0.9);
        state = "pending";
      }
      return { b, p, state, amount };
    })
    .filter((r) => r.state !== "none");
  const sum = (s: string) => rows.filter((r) => r.state === s).reduce((t, r) => t + r.amount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("earn.title")}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[[t("earn.upcoming"), sum("upcoming")], [t("earn.pending"), sum("pending")], [t("earn.paid"), sum("paid")]].map(([l, v]) => (
          <div key={l as string} className="card min-w-0 p-5"><p className="text-sm font-bold text-ink/60">{l}</p><p className="break-words text-2xl font-black text-brand-dark">{money(v as number)}</p></div>
        ))}
      </div>
      <div className="card mt-6 overflow-x-auto p-5">
        <table className="w-full min-w-[600px] text-sm">
          <thead><tr className="text-left text-ink/60"><th className="py-1">{t("th.date")}</th><th>{t("th.family")}</th><th>{t("th.price")}</th><th>{t("th.commission")}</th><th>{t("th.status")}</th><th className="text-right">{t("th.youGet")}</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="py-4 text-ink/60">{t("earn.none")}</td></tr>}
            {rows.map(({ b, p, state, amount }) => (
              <tr key={b.id} className="border-t border-ink/5">
                <td className="py-2">{fmtDate(b.date)}</td><td>{b.familyName}</td><td className="whitespace-nowrap">{money(p.base)}</td><td className="whitespace-nowrap">−{money(p.commission)}</td><td>{t(`earn.state.${state as "upcoming" | "pending" | "paid"}`)}</td><td className="whitespace-nowrap text-right font-bold">{money(amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card mt-6 p-5">
        <h2 className="font-black">{t("earn.payoutTitle")}</h2>
        <p className="mt-1 text-sm text-ink/70">{t("earn.payoutNote")}</p>
        <p className="mt-3 inline-block rounded-xl bg-brand-light px-4 py-2 font-bold">{t("earn.card")}</p>
      </div>
    </div>
  );
}
