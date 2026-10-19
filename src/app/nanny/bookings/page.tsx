"use client";

import { useState } from "react";
import { Countdown, StatusPill } from "@/components/Bits";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { hourLabel, priceBreakdown, startTime } from "@/lib/pricing";
import type { Booking } from "@/lib/types";
import { useMine } from "../useMine";

const QUICK: MessageKey[] = ["q.lunch", "q.nap", "q.woke", "q.walk", "q.draw", "q.meds", "q.read"];
const REPORT_FIELDS = ["meals", "sleep", "mood", "medicines"] as const;

function Item({ b }: { b: Booking }) {
  const { now, setStatus, addDiary, submitReport, cancelByNanny } = useMine();
  const { t, tn, money, date: fmtDate, time } = useT();
  const [note, setNote] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [r, setR] = useState({ meals: "", sleep: "", mood: "", medicines: "", notes: "" });
  const [sos, setSos] = useState(false);
  const start = startTime(b);
  const end = start + b.hours * 3_600_000;

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-lg font-black">{b.familyName} <StatusPill status={b.status} /></p>
          <p className="text-sm text-ink/70">{fmtDate(b.date)} · {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.hours)} · {t(`type.${b.type}`)}</p>
          {["accepted", "inProgress"].includes(b.status) && <p className="text-sm">📍 Komitas Ave 24, apt 12, Arabkir · 📞 +374 91 000 000</p>}
        </div>
        <p className="text-right"><b className="whitespace-nowrap">{money(priceBreakdown(b.nannyPrice).payout)}</b><br /><span className="text-xs text-ink/60">{t("nb.payout")}</span></p>
      </div>

      {b.notes && <p className="mt-2 whitespace-pre-line rounded-xl bg-cream p-3 text-sm">{b.notes}</p>}
      {b.emergencyContact && <p className="mt-2 text-sm">{t("book.emergencyNote", { v: b.emergencyContact })}</p>}
      {b.sick && (
        <p className="mt-2 rounded-xl bg-blush p-3 text-sm">
          🌡️ {t("book.symptoms")}: {b.sick.symptoms || "—"} · {t("book.temp")}: {b.sick.temperature || "—"} · {t("book.medicine")}: {b.sick.medicine || "—"} · {t("book.doctor")}: {b.sick.doctorPhone || "—"}
        </p>
      )}

      {b.status === "accepted" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn-primary btn-sm" onClick={() => setStatus(b.id, "inProgress", { checkInAt: Date.now() })}>{t("nb.checkIn")}</button>
          <span className="text-sm text-ink/60">{now < start ? tn("nb.startsIn", {}, { time: <Countdown until={start} now={now} /> }) : t("nb.started")}</span>
          <button className="btn btn-sm ml-auto bg-bad/10 text-bad" onClick={() => confirm(t("nb.cancelConfirm")) && cancelByNanny(b.id)}>{t("nb.cancel")}</button>
        </div>
      )}

      {b.status === "inProgress" && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ok/10 p-3 text-sm">
            <span>{tn("nb.checkedIn", { at: b.checkInAt ? time(b.checkInAt) : "" }, { time: <Countdown until={end} now={now} /> })}</span>
            <button className="btn btn-sm bg-bad text-white" onClick={() => setSos(true)}>{t("sos.btn")}</button>
          </div>
          {sos && <p className="rounded-xl bg-bad p-3 text-sm font-bold text-white">{t("nb.sosSent")}</p>}
          <div>
            <p className="text-sm font-black">{t("nb.diary")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {/* The note is saved in the nanny's language — it's their message to the family */}
              {QUICK.map((q) => <button key={q} onClick={() => addDiary(b.id, t(q))} className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold hover:bg-brand hover:text-white">{t(q)}</button>)}
            </div>
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { addDiary(b.id, note.trim()); setNote(""); } }}>
              <input className="input min-w-0" placeholder={t("nb.notePh")} value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn-primary btn-sm shrink-0">{t("nb.post")}</button>
            </form>
            <ul className="mt-2 space-y-1 border-l-2 border-heart pl-3 text-sm">
              {b.diary.map((d) => <li key={d.at}><span className="font-mono text-xs text-ink/50">{time(d.at)}</span> {d.text}</li>)}
            </ul>
          </div>
          {!showReport ? (
            <button className="btn-heart btn-sm" onClick={() => setShowReport(true)}>{t("nb.checkout")}</button>
          ) : (
            <div className="grid gap-2 rounded-[16px] bg-blush p-4 sm:grid-cols-2">
              <p className="font-black sm:col-span-2">{t("nb.reportTitle")}</p>
              {REPORT_FIELDS.map((f) => (
                <label key={f} className="min-w-0">
                  <span className="label">{t(`rep.${f}`)}</span>
                  <input className="input" value={r[f]} onChange={(e) => setR({ ...r, [f]: e.target.value })} placeholder={t(`rep.${f}Ph`)} />
                </label>
              ))}
              <label className="sm:col-span-2"><span className="label">{t("nb.notesNext")}</span><input className="input" value={r.notes} onChange={(e) => setR({ ...r, notes: e.target.value })} /></label>
              <button className="btn-primary btn-sm sm:col-span-2" onClick={() => submitReport(b.id, r)}>{t("nb.submit")}</button>
            </div>
          )}
        </div>
      )}
      {b.status === "completed" && b.report && <p className="mt-3 text-sm text-ink/70">{t("nb.reportSent")}</p>}
      {b.status === "disputed" && <p className="mt-3 rounded-xl bg-bad/10 p-3 text-sm">{t("nb.disputed", { reason: b.disputeReason ?? "" })}</p>}
    </article>
  );
}

export default function NannyBookings() {
  const { mine } = useMine();
  const { t } = useT();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = mine.filter((b) => (tab === "upcoming" ? ["accepted", "inProgress"].includes(b.status) : ["completed", "cancelled", "disputed", "rejected", "expired"].includes(b.status)));
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("nb.title")}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["upcoming", "past"] as const).map((x) => (
          <button key={x} onClick={() => setTab(x)} className={`rounded-full px-4 py-1.5 font-bold ${tab === x ? "bg-brand text-white" : "bg-white shadow-soft"}`}>
            {x === "upcoming" ? t("nb.tabUpcoming") : t("nb.tabPast")}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {list.length === 0 && <p className="card p-8 text-center text-ink/70">{t("nb.empty")}</p>}
        {list.map((b) => <Item key={b.id} b={b} />)}
      </div>
    </div>
  );
}
