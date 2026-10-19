"use client";

import { useState } from "react";
import { RequireRole } from "@/components/Area";
import { Avatar, StatusPill } from "@/components/Bits";
import type { MessageKey } from "@/i18n/en";
import { NANNIES, getNanny } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { hourLabel, priceBreakdown } from "@/lib/pricing";
import { useStore } from "@/lib/store";

const TABS = ["queue", "users", "bookings", "payments", "disputes", "reviews", "content", "reports"] as const;
type Tab = (typeof TABS)[number];

function Admin() {
  const { verifications, decideVerification, bookings, setStatus, now } = useStore();
  const { t, money, num, date: fmtDate } = useT();
  const [tab, setTab] = useState<Tab>("queue");
  const [blocked, setBlocked] = useState<string[]>([]);
  const [hiddenReviews, setHiddenReviews] = useState<string[]>([]);
  const [heroText, setHeroText] = useState(`${t("hero.title1")} ${t("hero.title2")}`);
  const queue = verifications.filter((v) => v.status === "review");
  const disputes = bookings.filter((b) => b.status === "disputed");

  const paidBookings = bookings.filter((b) => ["accepted", "inProgress", "completed", "disputed"].includes(b.status));
  const gmv = paidBookings.reduce((s, b) => s + b.nannyPrice + b.serviceFee, 0);
  const revenue = paidBookings.reduce((s, b) => s + b.serviceFee + priceBreakdown(b.nannyPrice).commission, 0);
  const decided = bookings.filter((b) => ["accepted", "rejected", "inProgress", "completed"].includes(b.status));
  const fromTop3 = bookings.filter((b) => b.matchScore !== undefined).length;
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

  const kpis: [MessageKey, string, string, number][] = [
    ["adm.kpi.nannies", String(NANNIES.length), "300+", NANNIES.length / 300],
    ["adm.kpi.top3", bookings.length ? `${Math.round((fromTop3 / bookings.length) * 100)}%` : "—", "60%+", bookings.length ? fromTop3 / bookings.length / 0.6 : 0],
    ["adm.kpi.accept", decided.length ? `${Math.round((decided.filter((b) => b.status !== "rejected").length / decided.length) * 100)}%` : "—", "—", 0],
    ["adm.kpi.rating", num(avg(NANNIES.map((n) => n.rating)), 2), `${num(4.6, 1)}+`, avg(NANNIES.map((n) => n.rating)) / 4.6],
    ["adm.kpi.queue", String(queue.length), "90% < 24 h", queue.length ? 0.5 : 1],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("adm.title")}</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[[t("adm.waiting"), queue.length], [t("adm.disputes"), disputes.length], [t("adm.gmv"), money(gmv)], [t("adm.revenue"), money(revenue)]].map(([l, v]) => (
          <div key={l as string} className="card min-w-0 p-5"><p className="text-sm font-bold text-ink/60">{l}</p><p className="break-words text-2xl font-black text-brand-dark">{v}</p></div>
        ))}
      </div>
      <div className="mt-6 flex gap-1 overflow-x-auto pb-2">
        {TABS.map((x) => (
          <button key={x} onClick={() => setTab(x)} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold ${tab === x ? "bg-ink text-white" : "bg-white shadow-soft"}`}>
            {t(`adm.tab.${x}`)}{x === "queue" && queue.length ? ` (${queue.length})` : ""}{x === "disputes" && disputes.length ? ` (${disputes.length})` : ""}
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto p-5">
        {tab === "queue" && (
          <ul className="space-y-3">
            {verifications.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-cream p-4">
                <div className="flex gap-2">
                  <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-brand-light text-2xl" title={t("adm.doc")}>🪪</div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blush text-2xl" title={t("adm.selfie")}>🤳</div>
                </div>
                <div className="min-w-0 flex-1">
                  <b>{v.name}</b> <span className="chip text-xs">{t(`role.${v.role}`)}</span>
                  <p className="text-sm text-ink/70">{t(v.reason)}</p>
                  <p className="text-xs text-ink/50">{t("adm.submitted", { h: Math.round((now - v.submitted) / 3_600_000) })}</p>
                </div>
                {v.status === "review" ? (
                  <div className="flex gap-2">
                    <button className="btn-primary btn-sm" onClick={() => decideVerification(v.id, true)}>{t("adm.approve")}</button>
                    <button className="btn btn-sm bg-bad/10 text-bad" onClick={() => decideVerification(v.id, false)}>{t("adm.reject")}</button>
                  </div>
                ) : (
                  <StatusPill status={v.status === "approved" ? "accepted" : "rejected"} />
                )}
              </li>
            ))}
          </ul>
        )}

        {tab === "users" && (
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="text-left text-ink/60"><th className="py-1">{t("th.name")}</th><th>{t("th.role")}</th><th>{t("th.city")}</th><th>{t("th.rating")}</th><th>{t("th.strikes")}</th><th /></tr></thead>
            <tbody>
              {NANNIES.map((n) => (
                <tr key={n.id} className="border-t border-ink/5">
                  <td className="flex items-center gap-2 py-2"><Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={30} /> {n.firstName} {n.lastName}</td>
                  <td>{t("role.nanny")}</td><td>{n.city}</td><td>★ {num(n.rating, 1)}</td><td>{n.cancellations}</td>
                  <td className="text-right">
                    <button onClick={() => setBlocked((b) => (b.includes(n.id) ? b.filter((x) => x !== n.id) : [...b, n.id]))} className={`btn btn-sm ${blocked.includes(n.id) ? "bg-bad text-white" : "bg-ink/5"}`}>{blocked.includes(n.id) ? t("adm.blocked") : t("adm.block")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {(tab === "bookings" || tab === "payments") && (
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-ink/60"><th className="py-1">{t("th.date")}</th><th>{t("th.family")}</th><th>{t("th.nanny")}</th><th>{t("th.status")}</th>{tab === "bookings" ? <><th>{t("th.time")}</th><th>{t("th.match")}</th></> : <><th>{t("th.charged")}</th><th>{t("th.refund")}</th><th>{t("th.payout")}</th></>}</tr></thead>
            <tbody>
              {bookings.length === 0 && <tr><td colSpan={7} className="py-4 text-ink/60">{t("adm.noBookings")}</td></tr>}
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-ink/5">
                  <td className="py-2">{fmtDate(b.date)}</td><td>{b.familyName}</td><td>{getNanny(b.nannyId)?.firstName}</td><td><StatusPill status={b.status} /></td>
                  {tab === "bookings" ? (
                    <><td>{hourLabel(b.startHour)} · {b.hours} h</td><td>{b.matchScore !== undefined ? `${b.matchScore}%` : "—"}</td></>
                  ) : (
                    <><td className="whitespace-nowrap">{["rejected", "expired", "pending"].includes(b.status) ? t("adm.heldReleased") : money(b.nannyPrice + b.serviceFee)}</td><td className="whitespace-nowrap">{b.refund !== undefined ? money(b.refund) : "—"}</td><td className="whitespace-nowrap">{b.status === "completed" ? money(priceBreakdown(b.nannyPrice).payout) : b.status === "disputed" ? t("adm.paused") : "—"}</td></>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "disputes" && (
          <ul className="space-y-3">
            {disputes.length === 0 && <li className="text-ink/60">{t("adm.noDisputes")}</li>}
            {disputes.map((b) => (
              <li key={b.id} className="rounded-xl bg-blush p-4">
                <b>{t("adm.vs", { a: b.familyName, b: getNanny(b.nannyId)?.firstName ?? "" })}</b> · {fmtDate(b.date)}
                <p className="text-sm">“{b.disputeReason}”</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn-primary btn-sm" onClick={() => setStatus(b.id, "completed")}>{t("adm.release")}</button>
                  <button className="btn btn-sm bg-bad text-white" onClick={() => setStatus(b.id, "cancelled", { refund: b.nannyPrice + b.serviceFee })}>{t("adm.refundAll")}</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "reviews" && (
          <ul className="space-y-2">
            {NANNIES.slice(0, 6).flatMap((n) => n.reviews.slice(0, 1).map((r) => ({ n, r }))).map(({ n, r }) => {
              const key = n.id + r.author;
              return (
                <li key={key} className={`flex items-center justify-between gap-3 rounded-xl p-3 ${hiddenReviews.includes(key) ? "bg-ink/5 opacity-50" : "bg-cream"}`}>
                  <span className="min-w-0 text-sm"><b>{r.author}</b> → {n.firstName}: “<span lang="en">{r.text}</span>”</span>
                  <button className="btn btn-sm bg-ink/5" onClick={() => setHiddenReviews((h) => (h.includes(key) ? h.filter((x) => x !== key) : [...h, key]))}>{hiddenReviews.includes(key) ? t("adm.restore") : t("adm.hide")}</button>
                </li>
              );
            })}
          </ul>
        )}

        {tab === "content" && (
          <div className="space-y-3">
            <label className="block"><span className="label">{t("adm.hero")}</span><input className="input" value={heroText} onChange={(e) => setHeroText(e.target.value)} /></label>
            <label className="block"><span className="label">{t("adm.faq")}</span><textarea className="input" defaultValue={t("faq.h1a")} /></label>
            <button className="btn-primary btn-sm">{t("adm.saveContent")}</button>
          </div>
        )}

        {tab === "reports" && (
          <div>
            <h2 className="font-black">{t("adm.kpiTitle")}</h2>
            <ul className="mt-4 space-y-4">
              {kpis.map(([l, v, target, progress]) => (
                <li key={l}>
                  <div className="flex flex-wrap justify-between gap-x-3 text-sm"><span className="font-bold">{t(l)}</span><span><b>{v}</b> <span className="text-ink/50">/ {t("adm.target", { v: target })}</span></span></div>
                  <div className="mt-1 h-2 rounded-full bg-brand-light"><div className="h-2 rounded-full bg-brand" style={{ width: `${Math.min(100, progress * 100)}%` }} /></div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink/50">{t("adm.kpiNote")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return <RequireRole role="admin"><Admin /></RequireRole>;
}
