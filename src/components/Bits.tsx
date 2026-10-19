"use client";

import { useEffect, useState } from "react";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { Heart } from "./Icons";

export function Avatar({ name, color, size = 56 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-black text-white ring-4 ring-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function Stars({ value, size = "text-base" }: { value: number; size?: string }) {
  const { t, num } = useT();
  return (
    <span className={`${size} whitespace-nowrap text-[#F2B33D]`} role="img" aria-label={t("common.outOf5", { n: num(value, 1) })}>
      {"★★★★★".slice(0, Math.round(value))}
      <span className="text-ink/20">{"★★★★★".slice(Math.round(value))}</span>
    </span>
  );
}

export function MatchBadge({ score }: { score: number }) {
  const { t } = useT();
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-heart px-3 py-1 text-sm font-black text-ink">
      <Heart className="h-4 w-4 shrink-0 text-white" /> {t("common.match", { n: score })}
    </span>
  );
}

export function VerifiedBadge() {
  const { t } = useT();
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-ok/10 px-2.5 py-0.5 text-xs font-bold text-ok">
      {t("common.verified")}
    </span>
  );
}

export function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: ["#0C8FA0", "#F4ADB3", "#3BB273", "#F2B33D", "#E3F4F6"][i % 5],
    })),
  );
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 3500);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ left: `${p.left}vw`, animationDelay: `${p.delay}s`, background: p.color }} />
      ))}
    </>
  );
}

export function Countdown({ until, now }: { until: number; now: number }) {
  const ms = Math.max(0, until - now);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const urgent = ms < 15 * 60_000;
  return (
    <span className={`font-mono font-bold ${urgent ? "text-bad" : "text-brand-dark"}`}>
      {h > 0 ? `${h}:` : ""}
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[#FFF4D6] text-[#9A6B00]",
    accepted: "bg-brand-light text-brand-dark",
    inProgress: "bg-ok/15 text-ok",
    completed: "bg-ink/5 text-ink",
    rejected: "bg-bad/10 text-bad",
    expired: "bg-bad/10 text-bad",
    cancelled: "bg-ink/5 text-ink/60",
    disputed: "bg-bad/15 text-bad",
  };
  const { t } = useT();
  return (
    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${map[status] ?? ""}`}>
      {t(`status.${status}` as MessageKey)}
    </span>
  );
}

export function PageHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="bg-brand-light/60">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {eyebrow && <p className="mb-2 font-bold text-brand-dark">{eyebrow}</p>}
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl text-lg text-ink/75">{sub}</p>}
      </div>
    </div>
  );
}
