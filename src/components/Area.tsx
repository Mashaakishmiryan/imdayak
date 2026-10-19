"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { HeartSpinner } from "./Icons";

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, ready } = useStore();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (ready && (!user || user.role !== role)) router.replace(`/login?next=${encodeURIComponent(path)}&role=${role}`);
  }, [ready, user, role, router, path]);
  const { t } = useT();
  if (!ready || !user || user.role !== role) return <HeartSpinner label={t("common.loading")} />;
  return <>{children}</>;
}

export function AreaTabs({ tabs }: { tabs: [string, MessageKey][] }) {
  const path = usePathname();
  const { t } = useT();
  return (
    <div className="border-b border-ink/5 bg-white/70">
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
        {tabs.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition ${path === href ? "bg-brand text-white" : "hover:bg-brand-light"}`}
          >
            {t(label)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export const FAMILY_TABS: [string, MessageKey][] = [
  ["/family", "tab.dashboard"],
  ["/family/matches", "tab.matches"],
  ["/find", "tab.map"],
  ["/family/bookings", "tab.bookings"],
  ["/family/messages", "tab.messages"],
  ["/family/favourites", "tab.favourites"],
  ["/family/settings", "tab.payments"],
];

export const NANNY_TABS: [string, MessageKey][] = [
  ["/nanny", "tab.dashboard"],
  ["/nanny/bookings", "tab.nBookings"],
  ["/nanny/calendar", "tab.calendar"],
  ["/nanny/earnings", "tab.earnings"],
  ["/nanny/messages", "tab.messages"],
  ["/nanny/reviews", "tab.reviews"],
];
