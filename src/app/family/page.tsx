"use client";

import Link from "next/link";
import { useMemo } from "react";
import { RequireRole } from "@/components/Area";
import { Avatar, StatusPill } from "@/components/Bits";
import { Heart } from "@/components/Icons";
import { NannyCard } from "@/components/NannyCard";
import { NANNIES, getNanny } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { matchNannies } from "@/lib/matching";
import { hourLabel } from "@/lib/pricing";
import { useStore } from "@/lib/store";

function Dashboard() {
  const { user, bookings, needs } = useStore();
  const { t, money, date: fmtDate } = useT();
  const { matches } = useMemo(() => matchNannies(NANNIES, needs), [needs]);
  const upcoming = bookings.filter((b) => ["pending", "accepted", "inProgress"].includes(b.status));
  const past = bookings.filter((b) => b.status === "completed");
  const pastNannies = [...new Set(past.map((b) => b.nannyId))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("fam.hello", { name: user!.name.split(" ")[0] })} <Heart className="inline h-7 w-7 text-heart" /></h1>
      <p className="text-ink/70">{t("fam.sub")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          [t("fam.upcoming"), upcoming.length, "/family/bookings"],
          [t("fam.completed"), past.length, "/family/bookings"],
          [t("fam.spent"), money(past.reduce((s, b) => s + b.nannyPrice + b.serviceFee, 0)), "/family/settings"],
        ].map(([l, v, h]) => (
          <Link key={l as string} href={h as string} className="card lift p-5">
            <p className="text-sm font-bold text-ink/60">{l}</p>
            <p className="break-words text-3xl font-black text-brand-dark">{v}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-black">{t("fam.best")}</h2>
          <Link href="/family/matches" className="font-bold text-brand-dark">{t("fam.adjust")}</Link>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 3).map((m, i) => <NannyCard key={m.nanny.id} nanny={m.nanny} score={m.score} distanceKm={m.distanceKm} reasons={m.reasons.slice(0, 3)} rank={i + 1} compact />)}
          {matches.length === 0 && <p className="card p-6 text-ink/70 md:col-span-3">{t("fam.noMatch")} <Link className="font-bold text-brand-dark underline" href="/family/matches">{t("fam.change")}</Link></p>}
        </div>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-xl font-black">{t("fam.upcomingTitle")}</h2>
          <ul className="mt-3 space-y-3">
            {upcoming.length === 0 && <li className="text-ink/60">{t("fam.nothing")} <Link href="/family/matches" className="font-bold text-brand-dark underline">{t("nav.find")}</Link></li>}
            {upcoming.slice(0, 4).map((b) => {
              const n = getNanny(b.nannyId)!;
              return (
                <li key={b.id} className="flex items-center gap-3">
                  <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={40} />
                  <div className="min-w-0 flex-1"><b>{n.firstName}</b><p className="text-sm text-ink/60">{fmtDate(b.date)} · {hourLabel(b.startHour)}</p></div>
                  <StatusPill status={b.status} />
                </li>
              );
            })}
          </ul>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-black">{t("fam.again")}</h2>
          <ul className="mt-3 space-y-3">
            {pastNannies.length === 0 && <li className="text-ink/60">{t("fam.pastHere")}</li>}
            {pastNannies.map((id) => {
              const n = getNanny(id)!;
              return (
                <li key={id} className="flex items-center gap-3">
                  <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={40} />
                  <b className="min-w-0 flex-1">{n.firstName}</b>
                  <Link href={`/book/${id}`} className="btn-primary btn-sm">{t("fam.bookAgain")}</Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function Page() {
  return <RequireRole role="family"><Dashboard /></RequireRole>;
}
