"use client";

import { getNanny } from "@/lib/data";
import { useStore } from "@/lib/store";

export function useMine() {
  const s = useStore();
  const nanny = getNanny(s.user?.nannyId ?? "n1")!;
  const mine = s.bookings.filter((b) => b.nannyId === nanny.id);
  return { ...s, nanny, mine };
}
