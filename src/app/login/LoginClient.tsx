"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { dashboardPath } from "@/components/Header";
import { Logo } from "@/components/Logo";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

const DEMO: { label: MessageKey; desc: MessageKey; user: SessionUser; emoji: string }[] = [
  { label: "login.demoFamily", desc: "login.demoFamilyD", user: { role: "family", name: "Anna Petrosyan", verified: true }, emoji: "👩‍🍼" },
  { label: "login.demoNanny", desc: "login.demoNannyD", user: { role: "nanny", name: "Gayane Hakobyan", verified: true, nannyId: "n1" }, emoji: "🧑‍🍼" },
  { label: "login.demoAdmin", desc: "login.demoAdminD", user: { role: "admin", name: "ImDayak Admin", verified: true }, emoji: "🛡️" },
];

export default function LoginClient() {
  const { login } = useStore();
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const wantRole = params.get("role");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [forgot, setForgot] = useState(false);

  const go = (u: SessionUser) => {
    login(u);
    router.push(next && (!wantRole || wantRole === u.role) ? next : dashboardPath(u.role));
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
      <div className="card p-8">
        <Logo />
        <h1 className="mt-6 text-3xl font-black">{forgot ? t("login.reset") : t("login.welcome")}</h1>
        {forgot ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setErr(t("login.resetSent")); }}>
            <label className="block"><span className="label">{t("login.contact")}</span><input className="input" required value={id} onChange={(e) => setId(e.target.value)} /></label>
            <button className="btn-primary w-full">{t("login.sendReset")}</button>
            {err && <p className="text-sm font-bold text-brand-dark">{err}</p>}
            <button type="button" className="text-sm font-bold text-brand-dark" onClick={() => { setForgot(false); setErr(""); }}>{t("login.backTo")}</button>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (pw.length < 6) return setErr(t("login.pwShort"));
              go({ role: wantRole === "nanny" ? "nanny" : "family", name: id.includes("@") ? id.split("@")[0] : "Anna Petrosyan", verified: true, nannyId: wantRole === "nanny" ? "n1" : undefined });
            }}
          >
            <label className="block"><span className="label">{t("login.contact")}</span><input className="input" required value={id} onChange={(e) => setId(e.target.value)} placeholder="anna@example.com / +374…" /></label>
            <label className="block"><span className="label">{t("login.password")}</span><input type="password" className="input" required value={pw} onChange={(e) => setPw(e.target.value)} /></label>
            {err && <p className="text-sm font-bold text-bad">{err}</p>}
            <button className="btn-primary w-full">{t("login.submit")}</button>
            <button type="button" className="btn-ghost w-full" onClick={() => go(DEMO[0].user)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
              {t("login.google")}
            </button>
            <div className="flex flex-wrap justify-between gap-2 text-sm font-bold">
              <button type="button" className="text-brand-dark" onClick={() => { setForgot(true); setErr(""); }}>{t("login.forgot")}</button>
              <Link href="/signup" className="text-brand-dark">{t("login.create")}</Link>
            </div>
          </form>
        )}
      </div>
      <div>
        <h2 className="text-xl font-black">{t("login.demoTitle")}</h2>
        <p className="text-sm text-ink/70">{t("login.demoDesc")}</p>
        <div className="mt-4 space-y-3">
          {DEMO.map((d) => (
            <button key={d.label} onClick={() => go(d.user)} className="card lift flex w-full items-center gap-4 p-5 text-left">
              <span className="shrink-0 text-4xl">{d.emoji}</span>
              <span className="min-w-0"><b className="text-lg">{t(d.label)}</b><br /><span className="text-sm text-ink/70">{t(d.desc)}</span></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
