"use client";

import Link from "next/link";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { Logo } from "./Logo";

const COLS: { title: MessageKey | "ImDayak"; links: [string, MessageKey][] }[] = [
  { title: "ImDayak", links: [["/how-it-works", "nav.how"], ["/safety", "footer.safety"], ["/pricing", "nav.pricing"], ["/about", "footer.about"]] },
  { title: "footer.families", links: [["/find", "nav.find"], ["/family/matches", "footer.matched"], ["/signup?role=family", "footer.signupFamily"], ["/faq", "footer.help"]] },
  { title: "footer.nannies", links: [["/become-a-nanny", "nav.become"], ["/signup?role=nanny", "footer.signupNanny"], ["/legal#nanny-agreement", "footer.agreement"]] },
  { title: "footer.legal", links: [["/legal#terms", "footer.terms"], ["/legal#privacy", "footer.privacy"], ["/legal#cookies", "footer.cookies"]] },
];

export function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo white />
          <p className="mt-4 text-sm text-white/70">{t("footer.tag")}</p>
          <p className="mt-4 text-sm text-white/70">{t("footer.address")}</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title} className="min-w-0">
            <h3 className="mb-3 font-black text-heart">{c.title === "ImDayak" ? c.title : t(c.title)}</h3>
            <ul className="space-y-2 text-sm text-white/80">
              {c.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="hover:text-white">{t(label)}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">{t("footer.copy")}</div>
    </footer>
  );
}
