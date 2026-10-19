"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LANGS, useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";

export function dashboardPath(role?: string) {
  return role === "nanny" ? "/nanny" : role === "admin" ? "/admin" : "/family";
}

export function Header() {
  const { t, lang, setLang } = useT();
  const { user, logout } = useStore();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  const links = [
    { href: "/how-it-works", label: t("nav.how") },
    { href: "/find", label: t("nav.find") },
    { href: "/safety", label: t("nav.safety") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/become-a-nanny", label: t("nav.become") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label={t("nav.home")} onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition hover:bg-brand-light ${path === l.href ? "text-brand-dark bg-brand-light" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden rounded-full bg-white p-1 shadow-soft sm:flex" role="group" aria-label={t("nav.language")}>
            {LANGS.map((l) => (
              <button
                key={l.id}
                lang={l.id}
                title={l.name}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${lang === l.id ? "bg-brand text-white" : "text-ink/70"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {user ? (
            <>
              <Link href={dashboardPath(user.role)} className="btn-primary btn-sm hidden whitespace-nowrap sm:inline-flex">
                {t("nav.dashboard")}
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="hidden text-sm font-bold text-ink/60 hover:text-ink sm:block"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden whitespace-nowrap text-sm font-bold hover:text-brand sm:block">
                {t("nav.login")}
              </Link>
              <Link href="/signup" className="btn-primary btn-sm hidden whitespace-nowrap sm:inline-flex">
                {t("nav.signup")}
              </Link>
            </>
          )}
          <button className="rounded-full p-2 hover:bg-brand-light xl:hidden" onClick={() => setOpen(!open)} aria-label={t("nav.menu")} aria-expanded={open}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-ink/5 bg-cream px-4 pb-4 xl:hidden">
          <nav className="flex flex-col py-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-brand-light">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            {LANGS.map((l) => (
              <button key={l.id} lang={l.id} aria-pressed={lang === l.id} onClick={() => setLang(l.id)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${lang === l.id ? "bg-brand text-white" : "bg-white"}`}>
                {l.label}
              </button>
            ))}
            <span className="flex-1" />
            {user ? (
              <>
                <Link href={dashboardPath(user.role)} onClick={() => setOpen(false)} className="btn-primary btn-sm">{t("nav.dashboard")}</Link>
                <button onClick={() => { logout(); setOpen(false); router.push("/"); }} className="btn-ghost btn-sm">{t("nav.logout")}</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost btn-sm">{t("nav.login")}</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary btn-sm">{t("nav.signup")}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
