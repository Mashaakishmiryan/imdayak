import type { Msg } from "./msg";
import type { BookingType, FamilyNeeds, NannyProfile } from "./types";

/** Weights from PID section 7, step 2 — they sum to 100. */
export const WEIGHTS = {
  distance: 25,
  skills: 20,
  experience: 15,
  rating: 15,
  price: 10,
  language: 5,
  hobbies: 5,
  preferences: 5,
} as const;

export type Factor = keyof typeof WEIGHTS;

export interface MatchResult {
  nanny: NannyProfile;
  score: number;
  distanceKm: number;
  factors: Record<Factor, number>;
  reasons: Msg[];
}

export interface FilterFailure {
  nanny: NannyProfile;
  failed: Msg[];
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export const bookingHours = (t: BookingType) => (t === "1h" ? 1 : t === "2h" ? 2 : 8);

export function isFree(n: NannyProfile, day: number, startHour: number, hours: number): boolean {
  const slot = n.availability[day];
  return !!slot && startHour >= slot[0] && startHour + hours <= slot[1];
}

/** Step 1 — hard filters. Returns the failed rules (empty = passes). */
export function hardFilters(n: NannyProfile, f: FamilyNeeds): Msg[] {
  const failed: Msg[] = [];
  const seen = new Set<string>();
  const fail = (m: Msg) => {
    const id = m.k + JSON.stringify(m.p ?? {});
    if (seen.has(id)) return;
    seen.add(id);
    failed.push(m);
  };
  const d = distanceKm(f.lat, f.lng, n.lat, n.lng);
  if (!n.verified || !n.active) fail({ k: "fail.inactive" });
  for (const r of f.recipients) {
    if (!n.careTypes.includes(r.type)) fail({ k: "fail.care", p: { care: r.type }, dyn: { care: "care." } });
    if (r.age < n.ageRange[0] || r.age > n.ageRange[1]) fail({ k: "fail.age", p: { age: r.age, from: n.ageRange[0], to: n.ageRange[1] } });
  }
  if (f.recipients.length > n.maxChildren) fail({ k: "fail.maxChildren", p: { n: n.maxChildren } });
  if (!n.bookingTypes.includes(f.bookingType)) fail({ k: "fail.type" });
  if (!isFree(n, f.day, f.startHour, bookingHours(f.bookingType))) fail({ k: "fail.slot" });
  if (d > n.maxDistanceKm) fail({ k: "fail.distance", p: { km: d, max: n.maxDistanceKm }, dec: { km: 1 } });
  if (f.mustDrive === "yes" && !n.drivingLicence) fail({ k: "fail.drive" });
  if (f.nonSmoker && n.smoker) fail({ k: "fail.smoker" });
  if (f.pets && n.petsOk !== "yes") fail({ k: "fail.pets" });
  return failed;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Step 2 — each factor scored 0..1 */
export function factorScores(n: NannyProfile, f: FamilyNeeds, d: number): Record<Factor, number> {
  // Distance: full points under 2 km, zero at the nanny's max distance
  const distance = d <= 2 ? 1 : n.maxDistanceKm <= 2 ? 0 : clamp(1 - (d - 2) / (n.maxDistanceKm - 2));

  // Skills and training: share of the family's must-haves the nanny has
  const have = new Set([...n.skills, ...n.training]);
  const skills = f.mustHaveSkills.length === 0 ? 1 : f.mustHaveSkills.filter((s) => have.has(s)).length / f.mustHaveSkills.length;

  // Experience: years vs family minimum, extra for experience with this care type
  const base = f.minExperience > 0 ? clamp(n.yearsExperience / f.minExperience) * 0.7 : clamp(n.yearsExperience / 10) * 0.7;
  const extra = clamp((n.yearsExperience - f.minExperience) / 10) * 0.3;
  const experience = clamp(base + extra);

  // Rating and reliability: rating, accept rate, cancellations
  const rating = clamp((n.rating / 5) * 0.6 + n.acceptRate * 0.3 + (1 - clamp(n.cancellations / 4)) * 0.1);

  // Price vs budget: full points at or under budget, falls off above it (zero at +50%)
  const price = n.pricePerHour <= f.budgetPerHour ? 1 : clamp(1 - (n.pricePerHour - f.budgetPerHour) / (f.budgetPerHour * 0.5));

  // Language: shares the family's home language
  const language = f.languages.some((l) => n.languages.includes(l)) ? 1 : 0;

  // Hobbies and values: tag overlap
  const overlap = f.hobbies.filter((h) => n.hobbies.includes(h)).length;
  const hobbies = f.hobbies.length === 0 ? 0.5 : clamp(overlap / Math.min(3, f.hobbies.length));

  // Preferences: nanny age and gender
  const ageOk = !f.preferredAge || (n.age >= f.preferredAge[0] && n.age <= f.preferredAge[1]);
  const genderOk = !f.preferredGender || f.preferredGender === "any" || f.preferredGender === n.gender;
  const preferences = (ageOk ? 0.5 : 0) + (genderOk ? 0.5 : 0);

  return { distance, skills, experience, rating, price, language, hobbies, preferences };
}

function reasons(n: NannyProfile, f: FamilyNeeds, d: number): Msg[] {
  const r: Msg[] = [{ k: "reason.distance", p: { km: d }, dec: { km: 1 } }];
  const lang = f.languages.find((l) => n.languages.includes(l));
  if (lang) r.push({ k: `reason.speaks.${lang}` });
  const careType = f.recipients[0]?.type;
  if (careType) r.push({ k: `reason.exp.${careType}`, p: { years: n.yearsExperience }, plural: { years: "unit.years" } });
  const shared = f.hobbies.filter((h) => n.hobbies.includes(h));
  if (shared.length) r.push({ k: "reason.loves", p: { tags: shared.slice(0, 2).join("|") }, list: { tags: "tag." } });
  if (n.pricePerHour <= f.budgetPerHour) r.push({ k: "reason.budget" });
  if (n.rating >= 4.9) r.push({ k: "reason.rating", p: { r: n.rating }, dec: { r: 1 } });
  return r;
}

/** Full pipeline: filter → score → sort. */
export function matchNannies(nannies: NannyProfile[], f: FamilyNeeds) {
  const matches: MatchResult[] = [];
  const excluded: FilterFailure[] = [];
  for (const n of nannies) {
    const failed = hardFilters(n, f);
    if (failed.length) {
      excluded.push({ nanny: n, failed });
      continue;
    }
    const d = distanceKm(f.lat, f.lng, n.lat, n.lng);
    const factors = factorScores(n, f, d);
    const score = Math.round((Object.keys(WEIGHTS) as Factor[]).reduce((s, k) => s + WEIGHTS[k] * factors[k], 0));
    matches.push({ nanny: n, score, distanceKm: d, factors, reasons: reasons(n, f, d) });
  }
  matches.sort((a, b) => b.score - a.score);
  return { matches, excluded };
}

/** Lighter score for the map / list when the family hasn't filled full needs */
export function quickScore(n: NannyProfile, f: FamilyNeeds): number {
  const d = distanceKm(f.lat, f.lng, n.lat, n.lng);
  const factors = factorScores(n, f, d);
  return Math.round((Object.keys(WEIGHTS) as Factor[]).reduce((s, k) => s + WEIGHTS[k] * factors[k], 0));
}
