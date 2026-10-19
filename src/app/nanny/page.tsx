"use client";

import Link from "next/link";
import { useState } from "react";
import { Countdown, MatchBadge, StatusPill } from "@/components/Bits";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { hourLabel, priceBreakdown, startTime, toISODate } from "@/lib/pricing";
import { useMine } from "./useMine";

export default function NannyDashboard() {
  const { nanny, mine, now, holdEndsAt, setStatus, sendMessage, needs } = useMine();
  const { t, tn, money, num, date: fmtDate } = useT();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const pending = mine.filter((b) => b.status === "pending");
  const today = toISODate(new Date());
  const todays = mine.filter((b) => b.date === today && ["accepted", "inProgress", "completed"].includes(b.status));
  const month = new Date().toISOString().slice(0, 7);
  const earned = mine.filter((b) => b.status === "completed" && b.date.startsWith(month)).reduce((s, b) => s + priceBreakdown(b.nannyPrice).payout, 0);
  const careList = needs.recipients.map((r) => `${t(`care.${r.type}` as MessageKey)} (${t("nd.ageY", { n: r.age })})`).join(", ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("nd.hi", { name: nanny.firstName })}</h1>
      <p className="text-ink/70">{t("nd.sub")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          [t("nd.new"), pending.length],
          [t("nd.today"), todays.length],
          [t("nd.earned"), money(earned)],
          [t("nd.rating"), `★ ${num(nanny.rating, 1)}`],
        ].map(([l, v]) => (
          <div key={l as string} className="card min-w-0 p-5">
            <p className="text-sm font-bold text-ink/60">{l}</p>
            <p className="break-words text-2xl font-black text-brand-dark">{v}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-black">{t("nd.new")}</h2>
        <div className="mt-4 space-y-4">
          {pending.length === 0 && (
            <p className="card p-8 text-center text-ink/70">
              {tn("nd.noReq", {}, { calendar: <Link href="/nanny/calendar" className="font-bold text-brand-dark underline">{t("nd.calendarLink")}</Link> })}
            </p>
          )}
          {pending.map((b) => (
            <article key={b.id} className={`card p-5 ${b.urgent ? "ring-2 ring-bad" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black">
                    {b.familyName} {b.urgent && <span className="chip-pink ml-1 text-xs">{t("nd.urgent")}</span>}
                  </p>
                  <p className="text-sm text-ink/70">{fmtDate(b.date)} · {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.hours)} · {t(`type.${b.type}`)}</p>
                  <p className="text-sm text-ink/70">{t("nd.careFor", { list: careList })}</p>
                  {b.notes && <p className="mt-1 whitespace-pre-line text-sm">📝 {b.notes}</p>}
                  {b.sick && <p className="mt-1 text-sm">{t("nd.sick", { v: b.sick.symptoms || t("nd.details") })}</p>}
                </div>
                <div className="text-right">
                  {b.matchScore !== undefined && <MatchBadge score={b.matchScore} />}
                  <p className="mt-2 whitespace-nowrap text-lg font-black">{money(priceBreakdown(b.nannyPrice).payout)}</p>
                  <p className="text-xs text-ink/60">{t("nd.receive")}</p>
                  <p className="mt-1 text-sm">⏳ <Countdown until={holdEndsAt(b)} now={now} /></p>
                </div>
              </div>
              {rejecting === b.id ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <input className="input min-w-0 flex-1 basis-60" placeholder={t("nd.rejectPh")} value={reason} onChange={(e) => setReason(e.target.value)} />
                  <button className="btn btn-sm bg-bad text-white" onClick={() => { setStatus(b.id, "rejected", { rejectReason: reason || undefined }); setRejecting(null); setReason(""); }}>{t("nd.confirmReject")}</button>
                  <button className="btn-ghost btn-sm" onClick={() => setRejecting(null)}>{t("common.back")}</button>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-primary btn-sm" onClick={() => setStatus(b.id, "accepted")}>{t("nd.accept")}</button>
                  <button className="btn btn-sm bg-bad/10 text-bad" onClick={() => setRejecting(b.id)}>{t("nd.reject")}</button>
                  <button className="btn-ghost btn-sm" onClick={() => { const v = prompt(t("nd.proposePrompt")); if (v) sendMessage(b.id, "nanny", t("nd.proposal", { v })); }}>{t("nd.propose")}</button>
                  <Link href="/nanny/messages" className="btn-ghost btn-sm">{t("common.message")}</Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black">{t("nd.schedule")}</h2>
        <ul className="mt-4 space-y-2">
          {todays.length === 0 && <li className="card p-5 text-ink/70">{t("nd.nothingToday")}</li>}
          {todays.map((b) => (
            <li key={b.id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
              <span><b>{hourLabel(b.startHour)}–{hourLabel(b.startHour + b.hours)}</b> · {b.familyName}</span>
              <span className="flex items-center gap-2">
                <StatusPill status={b.status === "accepted" && now >= startTime(b) ? "inProgress" : b.status} />
                <Link href="/nanny/bookings" className="text-sm font-bold text-brand-dark">{t("nd.open")}</Link>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
