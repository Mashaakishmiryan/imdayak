"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Confetti } from "@/components/Bits";
import { Heart, HeartSpinner } from "@/components/Icons";
import { NannyCard } from "@/components/NannyCard";
import type { MessageKey } from "@/i18n/en";
import { CARE_TYPES, HOBBIES, NANNIES, SKILLS, TRAINING } from "@/lib/data";
import { useMsg, useT } from "@/lib/i18n";
import { WEIGHTS, matchNannies, type Factor } from "@/lib/matching";
import { MIN_NOTICE_H, hourLabel, toISODate, weekdayIndex } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { BookingType, CareType, Language } from "@/lib/types";

/** Quiz answers map to hobby tags that feed the "Hobbies & values" factor. Text lives in quiz.{n}q/a/b. */
const QUIZ_TAGS: [string[], string[]][] = [
  [["reading"], ["games"]],
  [["reading"], ["crafts"]],
  [["nature walks"], ["reading"]],
  [["crafts"], []],
  [["cooking"], []],
  [["music"], []],
  [["sport"], ["reading"]],
  [["drawing"], ["dancing"]],
];

export default function MatchesClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { needs, setNeeds, user, createBooking, isSlotTaken } = useStore();
  const { t, tp, td, money } = useT();
  const msg = useMsg();
  const k = (x: string) => x as MessageKey;

  const tomorrow = toISODate(new Date(Date.now() + 86_400_000));
  const [date, setDate] = useState(params.get("date") ?? tomorrow);
  const [loading, setLoading] = useState(true);
  const [autoSent, setAutoSent] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<(0 | 1 | null)[]>(Array(8).fill(null));
  const [showExcluded, setShowExcluded] = useState(false);
  const [openWhy, setOpenWhy] = useState<string | null>(null);

  useEffect(() => {
    const care = params.get("care") as CareType | null;
    const address = params.get("address");
    if (care) setNeeds({ recipients: [{ type: care, age: care === "baby" ? 0 : care === "toddler" ? 2 : care === "child" || care === "sick" ? 6 : 78 }] });
    if (address) setNeeds({ address });
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setNeeds({ day: weekdayIndex(date) });
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  const quizTags = quiz.flatMap((a, i) => (a === null ? [] : QUIZ_TAGS[i][a]));
  const effectiveNeeds = useMemo(() => ({ ...needs, hobbies: [...new Set([...needs.hobbies, ...quizTags])] }), [needs, quizTags.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const { matches, excluded } = useMemo(() => {
    const res = matchNannies(NANNIES, effectiveNeeds);
    // also exclude nannies whose slot is already held by another booking on this date
    const free = res.matches.filter((m) => !isSlotTaken(m.nanny.id, date, needs.startHour, needs.bookingType === "day" ? 8 : needs.bookingType === "2h" ? 2 : 1));
    return { matches: free, excluded: res.excluded };
  }, [effectiveNeeds, date, isSlotTaken, needs.startHour, needs.bookingType]);

  const r0 = needs.recipients[0];
  const noticeOk = new Date(`${date}T${hourLabel(needs.startHour)}`).getTime() - Date.now() >= MIN_NOTICE_H[needs.bookingType] * 3_600_000;

  const findAutomatically = () => {
    if (!user) return router.push("/login?next=/family/matches");
    const [first, ...rest] = matches.slice(0, 3);
    createBooking({
      nannyId: first.nanny.id,
      familyName: user.name,
      type: needs.bookingType,
      date,
      startHour: needs.startHour,
      notes: "",
      matchScore: first.score,
      autoQueue: rest.map((m) => m.nanny.id),
    });
    setAutoSent(first.nanny.firstName);
  };

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {autoSent && <Confetti />}
      <h1 className="text-3xl font-black md:text-4xl">{t("matches.title")} <Heart className="inline h-8 w-8 text-heart" /></h1>
      <p className="text-ink/70">{t("matches.sub")}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* NEEDS FORM */}
        <aside className="card h-fit space-y-5 p-5 lg:sticky lg:top-24">
          <fieldset>
            <legend className="label">{t("matches.who")}</legend>
            <div className="grid grid-cols-[1fr_80px] gap-2">
              <select className="input" value={r0.type} onChange={(e) => setNeeds({ recipients: [{ ...r0, type: e.target.value as CareType }] })}>
                {CARE_TYPES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {t(k(`care.${c.id}`))}</option>)}
              </select>
              <input type="number" min={0} max={100} className="input" aria-label={t("matches.age")} value={r0.age} onChange={(e) => setNeeds({ recipients: [{ ...r0, age: +e.target.value }] })} />
            </div>
            <p className="mt-1 text-xs text-ink/60">{t("matches.ageHint")}</p>
          </fieldset>

          <label className="block">
            <span className="label">{t("matches.address")}</span>
            <input className="input" value={needs.address} onChange={(e) => setNeeds({ address: e.target.value })} />
            <span className="text-xs text-ink/60">{t("matches.addressHint")}</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="label">{t("matches.date")}</span>
              <input type="date" className="input" min={toISODate(new Date())} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>
              <span className="label">{t("matches.start")}</span>
              <select className="input" value={needs.startHour} onChange={(e) => setNeeds({ startHour: +e.target.value })}>
                {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
              </select>
            </label>
          </div>

          <div>
            <span className="label">{t("matches.bookingType")}</span>
            <div className="grid grid-cols-3 gap-2">
              {(["1h", "2h", "day"] as BookingType[]).map((b) => (
                <button key={b} onClick={() => setNeeds({ bookingType: b })} className={`rounded-xl px-1 py-2 text-sm font-bold leading-tight ring-1 ring-brand/30 ${needs.bookingType === b ? "bg-brand text-white" : "bg-white"}`}>
                  {b === "day" ? t("type.dayShort") : t(`type.${b}`)}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="label">{t("matches.budget", { price: money(needs.budgetPerHour) })}</span>
            <input type="range" min={1000} max={5000} step={100} value={needs.budgetPerHour} onChange={(e) => setNeeds({ budgetPerHour: +e.target.value })} className="w-full accent-brand" />
          </label>

          <div>
            <span className="label">{t("matches.langs")}</span>
            <div className="flex flex-wrap gap-2">
              {(["Armenian", "Russian", "English"] as Language[]).map((l) => (
                <button key={l} onClick={() => setNeeds({ languages: toggle(needs.languages, l) })} className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ring-brand/30 ${needs.languages.includes(l) ? "bg-brand text-white" : "bg-white"}`}>{t(k(`lang.${l}`))}</button>
              ))}
            </div>
          </div>

          <details className="group">
            <summary className="cursor-pointer font-black text-brand-dark">{t("matches.wishes")}</summary>
            <div className="mt-3 space-y-4">
              <div>
                <span className="label">{t("matches.mustHave")}</span>
                <div className="flex flex-wrap gap-1.5">
                  {[...TRAINING, ...SKILLS].map((s) => (
                    <button key={s} onClick={() => setNeeds({ mustHaveSkills: toggle(needs.mustHaveSkills, s) })} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-brand/30 ${needs.mustHaveSkills.includes(s) ? "bg-brand text-white" : "bg-white"}`}>{td("tag.", s)}</button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="label">{t("matches.minExp", { years: tp("unit.years", needs.minExperience) })}</span>
                <input type="range" min={0} max={20} value={needs.minExperience} onChange={(e) => setNeeds({ minExperience: +e.target.value })} className="w-full accent-brand" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label>
                  <span className="label">{t("matches.gender")}</span>
                  <select className="input" value={needs.preferredGender} onChange={(e) => setNeeds({ preferredGender: e.target.value as "any" | "female" | "male" })}>
                    <option value="any">{t("common.any")}</option><option value="female">{t("common.female")}</option><option value="male">{t("common.male")}</option>
                  </select>
                </label>
                <label>
                  <span className="label">{t("matches.mustDrive")}</span>
                  <select className="input" value={needs.mustDrive} onChange={(e) => setNeeds({ mustDrive: e.target.value as "yes" | "no" | "nice" })}>
                    <option value="no">{t("matches.drive.no")}</option><option value="nice">{t("matches.drive.nice")}</option><option value="yes">{t("matches.drive.yes")}</option>
                  </select>
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 shrink-0 accent-brand" checked={needs.nonSmoker} onChange={(e) => setNeeds({ nonSmoker: e.target.checked })} /> {t("matches.nonSmoker")}</label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 shrink-0 accent-brand" checked={needs.pets} onChange={(e) => setNeeds({ pets: e.target.checked })} /> {t("matches.pets")}</label>
              <div>
                <span className="label">{t("matches.hobbies")}</span>
                <div className="flex flex-wrap gap-1.5">
                  {HOBBIES.map((h) => (
                    <button key={h} onClick={() => setNeeds({ hobbies: toggle(needs.hobbies, h) })} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-heart ${needs.hobbies.includes(h) ? "bg-heart" : "bg-white"}`}>{td("tag.", h)}</button>
                  ))}
                </div>
              </div>
            </div>
          </details>

          <details>
            <summary className="cursor-pointer font-black text-brand-dark">{t("matches.quiz", { n: quiz.filter((q) => q !== null).length })}</summary>
            <div className="mt-3 space-y-3">
              {QUIZ_TAGS.map((_, i) => (
                <div key={i}>
                  <p className="text-sm font-bold">{t(k(`quiz.${i + 1}q`))}</p>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {(["a", "b"] as const).map((a, j) => (
                      <button key={a} onClick={() => setQuiz((qs) => qs.map((x, n) => (n === i ? (j as 0 | 1) : x)))} className={`rounded-xl px-2 py-1.5 text-xs font-bold leading-tight ring-1 ring-heart ${quiz[i] === j ? "bg-heart" : "bg-white"}`}>{t(k(`quiz.${i + 1}${a}`))}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </aside>

        {/* RESULTS */}
        <section className="min-w-0">
          {loading ? (
            <HeartSpinner />
          ) : autoSent ? (
            <div className="card p-10 text-center">
              <Heart className="mx-auto h-14 w-14 text-heart" />
              <h2 className="mt-3 text-3xl font-black">{t("matches.sentTitle", { name: autoSent })}</h2>
              <p className="mx-auto mt-2 max-w-md text-ink/70">{t("matches.sentDesc", { name: autoSent })}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/family/bookings" className="btn-primary">{t("matches.track")}</Link>
                <button className="btn-ghost" onClick={() => setAutoSent(null)}>{t("matches.backTo")}</button>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-5xl">🔍</p>
              <h2 className="mt-2 text-2xl font-black">{t("matches.noneTitle")}</h2>
              <p className="mt-2 text-ink/70">{t("matches.noneDesc")}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-brand p-5 text-white">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white/80">{tp("matches.passed", matches.length)}</p>
                  <h2 className="text-2xl font-black">{t("matches.top3")}</h2>
                </div>
                <button onClick={findAutomatically} disabled={!noticeOk} className="btn bg-heart text-ink heart-pulse hover:-translate-y-0.5">
                  <Heart className="h-5 w-5 shrink-0" /> {t("matches.auto")}
                </button>
              </div>
              {!noticeOk && <p className="mt-2 text-sm font-bold text-bad">{needs.bookingType === "day" ? t("matches.noticeDay") : t("matches.noticeHourly")}</p>}

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {matches.slice(0, 3).map((m, i) => (
                  <div key={m.nanny.id} className="min-w-0">
                    <NannyCard nanny={m.nanny} score={m.score} distanceKm={m.distanceKm} reasons={m.reasons.slice(0, 3)} rank={i + 1} compact />
                    <button onClick={() => setOpenWhy(openWhy === m.nanny.id ? null : m.nanny.id)} className="mt-2 w-full text-sm font-bold text-brand-dark underline">
                      {openWhy === m.nanny.id ? t("matches.hideWhy") : t("matches.why")}
                    </button>
                    {openWhy === m.nanny.id && (
                      <div className="card mt-2 space-y-1.5 p-4 text-sm">
                        {(Object.keys(WEIGHTS) as Factor[]).map((f) => (
                          <div key={f}>
                            <div className="flex justify-between gap-2"><span>{t(`factor.${f}`)}</span><b className="whitespace-nowrap">{Math.round(m.factors[f] * WEIGHTS[f])}/{WEIGHTS[f]}</b></div>
                            <div className="h-1.5 rounded-full bg-brand-light"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${m.factors[f] * 100}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {matches.length > 3 && (
                <>
                  <h3 className="mt-10 text-xl font-black">{t("matches.more")}</h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    {matches.slice(3).map((m) => <NannyCard key={m.nanny.id} nanny={m.nanny} score={m.score} distanceKm={m.distanceKm} reasons={m.reasons.slice(0, 3)} />)}
                  </div>
                </>
              )}
            </>
          )}

          {!loading && !autoSent && excluded.length > 0 && (
            <div className="mt-10">
              <button onClick={() => setShowExcluded(!showExcluded)} className="font-bold text-ink/70 underline">
                {showExcluded ? t("matches.hideExcluded") : tp("matches.showExcluded", excluded.length)}
              </button>
              {showExcluded && (
                <ul className="mt-3 grid gap-2 md:grid-cols-2">
                  {excluded.map(({ nanny: n, failed }) => (
                    <li key={n.id} className="flex gap-3 rounded-xl bg-white/70 p-3 text-sm">
                      <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={36} />
                      <div className="min-w-0"><b>{n.firstName}</b><p className="text-ink/60">{failed.slice(0, 2).map(msg).join(" · ")}</p></div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
