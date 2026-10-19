"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Confetti } from "@/components/Bits";
import { Heart, HeartSpinner, Shield } from "@/components/Icons";
import type { MessageKey } from "@/i18n/en";
import { CARE_TYPES, DAYS, HOBBIES, SKILLS, TRAINING } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { BookingType, CareType, Language } from "@/lib/types";

type Role = "family" | "nanny";
const STAGES = ["role", "account", "confirm", "verify", "profile", "live"] as const;

function Progress({ stage }: { stage: number }) {
  const { t } = useT();
  return (
    <ol className="mb-8 flex items-center gap-1 overflow-x-auto text-xs font-bold">
      {STAGES.map((s, i) => (
        <li key={s} className="flex shrink-0 items-center gap-1">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${i < stage ? "bg-ok text-white" : i === stage ? "bg-brand text-white" : "bg-ink/10"}`}>{i < stage ? "✓" : i + 1}</span>
          <span className={i === stage ? "text-ink" : "text-ink/50"}>{t(`su.stage.${s}`)}</span>
          {i < STAGES.length - 1 && <span className="mx-1 h-0.5 w-6 bg-ink/10" />}
        </li>
      ))}
    </ol>
  );
}

/** Multi-select chips. Values are stable ids; `label` turns an id into text in the current language. */
const Chips = ({ options, value, onChange, pink, label = (o) => o }: { options: string[]; value: string[]; onChange: (v: string[]) => void; pink?: boolean; label?: (id: string) => string }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((o) => (
      <button
        type="button"
        key={o}
        onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}
        className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ${pink ? "ring-heart" : "ring-brand/30"} ${value.includes(o) ? (pink ? "bg-heart" : "bg-brand text-white") : "bg-white"}`}
      >
        {label(o)}
      </button>
    ))}
  </div>
);

function Camera({ onCapture }: { onCapture: (dataUrl: string) => void }) {
  const { t } = useT();
  const video = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  const [phase, setPhase] = useState<"idle" | "look" | "left" | "right" | "done">("idle");
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  const start = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (video.current) video.current.srcObject = stream.current;
      setPhase("look");
      setTimeout(() => setPhase("left"), 1500);
      setTimeout(() => setPhase("right"), 3000);
      setTimeout(() => {
        const v = video.current!;
        const c = document.createElement("canvas");
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        c.getContext("2d")!.drawImage(v, 0, 0);
        onCapture(c.toDataURL("image/jpeg", 0.7));
        stream.current?.getTracks().forEach((t) => t.stop());
        setPhase("done");
      }, 4500);
    } catch {
      setErr(t("cam.err"));
    }
  };

  const prompt = phase === "idle" ? "" : t(`cam.${phase}`);
  return (
    <div>
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[16px] bg-ink/90">
        <video ref={video} autoPlay playsInline muted className={`h-full w-full scale-x-[-1] object-cover ${phase === "idle" ? "hidden" : ""}`} />
        <div className="pointer-events-none absolute inset-8 rounded-[50%] border-4 border-dashed border-white/60" />
        {phase === "idle" && <button type="button" onClick={start} className="btn-primary relative">{t("cam.start")}</button>}
        {prompt && <p className="absolute inset-x-3 bottom-3 mx-auto w-fit rounded-full bg-white/90 px-4 py-1 text-center text-sm font-black">{prompt}</p>}
      </div>
      {err && <p className="mt-2 text-sm font-bold text-bad">{err}</p>}
    </div>
  );
}

export default function SignupClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { login, setNeeds, needs } = useStore();
  const { t, tn, td, tp, money, date: fmtDate } = useT();
  const k = (x: string) => x as MessageKey;
  const initialRole = params.get("role") as Role | null;
  const [stage, setStage] = useState(params.get("step") === "verify" ? 3 : initialRole ? 1 : 0);
  const [role, setRole] = useState<Role>(initialRole ?? "family");

  // account
  const [contact, setContact] = useState("");
  const [pw, setPw] = useState("");
  const [terms, setTerms] = useState(false);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");

  // verification
  const [passport, setPassport] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<null | "verified" | "review">(null);
  const ocr = role === "nanny"
    ? { name: "Gayane", surname: "Hakobyan", dob: "1981-05-14", age: 45, doc: "AM 4410982" }
    : { name: "Anna", surname: "Petrosyan", dob: "1994-03-12", age: 32, doc: "AM 1234567" };

  // profile wizard
  const [step, setStep] = useState(0);
  const steps = role === "nanny" ? [1, 2, 3, 4, 5, 6].map((n) => t(k(`su.ns${n}`))) : [1, 2, 3, 4, 5].map((n) => t(k(`su.fs${n}`)));
  const [p, setP] = useState({
    gender: "female", bio: "", languages: ["Armenian"] as string[], hobbies: [] as string[],
    address: "", maxKm: 5, licence: false, car: false,
    care: [] as string[], ageFrom: 0, ageTo: 3, maxChildren: 2,
    years: 3, training: [] as string[], skills: [] as string[], smoker: false, pets: "yes",
    hourly: 2500, daily: 16000, types: ["1h", "2h", "day"] as string[], days: [0, 1, 2, 3, 4] as number[], from: 9, to: 18, overnight: false,
    // family
    recipients: [{ type: "baby" as CareType, age: 0 }], health: [] as string[], famPets: false, mustDrive: "no",
    prefGender: "any", minYears: 0, mustHave: [] as string[], nonSmoker: true, bookingType: "2h" as BookingType, budget: 2500,
  });
  const set = (patch: Partial<typeof p>) => setP((x) => ({ ...x, ...patch }));

  const verify = (forceReview = false) => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setResult(forceReview ? "review" : "verified");
    }, 2200);
  };

  const finish = () => {
    if (role === "family") {
      setNeeds({
        address: p.address || needs.address,
        languages: p.languages as Language[],
        hobbies: p.hobbies,
        recipients: p.recipients,
        pets: p.famPets,
        mustDrive: p.mustDrive as "yes" | "no" | "nice",
        preferredGender: p.prefGender as "any" | "female" | "male",
        minExperience: p.minYears,
        mustHaveSkills: p.mustHave,
        nonSmoker: p.nonSmoker,
        bookingType: p.bookingType,
        budgetPerHour: p.budget,
      });
    }
    setStage(5);
  };

  const enter = () => {
    login(role === "family" ? { role, name: `${ocr.name} ${ocr.surname}`, verified: true } : { role, name: `${ocr.name} ${ocr.surname}`, verified: true, nannyId: "n1" });
    router.push(role === "family" ? "/family/matches" : "/nanny");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Progress stage={stage} />

      {stage === 0 && (
        <div>
          <h1 className="text-3xl font-black">{t("su.join")}</h1>
          <p className="text-ink/70">{t("su.choose")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {([["family", t("su.hire"), "👨‍👩‍👧", t("su.hireD")], ["nanny", t("su.am"), "🧑‍🍼", t("su.amD")]] as const).map(([r, title, e, d]) => (
              <button key={r} onClick={() => { setRole(r); setStage(1); }} className={`card lift p-6 text-left ${role === r ? "ring-2 ring-brand" : ""}`}>
                <span className="text-5xl">{e}</span>
                <h2 className="mt-3 text-xl font-black">{title}</h2>
                <p className="text-sm text-ink/70">{d}</p>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-sm">{t("su.have")} <Link href="/login" className="font-bold text-brand-dark">{t("nav.login")}</Link></p>
        </div>
      )}

      {stage === 1 && (
        <form className="card space-y-4 p-8" onSubmit={(e) => { e.preventDefault(); setStage(2); }}>
          <h1 className="text-2xl font-black">{role === "family" ? t("su.createFamily") : t("su.createNanny")}</h1>
          <label className="block"><span className="label">{t("login.contact")}</span><input className="input" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="anna@example.com / +374 91 …" /></label>
          <label className="block"><span className="label">{t("su.pw")}</span><input type="password" minLength={8} className="input" required value={pw} onChange={(e) => setPw(e.target.value)} /></label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-brand" checked={terms} onChange={(e) => setTerms(e.target.checked)} required /> <span>{tn("su.terms", {}, { terms: <Link href="/legal#terms" className="font-bold text-brand-dark underline">{t("footer.terms")}</Link>, privacy: <Link href="/legal#privacy" className="font-bold text-brand-dark underline">{t("footer.privacy")}</Link> })}</span></label>
          <button className="btn-primary w-full" disabled={!terms}>{t("su.continue")}</button>
          <button type="button" className="btn-ghost w-full" onClick={() => { setContact("anna@gmail.com"); setTerms(true); setStage(3); }}>{t("login.google")}</button>
          <button type="button" className="text-sm font-bold text-ink/60" onClick={() => setStage(0)}>{t("su.changeRole")}</button>
        </form>
      )}

      {stage === 2 && (
        <form className="card space-y-4 p-8" onSubmit={(e) => { e.preventDefault(); if (code === "123456") setStage(3); else setCodeErr(t("su.wrongCode")); }}>
          <h1 className="text-2xl font-black">{t("su.confirmTitle")}</h1>
          <p className="text-ink/70">{tn("su.sent", {}, { contact: <b className="break-all">{contact}</b> })}</p>
          <input inputMode="numeric" maxLength={6} className="input text-center font-mono text-3xl tracking-[0.5em]" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setCodeErr(""); }} placeholder="••••••" autoFocus />
          {codeErr && <p className="text-sm font-bold text-bad">{codeErr}</p>}
          <p className="text-xs text-ink/50">{t("su.demoCode")}</p>
          <button className="btn-primary w-full" disabled={code.length !== 6}>{t("su.confirm")}</button>
          <button type="button" className="text-sm font-bold text-brand-dark">{t("su.resend")}</button>
        </form>
      )}

      {stage === 3 && (
        <div className="card space-y-6 p-8">
          <div className="flex items-start gap-3">
            <Shield className="h-10 w-10 shrink-0 text-brand" />
            <div>
              <h1 className="text-2xl font-black">{t("su.vTitle")}</h1>
              <p className="text-ink/70">{t("su.vSub")}</p>
            </div>
          </div>
          {verifying ? (
            <HeartSpinner label={t("su.vReading")} />
          ) : result ? (
            <div>
              {result === "verified" ? (
                <div className="rounded-[16px] bg-ok/10 p-5">
                  <p className="text-xl font-black text-ok">{t("su.vOk")}</p>
                  <p className="mt-1 text-sm">{t("su.vOkSub")}</p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div><dt className="text-ink/60">{t("su.name")}</dt><dd className="font-bold">🔒 {ocr.name}</dd></div>
                    <div><dt className="text-ink/60">{t("su.surname")}</dt><dd className="font-bold">🔒 {ocr.surname}</dd></div>
                    <div><dt className="text-ink/60">{t("su.dob")}</dt><dd className="font-bold">🔒 {fmtDate(ocr.dob, { day: "numeric", month: "long", year: "numeric" })} ({tp("unit.years", ocr.age)})</dd></div>
                    <div><dt className="text-ink/60">{t("su.doc")}</dt><dd className="font-bold">🔒 {ocr.doc.slice(0, 4)}•••••</dd></div>
                  </dl>
                </div>
              ) : (
                <div className="rounded-[16px] bg-[#FFF4D6] p-5">
                  <p className="text-xl font-black">{t("su.review")}</p>
                  <p className="mt-1 text-sm">{t("su.reviewSub")}</p>
                </div>
              )}
              <button className="btn-primary mt-5 w-full" onClick={() => setStage(4)}>{t("su.toProfile")}</button>
            </div>
          ) : (
            <>
              <div>
                <p className="label">{t("su.p1")}</p>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-brand/40 bg-brand-light/40 p-6 text-center hover:bg-brand-light">
                  {passport ? <img src={passport} alt={t("su.docAlt")} className="max-h-40 rounded-lg" /> : <><span className="text-4xl">🪪</span><span className="font-bold">{t("su.upload")}</span><span className="text-xs text-ink/60">{t("su.uploadHint")}</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPassport(URL.createObjectURL(f)); }} />
                </label>
              </div>
              <div>
                <p className="label">{t("su.p2")}</p>
                {selfie ? <img src={selfie} alt={t("su.selfieAlt")} className="mx-auto max-h-48 scale-x-[-1] rounded-[16px]" /> : <Camera onCapture={setSelfie} />}
              </div>
              <p className="rounded-xl bg-cream p-3 text-xs text-ink/70">{t("su.privacy")}</p>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary flex-1" disabled={!passport || !selfie} onClick={() => verify()}>{t("su.verify")}</button>
                <button className="btn-ghost" onClick={() => { setPassport("data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="190"><rect width="300" height="190" rx="12" fill="#E3F4F6"/><rect x="20" y="40" width="80" height="100" rx="8" fill="#0C8FA0" opacity=".4"/><rect x="120" y="50" width="150" height="12" rx="6" fill="#1F3A40" opacity=".3"/><rect x="120" y="75" width="110" height="12" rx="6" fill="#1F3A40" opacity=".3"/><rect x="120" y="100" width="130" height="12" rx="6" fill="#1F3A40" opacity=".3"/><text x="20" y="28" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0A7785">REPUBLIC OF ARMENIA · DEMO</text></svg>')); setSelfie("data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#FDEEEF"/><circle cx="100" cy="85" r="40" fill="#EFC3A4"/><rect x="45" y="135" width="110" height="80" rx="40" fill="#0C8FA0"/></svg>')); }}>{t("su.demoImgs")}</button>
              </div>
              {passport && selfie && <button className="text-xs font-bold text-ink/50 underline" onClick={() => verify(true)}>{t("su.simReview")}</button>}
            </>
          )}
        </div>
      )}

      {stage === 4 && (
        <div className="card p-8">
          <div className="mb-6">
            <div className="flex justify-between gap-3 text-sm font-bold"><span>{t("su.stepOf", { n: step + 1, total: steps.length, name: steps[step] })}</span><span>{Math.round(((step + 1) / steps.length) * 100)}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-brand-light"><div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          </div>

          <div className="space-y-5">
            {/* ---------- NANNY ---------- */}
            {role === "nanny" && step === 0 && (
              <>
                <p className="rounded-xl bg-brand-light/60 p-3 text-sm">{t("su.fromPassport", { name: `${ocr.name} ${ocr.surname}`, age: ocr.age })}</p>
                <label className="block"><span className="label">{t("su.gender")}</span><select className="input" value={p.gender} onChange={(e) => set({ gender: e.target.value })}><option value="female">{t("common.female")}</option><option value="male">{t("common.male")}</option></select></label>
                <label className="block"><span className="label">{t("su.photo")}</span><input type="file" accept="image/*" className="input" /></label>
                <label className="block"><span className="label">{t("su.video")}</span><input type="file" accept="video/*" className="input" /></label>
                <label className="block"><span className="label">{t("su.bio", { n: p.bio.length })}</span><textarea className="input min-h-28" maxLength={500} value={p.bio} onChange={(e) => set({ bio: e.target.value })} placeholder={t("su.bioPh")} /></label>
                <div><span className="label">{t("profile.languages")}</span><Chips options={["Armenian", "Russian", "English", "Other"]} value={p.languages} onChange={(v) => set({ languages: v })} label={(o) => td("lang.", o)} /></div>
                <div><span className="label">{t("su.hobbies")}</span><Chips pink options={HOBBIES} value={p.hobbies} onChange={(v) => set({ hobbies: v })} label={(o) => td("tag.", o)} /></div>
              </>
            )}
            {role === "nanny" && step === 1 && (
              <>
                <label className="block"><span className="label">{t("su.home")}</span><input className="input" value={p.address} onChange={(e) => set({ address: e.target.value })} placeholder={t("su.homePh")} /><span className="text-xs text-ink/60">{t("su.homeHint")}</span></label>
                <label className="block"><span className="label">{t("su.maxKm", { n: p.maxKm })}</span><input type="range" min={1} max={30} value={p.maxKm} onChange={(e) => set({ maxKm: +e.target.value })} className="w-full accent-brand" /></label>
                <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand" checked={p.licence} onChange={(e) => set({ licence: e.target.checked })} /> {t("su.licence")}</label>
                {p.licence && <label className="block"><span className="label">{t("su.licenceUp")}</span><input type="file" accept="image/*,application/pdf" className="input" /></label>}
                <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand" checked={p.car} onChange={(e) => set({ car: e.target.checked })} /> {t("su.car")}</label>
              </>
            )}
            {role === "nanny" && step === 2 && (
              <>
                <div><span className="label">{t("su.careTypes")}</span><Chips options={CARE_TYPES.map((c) => c.id)} value={p.care} onChange={(v) => set({ care: v })} label={(o) => td("care.", o)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <label><span className="label">{t("su.ageFrom")}</span><input type="number" min={0} max={100} className="input" value={p.ageFrom} onChange={(e) => set({ ageFrom: +e.target.value })} /></label>
                  <label><span className="label">{t("su.ageTo")}</span><input type="number" min={0} max={100} className="input" value={p.ageTo} onChange={(e) => set({ ageTo: +e.target.value })} /></label>
                </div>
                <label className="block"><span className="label">{t("su.maxChildren", { n: p.maxChildren })}</span><input type="range" min={1} max={4} value={p.maxChildren} onChange={(e) => set({ maxChildren: +e.target.value })} className="w-full accent-brand" /></label>
              </>
            )}
            {role === "nanny" && step === 3 && (
              <>
                <label className="block"><span className="label">{t("su.years")}</span><input type="number" min={0} className="input" value={p.years} onChange={(e) => set({ years: +e.target.value })} /></label>
                <div><span className="label">{t("su.learned")}</span><Chips options={[...TRAINING, "other"]} value={p.training} onChange={(v) => set({ training: v })} label={(o) => td("tag.", o)} /></div>
                <div><span className="label">{t("su.skills")}</span><Chips pink options={SKILLS} value={p.skills} onChange={(v) => set({ skills: v })} label={(o) => td("tag.", o)} /></div>
                <label className="block"><span className="label">{t("su.certs")}</span><input type="file" multiple accept="image/*,application/pdf" className="input" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label><span className="label">{t("su.smoker")}</span><select className="input" value={String(p.smoker)} onChange={(e) => set({ smoker: e.target.value === "true" })}><option value="false">{t("common.no")}</option><option value="true">{t("common.yes")}</option></select></label>
                  <label><span className="label">{t("su.pets")}</span><select className="input" value={p.pets} onChange={(e) => set({ pets: e.target.value })}><option value="yes">{t("common.yes")}</option><option value="no">{t("common.no")}</option><option value="allergic">{t("su.allergic")}</option></select></label>
                </div>
              </>
            )}
            {role === "nanny" && step === 4 && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label><span className="label">{t("su.hourly")}</span><input type="number" step={100} className="input" value={p.hourly} onChange={(e) => set({ hourly: +e.target.value })} /></label>
                  <label><span className="label">{t("su.daily")}</span><input type="number" step={500} className="input" value={p.daily} onChange={(e) => set({ daily: +e.target.value })} /></label>
                </div>
                <p className="text-sm text-ink/70">{tn("su.receive", {}, { amount: <b className="whitespace-nowrap">{money(p.hourly * 0.9)}</b> })}</p>
                <div><span className="label">{t("su.types")}</span><Chips options={["1h", "2h", "day"]} value={p.types} onChange={(v) => set({ types: v })} label={(o) => td("type.", o)} /></div>
                <div>
                  <span className="label">{t("su.weekly")}</span>
                  <div className="flex flex-wrap gap-1.5">{DAYS.map((d, i) => <button type="button" key={d} aria-pressed={p.days.includes(i)} onClick={() => set({ days: p.days.includes(i) ? p.days.filter((x) => x !== i) : [...p.days, i] })} className={`h-10 min-w-12 rounded-xl px-2 font-bold ${p.days.includes(i) ? "bg-ok text-white" : "bg-ink/5"}`}>{t(k(`day.${i}`))}</button>)}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">{t("su.from")} <input type="number" min={6} max={23} className="input !w-20" value={p.from} onChange={(e) => set({ from: +e.target.value })} /> {t("su.to")} <input type="number" min={7} max={24} className="input !w-20" value={p.to} onChange={(e) => set({ to: +e.target.value })} /> <span className="text-ink/60">{t("su.fineTune")}</span></div>
                </div>
                <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand" checked={p.overnight} onChange={(e) => set({ overnight: e.target.checked })} /> {t("su.overnight")}</label>
              </>
            )}
            {role === "nanny" && step === 5 && (
              <>
                <p>{t("su.payoutText")}</p>
                <div className="rounded-[16px] bg-brand-light p-5 text-sm">{t("su.payoutDemo")}</div>
              </>
            )}

            {/* ---------- FAMILY ---------- */}
            {role === "family" && step === 0 && (
              <>
                <p className="rounded-xl bg-brand-light/60 p-3 text-sm">{t("su.fromPassport", { name: `${ocr.name} ${ocr.surname}`, age: ocr.age })}</p>
                <label className="block"><span className="label">{t("su.photoOpt")}</span><input type="file" accept="image/*" className="input" /></label>
                <div><span className="label">{t("su.homeLangs")}</span><Chips options={["Armenian", "Russian", "English", "Other"]} value={p.languages} onChange={(v) => set({ languages: v })} label={(o) => td("lang.", o)} /></div>
                <div><span className="label">{t("su.famHobbies")}</span><Chips pink options={HOBBIES} value={p.hobbies} onChange={(v) => set({ hobbies: v })} label={(o) => td("tag.", o)} /></div>
              </>
            )}
            {role === "family" && step === 1 && (
              <>
                <label className="block"><span className="label">{t("matches.address")}</span><input className="input" value={p.address} onChange={(e) => set({ address: e.target.value })} placeholder="Komitas Ave, Arabkir, Yerevan" /><span className="text-xs text-ink/60">{t("su.careAddrHint")}</span></label>
                <label className="block"><span className="label">{t("matches.mustDrive")}</span><select className="input" value={p.mustDrive} onChange={(e) => set({ mustDrive: e.target.value })}><option value="no">{t("matches.drive.no")}</option><option value="nice">{t("matches.drive.nice")}</option><option value="yes">{t("matches.drive.yes")}</option></select></label>
              </>
            )}
            {role === "family" && step === 2 && (
              <>
                <span className="label">{t("su.persons")}</span>
                {p.recipients.map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_auto] gap-2">
                    <select className="input" value={r.type} onChange={(e) => set({ recipients: p.recipients.map((x, j) => (j === i ? { ...x, type: e.target.value as CareType } : x)) })}>{CARE_TYPES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {t(k(`care.${c.id}`))}</option>)}</select>
                    <input type="number" min={0} max={110} className="input" aria-label={t("matches.age")} value={r.age} onChange={(e) => set({ recipients: p.recipients.map((x, j) => (j === i ? { ...x, age: +e.target.value } : x)) })} />
                    <button type="button" className="px-2 text-bad" disabled={p.recipients.length === 1} onClick={() => set({ recipients: p.recipients.filter((_, j) => j !== i) })} aria-label={t("su.remove")}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn-ghost btn-sm" onClick={() => set({ recipients: [...p.recipients, { type: "child", age: 5 }] })}>{t("su.addPerson")}</button>
                <div><span className="label">{t("su.health")}</span><Chips pink options={["allergies", "mobility", "medication reminders", "recovering from illness"]} value={p.health} onChange={(v) => set({ health: v })} label={(o) => td("tag.", o)} /></div>
                <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 shrink-0 accent-brand" checked={p.famPets} onChange={(e) => set({ famPets: e.target.checked })} /> {t("matches.pets")}</label>
              </>
            )}
            {role === "family" && step === 3 && (
              <>
                <label className="block"><span className="label">{t("su.prefGender")}</span><select className="input" value={p.prefGender} onChange={(e) => set({ prefGender: e.target.value })}><option value="any">{t("common.any")}</option><option value="female">{t("common.female")}</option><option value="male">{t("common.male")}</option></select></label>
                <label className="block"><span className="label">{t("matches.minExp", { years: tp("unit.years", p.minYears) })}</span><input type="range" min={0} max={20} value={p.minYears} onChange={(e) => set({ minYears: +e.target.value })} className="w-full accent-brand" /></label>
                <div><span className="label">{t("matches.mustHave")}</span><Chips options={[...TRAINING, ...SKILLS]} value={p.mustHave} onChange={(v) => set({ mustHave: v })} label={(o) => td("tag.", o)} /></div>
                <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 shrink-0 accent-brand" checked={p.nonSmoker} onChange={(e) => set({ nonSmoker: e.target.checked })} /> {t("matches.nonSmoker")}</label>
              </>
            )}
            {role === "family" && step === 4 && (
              <>
                <div><span className="label">{t("su.usualType")}</span><Chips options={["1h", "2h", "day"]} value={[p.bookingType]} onChange={(v) => set({ bookingType: (v[v.length - 1] ?? "2h") as BookingType })} label={(o) => td("type.", o)} /></div>
                <label className="block"><span className="label">{t("matches.budget", { price: money(p.budget) })}</span><input type="range" min={1000} max={5000} step={100} value={p.budget} onChange={(e) => set({ budget: +e.target.value })} className="w-full accent-brand" /></label>
                <p className="text-sm text-ink/70">{t("su.pickLater")}</p>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between gap-3">
            <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>{t("common.back")}</button>
            {step < steps.length - 1 ? (
              <button className="btn-primary" disabled={role === "nanny" && step === 0 && p.bio.length > 0 && p.bio.length < 50} onClick={() => setStep(step + 1)}>{t("common.next")}</button>
            ) : (
              <button className="btn-primary" onClick={finish}>{t("common.finish")}</button>
            )}
          </div>
        </div>
      )}

      {stage === 5 && (
        <div className="card p-10 text-center">
          <Confetti />
          <Heart className="mx-auto h-14 w-14 text-heart" />
          <h1 className="mt-3 text-3xl font-black">{t("su.liveTitle")}</h1>
          <p className="mt-2 text-ink/70">{role === "family" ? t("su.liveFamily") : t("su.liveNanny")}</p>
          {role === "nanny" && <p className="mt-2 text-xs text-ink/50">{t("su.liveDemo")}</p>}
          <button className="btn-primary mt-6" onClick={enter}>{role === "family" ? t("su.seeMatches") : t("su.goDash")}</button>
        </div>
      )}
    </div>
  );
}
