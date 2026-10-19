"use client";

import { useState } from "react";
import { DAYS } from "@/lib/data";
import type { MessageKey } from "@/i18n/en";
import { useT } from "@/lib/i18n";
import { hourLabel, toISODate, weekdayIndex } from "@/lib/pricing";
import type { WeeklyAvailability } from "@/lib/types";
import { useMine } from "../useMine";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07–22

export default function NannyCalendar() {
  const { nanny, mine } = useMine();
  const { t, date: fmtDate } = useT();
  const dayName = (d: number) => t(`day.${d}` as MessageKey);
  const [grid, setGrid] = useState<boolean[][]>(() =>
    DAYS.map((_, d) => HOURS.map((h) => { const s = nanny.availability[d]; return !!s && h >= s[0] && h < s[1]; })),
  );
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [offInput, setOffInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [drag, setDrag] = useState<boolean | null>(null);

  const set = (d: number, h: number, v: boolean) => { setGrid((g) => g.map((row, i) => (i === d ? row.map((c, j) => (j === h ? v : c)) : row))); setSaved(false); };
  const booked = (d: number, h: number) =>
    mine.some((b) => ["accepted", "inProgress"].includes(b.status) && weekdayIndex(b.date) === d && HOURS[h] >= b.startHour && HOURS[h] < b.startHour + b.hours);

  const toWeekly = (): WeeklyAvailability =>
    Object.fromEntries(grid.map((row, d) => { const f = row.indexOf(true); const l = row.lastIndexOf(true); return [d, f < 0 ? null : [HOURS[f], HOURS[l] + 1]]; }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8" onMouseUp={() => setDrag(null)}>
      <h1 className="text-3xl font-black">{t("cal.title")}</h1>
      <p className="text-ink/70">{t("cal.sub")}</p>
      <div className="card mt-6 overflow-x-auto p-4">
        <table className="w-full select-none text-xs">
          <thead><tr><th />{DAYS.map((d, i) => <th key={d} className="pb-2 font-black">{dayName(i)}</th>)}</tr></thead>
          <tbody>
            {HOURS.map((h, hi) => (
              <tr key={h}>
                <td className="pr-2 text-right font-mono text-ink/50">{hourLabel(h)}</td>
                {DAYS.map((_, d) => {
                  const on = grid[d][hi];
                  const b = booked(d, hi);
                  return (
                    <td key={d} className="p-0.5">
                      <button
                        onMouseDown={() => { setDrag(!on); set(d, hi, !on); }}
                        onMouseEnter={() => drag !== null && set(d, hi, drag)}
                        className={`h-6 w-full min-w-9 rounded ${b ? "bg-heart" : on ? "bg-ok/60" : "bg-ink/5 hover:bg-ink/10"}`}
                        aria-label={`${dayName(d)} ${hourLabel(h)} ${on ? t("cal.stateOn") : t("cal.stateOff")}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold"><span>{t("cal.available")}</span><span>{t("cal.booked")}</span><span>{t("cal.off")}</span></div>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="font-black">{t("cal.daysOff")}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <input type="date" className="input !w-auto" min={toISODate(new Date())} value={offInput} onChange={(e) => setOffInput(e.target.value)} />
          <button className="btn-ghost btn-sm" onClick={() => { if (offInput && !daysOff.includes(offInput)) setDaysOff([...daysOff, offInput].sort()); setSaved(false); }}>{t("cal.addDayOff")}</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{daysOff.map((d) => <button key={d} onClick={() => setDaysOff(daysOff.filter((x) => x !== d))} className="chip-pink">{fmtDate(d)} ✕</button>)}</div>
      </div>

      <button className="btn-primary mt-6" onClick={() => { console.info("weekly availability", toWeekly(), daysOff); setSaved(true); }}>{t("cal.save")}</button>
      {saved && <p className="mt-2 font-bold text-ok">{t("cal.saved")}</p>}
    </div>
  );
}
