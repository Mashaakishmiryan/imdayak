import type { Lang } from "./config";
import { LOCALES } from "./config";

/**
 * Locale formatting with fallbacks. Chrome ships no Armenian (hy) data for Intl, so
 * Intl silently formats Armenian pages in English ("Fri, Oct 23", "25,000", "a and b").
 * When a locale isn't supported we use CLDR's Armenian conventions directly.
 */
const supports = (ctor: { supportedLocalesOf(l: string): string[] }, locale: string) => {
  try {
    return ctor.supportedLocalesOf(locale).length > 0;
  } catch {
    return false;
  }
};

const HY_MONTHS_SHORT = ["հնվ", "փտվ", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սեպ", "հոկ", "նոյ", "դեկ"];
const HY_MONTHS_LONG = ["հունվարի", "փետրվարի", "մարտի", "ապրիլի", "մայիսի", "հունիսի", "հուլիսի", "օգոստոսի", "սեպտեմբերի", "հոկտեմբերի", "նոյեմբերի", "դեկտեմբերի"];
const HY_WEEKDAYS_SHORT = ["կիր", "երկ", "երք", "չրք", "հնգ", "ուր", "շբթ"]; // Sunday first, like Date#getDay

export function makeFormatters(lang: Lang) {
  const locale = LOCALES[lang];
  // Armenian and Russian share the same number conventions: space for thousands, comma for decimals
  const numLocale = supports(Intl.NumberFormat, locale) ? locale : lang === "hy" ? "ru-RU" : "en-GB";
  const hasDates = supports(Intl.DateTimeFormat, locale);
  const hasLists = supports(Intl.ListFormat, locale);

  const num = (n: number, digits = 0) =>
    new Intl.NumberFormat(numLocale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);

  const date = (d: Date, opts: Intl.DateTimeFormatOptions) => {
    if (hasDates || lang !== "hy") return new Intl.DateTimeFormat(locale, opts).format(d);
    const parts: string[] = [];
    if (opts.weekday) parts.push(HY_WEEKDAYS_SHORT[d.getDay()] + ",");
    if (opts.day) parts.push(String(d.getDate()));
    if (opts.month) parts.push(opts.month === "long" ? HY_MONTHS_LONG[d.getMonth()] : HY_MONTHS_SHORT[d.getMonth()]);
    if (opts.year) parts.push(`${d.getFullYear()} թ.`);
    return parts.join(" ").replace(/,$/, "");
  };

  /** Always 24-hour, as used in Armenia and Russia (the en fallback would give "02:30 PM"). */
  const time = (ms: number) => new Date(ms).toLocaleTimeString(hasDates ? locale : numLocale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  const list = (items: string[], and: string) => {
    if (hasLists) return new Intl.ListFormat(locale, { type: "conjunction" }).format(items);
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
  };

  return { locale, num, date, time, list };
}
