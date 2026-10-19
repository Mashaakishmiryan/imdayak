"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireRole } from "@/components/Area";
import { Avatar, Countdown, Stars, StatusPill } from "@/components/Bits";
import { REVIEW_TAGS, getNanny } from "@/lib/data";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { useT } from "@/lib/i18n";
import { familyRefundShare, hourLabel, startTime } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { Booking } from "@/lib/types";

function ReviewForm({ b }: { b: Booking }) {
  const { review } = useStore();
  const { t, td } = useT();
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  return (
    <div className="mt-4 rounded-[16px] bg-blush p-4">
      <p className="font-black">{t("rv.how")}</p>
      <div className="mt-1 flex gap-1 text-3xl">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setStars(s)} className={s <= stars ? "text-[#F2B33D]" : "text-ink/20"} aria-label={t("rv.stars", { n: s })}>★</button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {REVIEW_TAGS.map((tag) => (
          <button key={tag} onClick={() => setTags((x) => (x.includes(tag) ? x.filter((y) => y !== tag) : [...x, tag]))} className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-brand/30 ${tags.includes(tag) ? "bg-brand text-white" : "bg-white"}`}>{td("tag.", tag)}</button>
        ))}
      </div>
      <textarea className="input mt-2" placeholder={t("rv.ph")} value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn-primary btn-sm mt-2" onClick={() => review(b.id, { stars, tags, text })}>{t("rv.post")}</button>
    </div>
  );
}

function BookingItem({ b }: { b: Booking }) {
  const { now, holdEndsAt, cancelByFamily, extend, setStatus } = useStore();
  const { t, tn, td, money, date: fmtDate, time } = useT();
  const n = getNanny(b.nannyId)!;
  const [msg, setMsg] = useState("");
  const [sos, setSos] = useState(false);
  const start = startTime(b);
  const end = start + b.hours * 3_600_000;
  const live = b.status === "inProgress" || (b.status === "accepted" && now >= start && now < end);
  const refundShare = familyRefundShare(b, now);
  const canDispute = b.status === "completed" && now - (b.checkOutAt ?? end) < 24 * 3_600_000;
  const total = b.nannyPrice + b.serviceFee;
  const queueNames = (b.autoQueue ?? []).map((id) => getNanny(id)?.firstName ?? "").join(" → ");

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={52} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-lg font-black">
            {n.firstName} <StatusPill status={live ? "inProgress" : b.status} />
            {b.urgent && <span className="chip-pink text-xs">{t("fb.urgent")}</span>}
          </p>
          <p className="text-sm text-ink/70">
            {fmtDate(b.date)} · {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.hours)} · {t(`type.${b.type}`)}
          </p>
        </div>
        <p className="text-right">
          <b className="whitespace-nowrap text-lg">{money(total)}</b>
          <br />
          <span className="text-xs text-ink/60">
            {b.status === "pending"
              ? t("fb.held")
              : b.status === "cancelled"
                ? t("set.refund", { amount: money(b.refund ?? 0) })
                : b.status === "rejected" || b.status === "expired"
                  ? t("fb.released")
                  : t("fb.paid")}
          </span>
        </p>
      </div>

      {b.status === "pending" && (
        <p className="mt-3 rounded-xl bg-[#FFF4D6] p-3 text-sm">
          {tn("fb.waiting", { name: n.firstName }, { time: <Countdown until={holdEndsAt(b)} now={now} /> })}
          {queueNames && <> {t("fb.queue", { names: queueNames })}</>}
        </p>
      )}
      {(b.status === "rejected" || b.status === "expired") && (
        <p className="mt-3 rounded-xl bg-bad/10 p-3 text-sm">
          {b.status === "rejected"
            ? b.rejectReason
              ? t("fb.rejectedReason", { name: n.firstName, reason: b.rejectReason })
              : t("fb.rejected", { name: n.firstName })
            : t("fb.expired", { name: n.firstName })}{" "}
          {t("fb.holdReleased")}{" "}
          {b.autoQueue && b.autoQueue.length > 0 ? t("fb.sentNext") : <Link href="/family/matches" className="font-bold underline">{t("fb.seeOther")}</Link>}
        </p>
      )}
      {b.status === "accepted" && !live && (
        <p className="mt-3 rounded-xl bg-brand-light p-3 text-sm">
          {tn("fb.confirmed", { name: n.firstName }, { time: <Countdown until={start} now={now} /> })}
        </p>
      )}
      {live && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ok/10 p-3 text-sm">
          <span>{tn("fb.live", {}, { time: <Countdown until={end} now={now} /> })}</span>
          <button onClick={() => setSos(true)} className="btn btn-sm bg-bad text-white">{t("sos.btn")}</button>
        </div>
      )}
      {sos && <p className="mt-2 rounded-xl bg-bad p-3 text-sm font-bold text-white">{t("fb.sosSent")}</p>}

      {b.sick && (
        <div className="mt-3 rounded-xl bg-blush p-3 text-sm">
          <b>{t("fb.sickCard")}</b> {t("book.symptoms")}: {b.sick.symptoms || "—"} · {t("book.temp")}: {b.sick.temperature || "—"} · {t("book.medicine")}: {b.sick.medicine || "—"} · {t("book.doctor")}: {b.sick.doctorPhone || "—"}
        </div>
      )}
      {b.emergencyContact && <p className="mt-2 text-sm">{t("book.emergencyNote", { v: b.emergencyContact })}</p>}

      {b.diary.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-black">{t("fb.diary")}</p>
          <ul className="mt-1 space-y-1 border-l-2 border-heart pl-3 text-sm">
            {b.diary.map((d) => (
              <li key={d.at}><span className="font-mono text-xs text-ink/50">{time(d.at)}</span> {d.text}</li>
            ))}
          </ul>
        </div>
      )}
      {b.report && (
        <div className="mt-3 grid gap-1 rounded-xl bg-brand-light/60 p-3 text-sm sm:grid-cols-2">
          <p className="font-black sm:col-span-2">{t("fb.report")}</p>
          <p>🍽️ {b.report.meals}</p>
          <p>😴 {b.report.sleep}</p>
          <p>😊 {b.report.mood}</p>
          <p>💊 {b.report.medicines || t("fb.none")}</p>
          {b.report.notes && <p className="sm:col-span-2">📌 {b.report.notes}</p>}
        </div>
      )}
      {b.review && (
        <p className="mt-3 text-sm">
          {t("fb.yourReview")} <Stars value={b.review.stars} size="text-sm" /> {b.review.tags.map((x) => td("tag.", x)).join(" · ")}
        </p>
      )}
      {b.status === "completed" && !b.review && <ReviewForm b={b} />}

      <div className="mt-4 flex flex-wrap gap-2">
        {["pending", "accepted", "inProgress", "completed"].includes(b.status) && <Link href="/family/messages" className="btn-ghost btn-sm">{t("common.message")}</Link>}
        {b.status === "accepted" && (
          <>
            <a href={googleCalendarUrl(b, n.firstName)} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">{t("fb.gcal")}</a>
            <button onClick={() => downloadIcs(b, n.firstName)} className="btn-ghost btn-sm">{t("fb.ics")}</button>
          </>
        )}
        {(b.status === "accepted" || live) && (
          <button
            onClick={() => setMsg(extend(b.id) ? t("fb.extended", { amount: money(n.pricePerHour) }) : t("fb.notFree", { name: n.firstName }))}
            className="btn-ghost btn-sm"
          >
            {t("fb.extend")}
          </button>
        )}
        {(b.status === "pending" || (b.status === "accepted" && !live)) && (
          <button
            onClick={() => {
              const pct = Math.round(refundShare * 100);
              if (confirm(t("fb.cancelConfirm", { pct, amount: money(total * refundShare) }))) {
                setMsg(t("fb.cancelled", { amount: money(cancelByFamily(b.id)) }));
              }
            }}
            className="btn btn-sm bg-bad/10 text-bad"
          >
            {t("fb.cancel", { pct: Math.round(refundShare * 100) })}
          </button>
        )}
        {canDispute && (
          <button
            onClick={() => {
              const r = prompt(t("fb.problemPrompt"));
              if (r) setStatus(b.id, "disputed", { disputeReason: r });
            }}
            className="btn btn-sm bg-ink/5"
          >
            {t("fb.problem")}
          </button>
        )}
        {["completed", "cancelled", "rejected", "expired"].includes(b.status) && <Link href={`/book/${n.id}`} className="btn-primary btn-sm">{t("fam.bookAgain")}</Link>}
      </div>
      {msg && <p className="mt-2 text-sm font-bold text-brand-dark">{msg}</p>}
    </article>
  );
}

function Bookings() {
  const { bookings } = useStore();
  const { t, tn } = useT();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const active = ["pending", "accepted", "inProgress"];
  const list = bookings.filter((b) => (tab === "upcoming" ? active.includes(b.status) : !active.includes(b.status)));
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("fb.title")}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["upcoming", "past"] as const).map((x) => (
          <button key={x} onClick={() => setTab(x)} className={`rounded-full px-4 py-1.5 font-bold ${tab === x ? "bg-brand text-white" : "bg-white shadow-soft"}`}>
            {x === "upcoming" ? t("fb.tabUpcoming") : t("fb.tabPast")}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {list.length === 0 && (
          <p className="card p-8 text-center text-ink/70">
            {t("fb.empty")} <Link href="/family/matches" className="font-bold text-brand-dark underline">{t("fb.findYour")}</Link>
          </p>
        )}
        {list.map((b) => <BookingItem key={b.id} b={b} />)}
      </div>
      <p className="mt-8 rounded-xl bg-brand-light p-4 text-sm">
        {tn("fb.tip", {}, { login: <Link href="/login" className="font-bold underline">{t("nav.login")}</Link> })}
      </p>
    </div>
  );
}

export default function Page() {
  return <RequireRole role="family"><Bookings /></RequireRole>;
}
