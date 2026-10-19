"use client";

import { AreaTabs, NANNY_TABS, RequireRole } from "@/components/Area";

export default function NannyLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="nanny">
      <AreaTabs tabs={NANNY_TABS} />
      {children}
    </RequireRole>
  );
}
