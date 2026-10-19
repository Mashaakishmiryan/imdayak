"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Stars, VerifiedBadge } from "@/components/Bits";
import { Heart, Pin } from "@/components/Icons";
import { SlotPicker } from "@/components/SlotPicker";
import type { MessageKey } from "@/i18n/en";
import { DAYS, badges, getNanny } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { distanceKm, quickScore } from "@/lib/matching";
import { hourLabel } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { BookingType } from "@/lib/types";

export default function NannyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const n = getNanny(id);
  const router = useRouter();
  const { needs, favourites, toggleFavourite } = useStore();
  const { t, tp, td, money, num, date: fmtDate } = useT();
  const k = (x: string) => x as MessageKey;
  const [type, setType] = useState<BookingType>("2h");
  const [date, setDate] = useState<string>();
  const [video, setVideo] = useState(false);
  if (!n) return notFound();

  const d = distanceKm(needs.lat, needs.lng, n.lat, n.lng);
  const score = quickScore(n, needs);
  const fav = favourites.includes(n.id);
  const types = n.bookingTypes;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/find" className="text-sm font-bold text-brand-dark">{t("profile.back")}</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <section className="card p-6">
            <div className="flex flex-wrap items-start gap-5">
              <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={96} />
              <div className="min-w-0 flex-1">
                <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xl font-black sm:text-3xl">{n.firstName} {n.lastName[0]}., {n.age} <VerifiedBadge /></h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-1 text-ink/70"><Pin /> {n.district}, {n.city} · <span className="whitespace-nowrap">{t("profile.fromYou", { km: num(d, 1) })}</span></p>
                <p className="mt-1"><Stars value={n.rating} /> <b>{num(n.rating, 1)}</b> · {tp("unit.reviews", n.reviewCount)} · {tp("unit.bookings", n.bookingsDone)}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{badges(n).map((b) => <span key={b} className="chip-pink">{t(b)}</span>)}</div>
              </div>
              <span className="whitespace-nowrap rounded-full bg-heart px-4 py-2 text-lg font-black"><Heart className="inline h-5 w-5 text-white" /> {t("common.match", { n: score })}</span>
            </div>
            <button onClick={() => setVideo(!video)} className="mt-5 flex w-full items-center gap-4 rounded-[16px] bg-brand-light p-4 text-left hover:bg-brand-light/70">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-xl text-white">▶</span>
              <span className="min-w-0"><b>{t("profile.videoTitle")}</b><br /><span className="text-sm text-ink/70">{t("profile.videoHello", { name: n.firstName })}</span></span>
            </button>
            {video && <p className="mt-2 rounded-xl bg-blush p-3 text-sm">{t("profile.videoDemo")}</p>}
            <h2 className="mt-6 text-xl font-black">{t("profile.about")}</h2>
            {/* User-written bio keeps its original language; lang="en" lets screen readers and hyphenation treat it correctly */}
            <p className="mt-1 text-ink/80" lang="en">{n.bio}</p>
            <p className="mt-1 text-xs text-ink/50">{t("profile.bioNote", { name: n.firstName })}</p>
          </section>

          <section className="card grid gap-6 p-6 md:grid-cols-2">
            <div>
              <h3 className="font-black">{t("profile.careFor")}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">{n.careTypes.map((c) => <span key={c} className="chip">{t(k(`care.${c}`))}</span>)}</div>
              <p className="mt-2 text-sm text-ink/70">{t("profile.ages", { from: n.ageRange[0], to: n.ageRange[1], n: n.maxChildren })}</p>
            </div>
            <div>
              <h3 className="font-black">{t("profile.languages")}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">{n.languages.map((l) => <span key={l} className="chip">{t(k(`lang.${l}`))}</span>)}</div>
            </div>
            <div>
              <h3 className="font-black">{t("profile.exp")}</h3>
              <p className="mt-1 text-sm">{tp("unit.years", n.yearsExperience)} · {n.training.map((x) => td("tag.", x)).join(", ")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{n.skills.map((s) => <span key={s} className="chip-pink text-xs">{td("tag.", s)}</span>)}</div>
            </div>
            <div>
              <h3 className="font-black">{t("profile.hobbies")}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">{n.hobbies.map((h) => <span key={h} className="chip-pink text-xs">{td("tag.", h)}</span>)}</div>
            </div>
            <div>
              <h3 className="font-black">{t("profile.certs")}</h3>
              <ul className="mt-1 text-sm">{n.certificates.length ? n.certificates.map((c) => <li key={c} lang="en">✅ {c}</li>) : <li className="text-ink/60">{t("profile.noCerts")}</li>}</ul>
            </div>
            <div>
              <h3 className="font-black">{t("profile.good")}</h3>
              <ul className="mt-1 space-y-0.5 text-sm">
                <li>{n.smoker ? t("profile.smoker") : t("profile.nonSmoker")}</li>
                <li>{n.petsOk === "yes" ? t("profile.petsYes") : n.petsOk === "allergic" ? t("profile.petsAllergic") : t("profile.petsNo")}</li>
                <li>{n.drivingLicence ? (n.ownCar ? t("profile.drivesCar") : t("profile.drives")) : t("profile.noDrive")}</li>
                <li>{n.overnight ? t("profile.overnight") : t("profile.daytime")}</li>
              </ul>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-black">{t("profile.schedule")}</h2>
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(4.5rem,1fr))] gap-1.5 text-center text-xs">
              {DAYS.map((day, i) => {
                const s = n.availability[i];
                return (
                  <div key={day} className={`rounded-xl p-2 ${s ? "bg-ok/15" : "bg-ink/5 text-ink/40"}`}>
                    <b className="block">{t(k(`day.${i}`))}</b>
                    {s ? `${hourLabel(s[0])}–${hourLabel(s[1])}` : t("profile.off")}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-black">{t("profile.reviews", { n: n.reviewCount })}</h2>
            <ul className="mt-4 space-y-4">
              {n.reviews.map((r) => (
                <li key={r.author + r.date} className="border-b border-ink/5 pb-4 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-x-2"><b>{r.author}</b><span className="text-xs text-ink/50">{fmtDate(r.date)}</span></div>
                  <Stars value={r.stars} size="text-sm" />
                  <p className="text-ink/80" lang="en">{r.text}</p>
                  <div className="mt-1 flex flex-wrap gap-1">{r.tags.map((tag) => <span key={tag} className="chip text-xs">{td("tag.", tag)}</span>)}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="whitespace-nowrap text-2xl font-black">{money(n.pricePerHour)}<span className="text-sm font-semibold text-ink/60"> {t("common.perHour")}</span></p>
              <p className="whitespace-nowrap text-sm font-bold text-ink/60">{money(n.pricePerDay)} {t("common.perDay")}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["1h", "2h", "day"] as BookingType[]).map((bt) => (
                <button key={bt} disabled={!types.includes(bt)} onClick={() => setType(bt)} className={`rounded-xl px-1 py-2 text-sm font-bold leading-tight ring-1 ring-brand/30 disabled:opacity-30 ${type === bt ? "bg-brand text-white" : "bg-white"}`}>
                  {bt === "day" ? t("type.dayShort") : t(`type.${bt}`)}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-4 text-sm font-bold">{t("profile.freeSlots")}</p>
            <SlotPicker nanny={n} type={type} date={date} onPick={(d, h) => { setDate(d); if (h >= 0) router.push(`/book/${n.id}?type=${type}&date=${d}&hour=${h}`); }} />
            <Link href={`/book/${n.id}?type=${type}`} className="btn-primary heart-pulse mt-5 w-full"><Heart className="h-5 w-5 shrink-0" /> {t("profile.bookName", { name: n.firstName })}</Link>
            <div className="mt-2 flex flex-wrap gap-2 [&>*]:flex-1 [&>*]:basis-36">
              <Link href="/family/messages" className="btn-ghost btn-sm px-3">{t("common.message")}</Link>
              <button onClick={() => toggleFavourite(n.id)} className="btn-ghost btn-sm px-3" aria-pressed={fav}><Heart className="h-4 w-4 shrink-0 text-heart-dark" filled={fav} /> {fav ? t("profile.saved") : t("common.save")}</button>
            </div>
          </div>
          <p className="px-2 text-center text-xs text-ink/60">{t("profile.holdNote", { name: n.firstName })}</p>
          <button className="w-full text-center text-xs font-bold text-ink/50 underline">{t("profile.report")}</button>
        </aside>
      </div>
    </div>
  );
}
