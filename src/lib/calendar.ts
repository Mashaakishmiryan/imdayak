import { getNanny } from "./data";
import { startTime } from "./pricing";
import type { Booking } from "./types";

const fmt = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl(b: Booking, who: string) {
  const s = startTime(b);
  const e = s + b.hours * 3_600_000;
  const q = new URLSearchParams({ action: "TEMPLATE", text: `ImDayak: care with ${who}`, dates: `${fmt(s)}/${fmt(e)}`, details: "Booked on ImDayak" });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function downloadIcs(b: Booking, who: string) {
  const s = startTime(b);
  const e = s + b.hours * 3_600_000;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ImDayak//EN", "BEGIN:VEVENT",
    `UID:${b.id}@imdayak.am`, `DTSTAMP:${fmt(Date.now())}`, `DTSTART:${fmt(s)}`, `DTEND:${fmt(e)}`,
    `SUMMARY:ImDayak: care with ${who}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "imdayak-booking.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export const nannyName = (b: Booking) => getNanny(b.nannyId)?.firstName ?? "nanny";
