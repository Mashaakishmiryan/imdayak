"use client";

import { AreaTabs, FAMILY_TABS } from "@/components/Area";
import { useStore } from "@/lib/store";

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  return (
    <>
      {user?.role === "family" && <AreaTabs tabs={FAMILY_TABS} />}
      {children}
    </>
  );
}
