"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Bits";
import { Heart } from "@/components/Icons";
import { MapLegend, MapView, type PinState } from "@/components/MapView";
import { NannyCard } from "@/components/NannyCard";
import type { MessageKey } from "@/i18n/en";
import { CARE_TYPES, DAYS, NANNIES } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { distanceKm, isFree, quickScore } from "@/lib/matching";
import { hourLabel, toISODate } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { CareType, Language } from "@/lib/types";

type Sort = "match" | "distance" | "price" | "rating";

export default function FindClient() {
  const { t, tp, money, num } = useT();
  const k = (x: string) => x as MessageKey;
  const params = useSearchParams();
  const router = useRouter();
  const { needs, user, createBooking, isSlotTaken } = useStore();
  const todayIdx = (new Date().getDay() + 6) % 7;

  const [care, setCare] = useState<CareType | "">((params.get("care") as CareType) ?? "");
  const [day, setDay] = useState<number | "">("");
  const [hour, setHour] = useState<number | "">("");
  const [dist, setDist] = useState(15);
  const [maxPrice, setMaxPrice] = useState(4000);
  const [minRating, setMinRating] = useState(0);
  const [langs, setLangs] = useState<Language[]>([]);
  const [drives, setDrives] = useState(false);
  const [minExp, setMinExp] = useState(0);
  const [certs, setCerts] = useState(false);
  const [gender, setGender] = useState<"" | "female" | "male">("");
  const [ageMax, setAgeMax] = useState(70);
  const [sort, setSort] = useState<Sort>("match");
  const [view, setView] = useState<"map" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [urgentSent, setUrgentSent] = useState(false);

  const rows = useMemo(() => {
    return NANNIES.map((n) => ({ nanny: n, distanceKm: distanceKm(needs.lat, needs.lng, n.lat, n.lng), score: quickScore(n, needs) }))
      .filter(({ nanny: n, distanceKm: d }) => {
        if (care && !n.careTypes.includes(care)) return false;
        if (day !== "" && !n.availability[day]) return false;
        if (day !== "" && hour !== "" && !isFree(n, day, hour, 1)) return false;
        if (d > dist) return false;
        if (n.pricePerHour > maxPrice) return false;
        if (n.rating < minRating) return false;
        if (langs.length && !langs.every((l) => n.languages.includes(l))) return false;
        if (drives && !n.drivingLicence) return false;
        if (n.yearsExperience < minExp) return false;
        if (certs && n.certificates.length === 0) return false;
        if (gender && n.gender !== gender) return false;
        if (n.age > ageMax) return false;
        return true;
      })
      .sort((a, b) =>
        sort === "match" ? b.score - a.score : sort === "distance" ? a.distanceKm - b.distanceKm : sort === "price" ? a.nanny.pricePerHour - b.nanny.pricePerHour : b.nanny.rating - a.nanny.rating,
      );
  }, [needs, care, day, hour, dist, maxPrice, minRating, langs, drives, minExp, certs, gender, ageMax, sort]);

  const pinState = (id: string): PinState => {
    const n = NANNIES.find((x) => x.id === id)!;
    if (!n.online) return "offline";
    return n.availability[todayIdx] ? "available" : "busy";
  };

  // Urgent care: verified, online, within 3 km, free right now for 2 hours
  const nowH = new Date().getHours() + 1;
  const today = toISODate(new Date());
  const urgent = NANNIES.map((n) => ({ n, d: distanceKm(needs.lat, needs.lng, n.lat, n.lng) }))
    .filter(({ n, d }) => n.online && d <= 3 && isFree(n, todayIdx, nowH, 2) && !isSlotTaken(n.id, today, nowH, 2))
    .sort((a, b) => a.d - b.d);

  const sendUrgent = () => {
    if (!user) return router.push("/login?next=/find");
    const [first, ...rest] = urgent;
    createBooking({
      nannyId: first.n.id,
      familyName: user.name,
      type: "2h",
      date: today,
      startHour: nowH,
      notes: "",
      urgent: true,
      autoQueue: rest.map((r) => r.n.id),
    });
    setUrgentSent(true);
  };

  const toggleLang = (l: Language) => setLangs((ls) => (ls.includes(l) ? ls.filter((x) => x !== l) : [...ls, l]));

  const filters = (
    <div className="space-y-4">
      <label className="block">
        <span className="label">{t("find.careType")}</span>
        <select className="input" value={care} onChange={(e) => setCare(e.target.value as CareType)}>
          <option value="">{t("find.allCare")}</option>
          {CARE_TYPES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {t(k(`care.${c.id}`))}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="label">{t("find.day")}</span>
          <select className="input" value={day} onChange={(e) => setDay(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">{t("common.any")}</option>
            {DAYS.map((d, i) => <option key={d} value={i}>{t(k(`day.${i}`))}</option>)}
          </select>
        </label>
        <label>
          <span className="label">{t("find.from")}</span>
          <select className="input" value={hour} onChange={(e) => setHour(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">{t("common.any")}</option>
            {Array.from({ length: 16 }, (_, i) => i + 7).map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="label">{t("find.distance", { n: dist })}</span>
        <input type="range" min={1} max={30} value={dist} onChange={(e) => setDist(+e.target.value)} className="w-full accent-brand" />
      </label>
      <label className="block">
        <span className="label">{t("find.maxPrice", { price: money(maxPrice) })}</span>
        <input type="range" min={1000} max={5000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-brand" />
      </label>
      <label className="block">
        <span className="label">{t("find.minRating")}</span>
        <select className="input" value={minRating} onChange={(e) => setMinRating(+e.target.value)}>
          <option value={0}>{t("common.any")}</option>{[4.5, 4.8, 4.9].map((r) => <option key={r} value={r}>{num(r, 1)}+</option>)}
        </select>
      </label>
      <div>
        <span className="label">{t("find.languages")}</span>
        <div className="flex flex-wrap gap-2">
          {(["Armenian", "Russian", "English"] as Language[]).map((l) => (
            <button key={l} type="button" onClick={() => toggleLang(l)} className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ring-brand/30 ${langs.includes(l) ? "bg-brand text-white" : "bg-white"}`}>{t(k(`lang.${l}`))}</button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="label">{t("find.minExp", { years: tp("unit.years", minExp) })}</span>
        <input type="range" min={0} max={20} value={minExp} onChange={(e) => setMinExp(+e.target.value)} className="w-full accent-brand" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="label">{t("find.gender")}</span>
          <select className="input" value={gender} onChange={(e) => setGender(e.target.value as "" | "female" | "male")}>
            <option value="">{t("common.any")}</option><option value="female">{t("common.female")}</option><option value="male">{t("common.male")}</option>
          </select>
        </label>
        <label>
          <span className="label">{t("find.ageUpTo", { n: ageMax })}</span>
          <input type="range" min={20} max={70} value={ageMax} onChange={(e) => setAgeMax(+e.target.value)} className="mt-3 w-full accent-brand" />
        </label>
      </div>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={drives} onChange={(e) => setDrives(e.target.checked)} className="h-4 w-4 shrink-0 accent-brand" /> {t("find.drives")}</label>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={certs} onChange={(e) => setCerts(e.target.checked)} className="h-4 w-4 shrink-0 accent-brand" /> {t("find.certs")}</label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="text-3xl font-black md:text-4xl">{t("find.title")}</h1>
          <p className="text-ink/70">{t("find.sub", { address: needs.address })}</p>
        </div>
        <button onClick={() => { setUrgentOpen(true); setUrgentSent(false); }} className="btn bg-bad text-white shadow-soft hover:-translate-y-0.5">
          ⚡ {t("urgent.btn")}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <button className="btn-ghost btn-sm mb-3 w-full lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? t("find.hideFilters") : t("find.showFilters")}
          </button>
          <div className={`card p-5 ${showFilters ? "" : "hidden"} lg:block`}>{filters}</div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold">{tp("find.count", rows.length)}</p>
            <div className="flex flex-wrap items-center gap-2">
              <select className="input !w-auto min-w-0 max-w-full !py-1.5 text-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label={t("find.sortBy")}>
                {(["match", "distance", "price", "rating"] as const).map((v) => <option key={v} value={v}>{t(`find.sort.${v}`)}</option>)}
              </select>
              <div className="flex rounded-full bg-white p-1 shadow-soft xl:hidden">
                {(["list", "map"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1 text-sm font-bold ${view === v ? "bg-brand text-white" : ""}`}>{t(`find.${v}`)}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className={`${view === "map" ? "hidden" : ""} grid content-start gap-5 xl:block xl:space-y-5`}>
              {rows.length === 0 && (
                <div className="card p-10 text-center text-ink/70">{t("find.empty")}</div>
              )}
              {rows.map((r) => <NannyCard key={r.nanny.id} nanny={r.nanny} score={r.score} distanceKm={r.distanceKm} />)}
            </div>
            <div className={`${view === "list" ? "hidden" : ""} xl:block`}>
              <div className="card sticky top-24 p-3">
                <MapView center={[needs.lat, needs.lng]} radiusKm={dist} pins={rows.map((r) => ({ ...r, state: pinState(r.nanny.id) }))} height={560} zoom={dist > 10 ? 11 : 13} />
                <div className="px-2 pt-3"><MapLegend /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {urgentOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-ink/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={t("urgent.btn")}>
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            {urgentSent ? (
              <div className="text-center">
                <Heart className="mx-auto h-12 w-12 text-heart" />
                <h2 className="mt-2 text-2xl font-black">{t("urgent.sentTitle")}</h2>
                <p className="mt-2 text-ink/70">{t("urgent.sentDesc", { name: urgent[0]?.n.firstName ?? "" })}</p>
                <div className="mt-5 flex justify-center gap-2">
                  <Link href="/family/bookings" className="btn-primary">{t("urgent.track")}</Link>
                  <button className="btn-ghost" onClick={() => setUrgentOpen(false)}>{t("common.close")}</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black">{t("urgent.title")}</h2>
                <p className="mt-1 text-ink/70">{t("urgent.desc", { time: hourLabel(nowH) })}</p>
                <ul className="mt-4 space-y-2">
                  {urgent.length === 0 && <li className="rounded-xl bg-blush p-4 text-sm">{t("urgent.none")}</li>}
                  {urgent.map(({ n, d }, i) => (
                    <li key={n.id} className="flex items-center gap-3 rounded-xl bg-brand-light/60 p-3">
                      <span className="w-5 text-center font-black text-brand-dark">{i + 1}</span>
                      <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={40} />
                      <div className="min-w-0 flex-1"><b>{n.firstName}</b> <span className="text-sm text-ink/60">· {t("common.km", { n: num(d, 1) })} · ★ {num(n.rating, 1)}</span></div>
                      <b className="whitespace-nowrap">{money(n.pricePerHour * 2)}</b>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button className="btn-ghost" onClick={() => setUrgentOpen(false)}>{t("common.cancel")}</button>
                  <button className="btn bg-bad text-white" disabled={urgent.length === 0} onClick={sendUrgent}>{t("urgent.send")}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
