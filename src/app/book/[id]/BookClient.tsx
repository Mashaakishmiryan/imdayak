"use client";

import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Avatar, Confetti, VerifiedBadge } from "@/components/Bits";
import { Heart } from "@/components/Icons";
import { SlotPicker } from "@/components/SlotPicker";
import { getNanny } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { quickScore } from "@/lib/matching";
import { hourLabel, nannyPrice, priceBreakdown } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { Booking, BookingType } from "@/lib/types";

export default function BookClient() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const n = getNanny(id);
  const { user, needs, createBooking } = useStore();
  const { t, money, num, date: fmtDate } = useT();

  const [type, setType] = useState<BookingType>((params.get("type") as BookingType) ?? "2h");
  const [date, setDate] = useState<string | undefined>(params.get("date") ?? undefined);
  const [hour, setHour] = useState<number | undefined>(params.get("hour") ? Number(params.get("hour")) : undefined);
  const [notes, setNotes] = useState("");
  const [sickMode, setSickMode] = useState(needs.recipients[0]?.type === "sick");
  const [sick, setSick] = useState({ symptoms: "", temperature: "", medicine: "", doctorPhone: "" });
  const [emergency, setEmergency] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  if (!n) return notFound();
  const effectiveType = n.bookingTypes.includes(type) ? type : n.bookingTypes[0];
  const p = priceBreakdown(nannyPrice(n, effectiveType));
  const canPay = date && hour !== undefined && hour >= 0;

  const pay = () => {
    if (!user) return router.push(`/login?next=/book/${n.id}`);
    if (!user.verified) return router.push("/signup?step=verify");
    setPaying(true);
    setTimeout(() => {
      const b = createBooking({
        nannyId: n.id,
        familyName: user.name,
        type: effectiveType,
        date: date!,
        startHour: hour!,
        notes,
        emergencyContact: emergency || undefined,
        matchScore: quickScore(n, needs),
        sick: sickMode ? sick : undefined,
      });
      setDone(b);
      setPaying(false);
    }, 1200);
  };

  if (done)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Confetti />
        <Heart className="mx-auto h-16 w-16 text-heart" />
        <h1 className="mt-3 text-3xl font-black">{t("book.doneTitle", { name: n.firstName })}</h1>
        <p className="mt-2 text-ink/70">{t("book.doneDesc", { amount: money(p.total), name: n.firstName })}</p>
        <div className="card mt-6 p-5 text-left text-sm">
          <p><b>{t("book.when")}:</b> {fmtDate(done.date)}, {hourLabel(done.startHour)}–{hourLabel(done.startHour + done.hours)}</p>
          <p><b>{t("book.type")}:</b> {t(`type.${done.type}`)}</p>
          <p><b>{t("book.status")}:</b> {t("book.pendingHeld")}</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/family/bookings" className="btn-primary">{t("book.myBookings")}</Link>
          <Link href="/find" className="btn-ghost">{t("book.keepBrowsing")}</Link>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href={`/nannies/${n.id}`} className="text-sm font-bold text-brand-dark">{t("book.back", { name: n.firstName })}</Link>
      <h1 className="mt-3 text-3xl font-black">{t("book.title", { name: n.firstName })}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-black">{t("book.s1")}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(["1h", "2h", "day"] as BookingType[]).map((bt) => (
                <button key={bt} disabled={!n.bookingTypes.includes(bt)} onClick={() => { setType(bt); setHour(undefined); }} className={`min-w-0 rounded-[16px] p-4 text-left ring-1 ring-brand/20 disabled:opacity-30 ${effectiveType === bt ? "bg-brand text-white" : "bg-white hover:bg-brand-light"}`}>
                  <b className="block">{t(`type.${bt}`)}</b>
                  <span className="text-sm opacity-80"><span className="whitespace-nowrap">{money(nannyPrice(n, bt))}</span> · {bt === "day" ? t("notice.day") : t("notice.hourly")}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-black">{t("book.s2")}</h2>
            <p className="text-sm text-ink/60">{t("book.s2hint")}</p>
            <div className="mt-3">
              <SlotPicker nanny={n} type={effectiveType} date={date} hour={hour} onPick={(d, h) => { setDate(d); setHour(h >= 0 ? h : undefined); }} />
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-black">{t("book.s3")}</h2>
            <textarea className="input min-h-24" placeholder={t("book.notesPh")} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <label className="block">
              <span className="label">{t("book.emergency")}</span>
              <input className="input" placeholder={t("book.emergencyPh")} value={emergency} onChange={(e) => setEmergency(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" className="h-4 w-4 shrink-0 accent-brand" checked={sickMode} onChange={(e) => setSickMode(e.target.checked)} /> {t("book.sickMode")}
            </label>
            {sickMode && (
              <div className="grid gap-3 rounded-[16px] bg-blush p-4 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className="label">{t("book.symptoms")}</span><input className="input" value={sick.symptoms} onChange={(e) => setSick({ ...sick, symptoms: e.target.value })} placeholder={t("book.symptomsPh")} /></label>
                <label><span className="label">{t("book.temp")}</span><input className="input" value={sick.temperature} onChange={(e) => setSick({ ...sick, temperature: e.target.value })} placeholder={t("book.tempPh")} /></label>
                <label><span className="label">{t("book.doctor")}</span><input className="input" value={sick.doctorPhone} onChange={(e) => setSick({ ...sick, doctorPhone: e.target.value })} placeholder="+374 …" /></label>
                <label className="sm:col-span-2"><span className="label">{t("book.medicine")}</span><input className="input" value={sick.medicine} onChange={(e) => setSick({ ...sick, medicine: e.target.value })} placeholder={t("book.medicinePh")} /></label>
                <p className="text-xs text-ink/60 sm:col-span-2">{t("book.sickNote")}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={52} />
              <div className="min-w-0"><b className="text-lg">{n.firstName}</b> <VerifiedBadge /><p className="text-sm text-ink/60">★ {num(n.rating, 1)} · {n.district}</p></div>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt>{t(`type.${effectiveType}`)}</dt><dd className="whitespace-nowrap font-bold">{money(p.base)}</dd></div>
              <div className="flex justify-between gap-3"><dt>{t("book.fee")}</dt><dd className="whitespace-nowrap font-bold">{money(p.fee)}</dd></div>
              <div className="flex justify-between gap-3 border-t border-ink/10 pt-2 text-lg"><dt className="font-black">{t("book.total")}</dt><dd className="whitespace-nowrap font-black">{money(p.total)}</dd></div>
            </dl>
            <p className="mt-3 text-sm">{date && hour !== undefined ? <>📅 {fmtDate(date)} · {hourLabel(hour)}–{hourLabel(hour + (effectiveType === "day" ? 8 : effectiveType === "2h" ? 2 : 1))}</> : <span className="text-ink/60">{t("book.pickSlot")}</span>}</p>
            <div className="mt-4 rounded-xl bg-brand-light p-3 text-xs text-ink/80">
              {t("book.payNote")} <b>{t("book.testMode")}</b>
            </div>
            <button onClick={pay} disabled={!canPay || paying} className="btn-primary heart-pulse mt-4 w-full">
              {paying ? t("book.authorising") : <><Heart className="h-5 w-5 shrink-0" /> {t("book.request", { amount: money(p.total) })}</>}
            </button>
            {!user && <p className="mt-2 text-center text-xs text-ink/60">{t("book.loginFirst")}</p>}
          </div>
          <div className="card p-5 text-xs text-ink/70">
            <b className="text-sm text-ink">{t("cancel.title")}</b>
            <ul className="mt-1 space-y-0.5">
              {(["cancel.r1", "cancel.r2", "cancel.r3", "cancel.r4"] as const).map((r) => <li key={r}>{t(r)}</li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
