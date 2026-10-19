"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MatchBadge, Stars } from "@/components/Bits";
import { HeroIllustration } from "@/components/Illustration";
import { Heart, Shield } from "@/components/Icons";
import { MapLegend, MapView } from "@/components/MapView";
import { NannyCard } from "@/components/NannyCard";
import type { MessageKey } from "@/i18n/en";
import { CARE_TYPES, DEFAULT_FAMILY_LOCATION, NANNIES } from "@/lib/data";
import { useMsg, useT } from "@/lib/i18n";
import { distanceKm, matchNannies, quickScore } from "@/lib/matching";
import { toISODate } from "@/lib/pricing";
import { DEFAULT_NEEDS } from "@/lib/store";
import type { CareType } from "@/lib/types";

const EXTRAS: [string, string][] = [["⚡", "urgent"], ["📔", "diary"], ["📝", "report"], ["🆘", "sos"], ["🔁", "backup"], ["🌡️", "sick"]];

export default function Home() {
  const { t } = useT();
  const msg = useMsg();
  const router = useRouter();
  const [care, setCare] = useState<CareType>("baby");
  const [address, setAddress] = useState(DEFAULT_FAMILY_LOCATION.address);
  const [date, setDate] = useState(() => toISODate(new Date(Date.now() + 86_400_000)));

  const nearby = useMemo(
    () =>
      NANNIES.filter((n) => n.city === "Yerevan")
        .map((n) => ({ nanny: n, score: quickScore(n, DEFAULT_NEEDS), distanceKm: distanceKm(DEFAULT_NEEDS.lat, DEFAULT_NEEDS.lng, n.lat, n.lng) }))
        .sort((a, b) => b.score - a.score),
    [],
  );
  // Reasons for the preview card come from the real matching model, so they translate like everywhere else
  const top = useMemo(() => matchNannies([nearby[0].nanny], { ...DEFAULT_NEEDS, day: 1, startHour: 10 }).matches[0], [nearby]);

  const pins = nearby.map((p) => ({ ...p, state: (p.nanny.online ? (p.nanny.availability[1] ? "available" : "busy") : "offline") as "available" | "busy" | "offline" }));
  const k = (s: string) => s as MessageKey;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 md:grid-cols-2 md:pt-16">
          <div className="relative min-w-0">
            <span className="chip mb-5 max-w-full"><Shield className="h-4 w-4 shrink-0" /> {t("hero.badge")}</span>
            <h1 className="text-4xl font-black leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
              {t("hero.title1")} <span className="text-brand">{t("hero.title2")}</span>
              <Heart className="ml-2 inline h-9 w-9 text-heart md:h-12 md:w-12" />
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink/75">{t("hero.sub")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/family/matches" className="btn-primary heart-pulse text-lg"><Heart className="h-5 w-5 shrink-0" /> {t("hero.find")}</Link>
              <Link href="/become-a-nanny" className="btn-ghost text-lg">{t("hero.become")}</Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-ink/70">
              <span>{t("hero.stat1")}</span>
              <span>{t("hero.stat2")}</span>
              <span>{t("hero.stat3")}</span>
            </div>
          </div>
          <HeroIllustration className="mx-auto w-full max-w-md" label={t("hero.illustration")} />
        </div>

        {/* Quick search */}
        <div className="mx-auto max-w-6xl px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/family/matches?care=${care}&date=${date}&address=${encodeURIComponent(address)}`);
            }}
            className="card grid gap-3 p-4 md:grid-cols-2 md:p-5 lg:grid-cols-[1fr_1.4fr_1fr_auto] lg:items-end"
          >
            <label className="min-w-0">
              <span className="label">{t("search.care")}</span>
              <select className="input" value={care} onChange={(e) => setCare(e.target.value as CareType)}>
                {CARE_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {t(k(`care.${c.id}`))} ({t(k(`careAges.${c.id}`))})</option>
                ))}
              </select>
            </label>
            <label className="min-w-0">
              <span className="label">{t("search.address")}</span>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <label className="min-w-0">
              <span className="label">{t("search.date")}</span>
              <input type="date" className="input" value={date} min={toISODate(new Date())} onChange={(e) => setDate(e.target.value)} />
            </label>
            <button className="btn-primary self-end">{t("search.go")}</button>
          </form>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="h-section text-center">{t("how.title")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="card lift p-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-3xl">{["📝", "💞", "☕"][n - 1]}</div>
              <p className="text-sm font-black text-heart-dark">{t("how.step", { n })}</p>
              <h3 className="mt-1 text-xl font-black">{t(k(`how.s${n}t`))}</h3>
              <p className="mt-2 text-ink/70">{t(k(`how.s${n}d`))}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-brand-light/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="h-section text-center">{t("cats.title")}</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {CARE_TYPES.map((c) => (
              <Link key={c.id} href={`/find?care=${c.id}`} className="card lift min-w-0 p-5 text-center">
                <div className="text-4xl">{c.emoji}</div>
                <p className="mt-2 font-black">{t(k(`care.${c.id}`))}</p>
                <p className="text-sm text-ink/60">{t(k(`careAges.${c.id}`))}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MATCH PREVIEW + MAP */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="min-w-0">
            <h2 className="h-section">{t("preview.title")}</h2>
            <p className="mt-3 text-lg text-ink/70">{t("preview.sub")}</p>
            {top && (
              <div className="card mt-6 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="text-lg">{top.nanny.firstName}</b>
                  <MatchBadge score={top.score} />
                </div>
                <p className="mt-2 text-sm font-semibold text-brand-dark">{top.reasons.slice(0, 3).map(msg).join(" · ")}</p>
              </div>
            )}
            <Link href="/find" className="btn-primary mt-6">{t("preview.map")}</Link>
          </div>
          <div className="card min-w-0 overflow-hidden p-3">
            <MapView center={[DEFAULT_NEEDS.lat, DEFAULT_NEEDS.lng]} pins={pins} height={400} zoom={12} />
            <div className="px-2 pt-3"><MapLegend /></div>
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nearby.slice(0, 3).map((m, i) => (
            <NannyCard key={m.nanny.id} nanny={m.nanny} score={m.score} distanceKm={m.distanceKm} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* EXTRAS */}
      <section className="bg-blush/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="h-section text-center">{t("extras.title")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {EXTRAS.map(([icon, id]) => (
              <div key={id} className="card lift p-6">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-2 text-lg font-black">{t(k(`extras.${id}.t`))}</h3>
                <p className="mt-1 text-ink/70">{t(k(`extras.${id}.d`))}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="h-section text-center">{t("trust.title")}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-2 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white"><Shield /></div>
              <h3 className="font-black">{t(k(`trust.${n}t`))}</h3>
              <p className="mt-1 text-sm text-ink/70">{t(k(`trust.${n}d`))}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center"><Link href="/safety" className="font-bold text-brand-dark underline">{t("trust.link")}</Link></div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-brand-light/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="h-section text-center">{t("testi.title")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <figure key={n} className="rounded-[16px] bg-blush p-6 shadow-soft">
                <Stars value={5} />
                <blockquote className="mt-2 text-ink/85">“{t(k(`testi.${n}t`))}”</blockquote>
                <figcaption className="mt-3 font-black">— {t(k(`testi.${n}n`))}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="h-section text-center">{t("faq.title")}</h2>
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((n) => (
            <details key={n} className="card group p-5">
              <summary className="flex cursor-pointer list-none gap-2 font-black">
                <span className="inline-block text-heart-dark transition group-open:rotate-45">+</span>
                <span>{t(k(`faq.h${n}q`))}</span>
              </summary>
              <p className="mt-2 text-ink/75">{t(k(`faq.h${n}a`))}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 text-center"><Link href="/faq" className="font-bold text-brand-dark underline">{t("faq.all")}</Link></div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-[28px] bg-brand px-6 py-14 text-center text-white">
          <Heart className="mx-auto h-10 w-10 text-heart" />
          <h2 className="mt-3 text-3xl font-black md:text-4xl">{t("cta.title")}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/family/matches" className="btn bg-white text-brand-dark hover:-translate-y-0.5">{t("hero.find")}</Link>
            <Link href="/become-a-nanny" className="btn bg-heart text-ink hover:-translate-y-0.5">{t("hero.become")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
