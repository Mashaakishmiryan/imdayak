"use client";

import { bookingHours } from "@/lib/matching";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { MIN_NOTICE_H, hourLabel, toISODate, weekdayIndex } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { BookingType, NannyProfile } from "@/lib/types";

/** Next 14 days × hours. Green = free, grey = unavailable/booked. Families can only pick free slots. */
export function SlotPicker({
  nanny,
  type,
  date,
  hour,
  onPick,
}: {
  nanny: NannyProfile;
  type: BookingType;
  date?: string;
  hour?: number;
  onPick?: (date: string, hour: number) => void;
}) {
  const { isSlotTaken } = useStore();
  const { t, date: fmtDate } = useT();
  const hours = bookingHours(type);
  const days = Array.from({ length: 14 }, (_, i) => toISODate(new Date(Date.now() + i * 86_400_000)));
  const selected = date ?? days[1];
  const slot = nanny.availability[weekdayIndex(selected)];

  const startOptions = slot ? Array.from({ length: Math.max(0, slot[1] - slot[0] - hours + 1) }, (_, i) => slot[0] + i) : [];
  const ok = (d: string, h: number) => {
    const start = new Date(`${d}T${hourLabel(h)}`).getTime();
    return start - Date.now() >= MIN_NOTICE_H[type] * 3_600_000 && !isSlotTaken(nanny.id, d, h, hours);
  };

  return (
    <div className="min-w-0">
      <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-2">
        {days.map((d) => {
          const wd = weekdayIndex(d);
          const avail = !!nanny.availability[wd];
          return (
            <button
              key={d}
              disabled={!avail}
              onClick={() => onPick?.(d, -1)}
              className={`flex w-16 shrink-0 flex-col items-center rounded-xl py-2 text-sm font-bold transition ${
                d === selected ? "bg-brand text-white" : avail ? "bg-ok/10 text-ink hover:bg-ok/20" : "bg-ink/5 text-ink/30"
              }`}
            >
              <span className="text-xs">{t(`day.${wd}` as MessageKey)}</span>
              <span className="text-lg">{fmtDate(d, { day: "numeric" })}</span>
              <span className="text-[10px] opacity-70">{fmtDate(d, { month: "short" })}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
        {!slot && <p className="col-span-full text-sm text-ink/60">{t("slots.notWorking")}</p>}
        {startOptions.map((h) => {
          const free = ok(selected, h);
          return (
            <button
              key={h}
              disabled={!free}
              onClick={() => onPick?.(selected, h)}
              className={`rounded-xl py-2 text-sm font-bold ${
                hour === h && date === selected ? "bg-brand text-white" : free ? "bg-ok/15 text-ink hover:bg-ok/25" : "bg-ink/5 text-ink/30 line-through"
              }`}
            >
              {hourLabel(h)}–{hourLabel(h + hours)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
