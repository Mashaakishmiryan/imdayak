export type Lang = "hy" | "ru" | "en";

export const LANG_COOKIE = "imdayak-lang";
export const DEFAULT_LANG: Lang = "en";
export const LOCALES: Record<Lang, string> = { hy: "hy-AM", ru: "ru-RU", en: "en-GB" };

export const isLang = (v: unknown): v is Lang => v === "hy" || v === "ru" || v === "en";
