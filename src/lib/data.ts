import type { MessageKey } from "@/i18n/en";
import type { CareType, NannyProfile, WeeklyAvailability } from "./types";

/** Care categories. Labels live in the dictionaries as care.{id} and careAges.{id}. */
export const CARE_TYPES: { id: CareType; emoji: string }[] = [
  { id: "baby", emoji: "👶" },
  { id: "toddler", emoji: "🧸" },
  { id: "child", emoji: "🎨" },
  { id: "sick", emoji: "🩹" },
  { id: "elderlyWoman", emoji: "👵" },
  { id: "elderlyMan", emoji: "👴" },
];

export const HOBBIES = ["reading", "music", "drawing", "cooking", "sport", "crafts", "nature walks", "dancing", "games", "gardening"];
export const TRAINING = ["pedagogy degree", "nursing course", "first aid", "own children", "previous nanny jobs", "elderly-care course"];
export const SKILLS = ["newborn care", "special needs", "medication reminders", "mobility help", "homework help", "cooking", "light housework"];
export const REVIEW_TAGS = ["Punctual", "Creative games", "Very patient", "Kids loved her", "Great cook", "Calm and kind", "Clean and tidy"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Yerevan centre */
export const YEREVAN = { lat: 40.1811, lng: 44.5136 };
/** Anna lives in Arabkir */
export const DEFAULT_FAMILY_LOCATION = { lat: 40.2045, lng: 44.5025, address: "Komitas Ave, Arabkir, Yerevan" };

const weekdays = (s: number, e: number, weekend: [number, number] | null = null): WeeklyAvailability => ({
  0: [s, e], 1: [s, e], 2: [s, e], 3: [s, e], 4: [s, e], 5: weekend, 6: weekend,
});

const COLORS = ["#0C8FA0", "#F4ADB3", "#7CC6CF", "#E89AA2", "#3BB273", "#F2B880", "#8FA8E8", "#C49BD8"];

type Seed = Omit<NannyProfile, "avatarColor" | "reviews" | "verified" | "active" | "reviewCount"> & { reviewCount?: number };

const seeds: Seed[] = [
  {
    id: "n1", firstName: "Gayane", lastName: "Hakobyan", age: 45, gender: "female",
    bio: "15 years with little ones. Calm, warm and organised — I love songs, picture books and long walks in the park. First-aid certified.",
    languages: ["Armenian", "Russian"], hobbies: ["reading", "music", "nature walks", "cooking"],
    city: "Yerevan", district: "Arabkir", lat: 40.2088, lng: 44.5068, maxDistanceKm: 3,
    drivingLicence: false, ownCar: false, careTypes: ["baby", "toddler"], ageRange: [0, 3], maxChildren: 2,
    yearsExperience: 15, training: ["first aid", "own children", "previous nanny jobs"], skills: ["newborn care", "cooking"],
    certificates: ["First aid (Red Cross, 2025)"], smoker: false, petsOk: "yes",
    pricePerHour: 2500, pricePerDay: 16000, bookingTypes: ["1h", "2h", "day"], availability: weekdays(9, 19),
    overnight: false, online: true, rating: 4.9, bookingsDone: 64, acceptRate: 0.96, cancellations: 0, reviewCount: 41,
  },
  {
    id: "n2", firstName: "Lilit", lastName: "Sargsyan", age: 24, gender: "female",
    bio: "Pedagogy student at YSU. I make homework fun and bring a bag full of crafts. English, Russian and Armenian at home.",
    languages: ["Armenian", "English", "Russian"], hobbies: ["drawing", "crafts", "dancing", "games"],
    city: "Yerevan", district: "Kentron", lat: 40.1792, lng: 44.5152, maxDistanceKm: 6,
    drivingLicence: true, ownCar: false, careTypes: ["toddler", "child"], ageRange: [2, 12], maxChildren: 3,
    yearsExperience: 4, training: ["pedagogy degree", "first aid"], skills: ["homework help"],
    certificates: ["Pedagogy (YSU, in progress)", "First aid"], smoker: false, petsOk: "yes",
    pricePerHour: 2000, pricePerDay: 13000, bookingTypes: ["1h", "2h", "day"], availability: weekdays(14, 21, [10, 18]),
    overnight: false, online: true, rating: 4.8, bookingsDone: 22, acceptRate: 0.9, cancellations: 1,
  },
  {
    id: "n3", firstName: "Anahit", lastName: "Petrosyan", age: 52, gender: "female",
    bio: "Former paediatric ward nurse. I care for sick and recovering children with patience — temperature logs, medicine on time, lots of cuddles.",
    languages: ["Armenian", "Russian"], hobbies: ["reading", "gardening", "cooking"],
    city: "Yerevan", district: "Komitas", lat: 40.1985, lng: 44.4935, maxDistanceKm: 8,
    drivingLicence: true, ownCar: true, careTypes: ["baby", "toddler", "child", "sick"], ageRange: [0, 12], maxChildren: 2,
    yearsExperience: 22, training: ["nursing course", "first aid", "own children"], skills: ["medication reminders", "newborn care", "special needs"],
    certificates: ["Nursing diploma", "First aid"], smoker: false, petsOk: "allergic",
    pricePerHour: 3500, pricePerDay: 22000, bookingTypes: ["2h", "day"], availability: weekdays(8, 20),
    overnight: true, online: true, rating: 5.0, bookingsDone: 38, acceptRate: 0.98, cancellations: 0,
  },
  {
    id: "n4", firstName: "Mariam", lastName: "Grigoryan", age: 31, gender: "female",
    bio: "Mum of two and a playful, energetic nanny. Outdoor games, healthy snacks and lots of laughter.",
    languages: ["Armenian", "English"], hobbies: ["sport", "nature walks", "games", "cooking"],
    city: "Yerevan", district: "Davtashen", lat: 40.2262, lng: 44.4947, maxDistanceKm: 5,
    drivingLicence: true, ownCar: true, careTypes: ["toddler", "child"], ageRange: [1, 10], maxChildren: 3,
    yearsExperience: 7, training: ["own children", "previous nanny jobs", "first aid"], skills: ["cooking", "homework help"],
    certificates: ["First aid"], smoker: false, petsOk: "yes",
    pricePerHour: 2200, pricePerDay: 15000, bookingTypes: ["1h", "2h", "day"], availability: weekdays(9, 18),
    overnight: false, online: false, rating: 4.7, bookingsDone: 30, acceptRate: 0.88, cancellations: 1,
  },
  {
    id: "n5", firstName: "Armine", lastName: "Vardanyan", age: 58, gender: "female",
    bio: "Elderly-care companion. Good conversation, warm meals, medicine reminders and gentle walks. I drive, so clinic visits are easy.",
    languages: ["Armenian", "Russian"], hobbies: ["reading", "music", "gardening", "cooking"],
    city: "Yerevan", district: "Nor Nork", lat: 40.1969, lng: 44.5630, maxDistanceKm: 10,
    drivingLicence: true, ownCar: true, careTypes: ["elderlyWoman", "elderlyMan"], ageRange: [60, 100], maxChildren: 1,
    yearsExperience: 12, training: ["elderly-care course", "first aid"], skills: ["medication reminders", "mobility help", "cooking", "light housework"],
    certificates: ["Elderly care course", "First aid"], smoker: false, petsOk: "yes",
    pricePerHour: 2300, pricePerDay: 15000, bookingTypes: ["2h", "day"], availability: weekdays(8, 18, [10, 16]),
    overnight: true, online: true, rating: 4.9, bookingsDone: 51, acceptRate: 0.95, cancellations: 0,
  },
  {
    id: "n6", firstName: "Narine", lastName: "Mkrtchyan", age: 38, gender: "female",
    bio: "Montessori-trained nanny. I follow the child's lead and keep a gentle routine — great with newborns and naps.",
    languages: ["Armenian", "Russian", "English"], hobbies: ["reading", "crafts", "music"],
    city: "Yerevan", district: "Arabkir", lat: 40.2010, lng: 44.5120, maxDistanceKm: 4,
    drivingLicence: false, ownCar: false, careTypes: ["baby", "toddler", "child"], ageRange: [0, 6], maxChildren: 2,
    yearsExperience: 10, training: ["pedagogy degree", "first aid", "previous nanny jobs"], skills: ["newborn care", "special needs"],
    certificates: ["Montessori 0–3", "First aid"], smoker: false, petsOk: "no",
    pricePerHour: 3000, pricePerDay: 19000, bookingTypes: ["1h", "2h", "day"], availability: weekdays(10, 19),
    overnight: false, online: true, rating: 4.8, bookingsDone: 44, acceptRate: 0.93, cancellations: 1,
  },
  {
    id: "n7", firstName: "Hasmik", lastName: "Avetisyan", age: 63, gender: "female",
    bio: "Retired primary-school teacher. Stories, chess and homework — and endless patience.",
    languages: ["Armenian", "Russian"], hobbies: ["reading", "games", "gardening"],
    city: "Yerevan", district: "Malatia-Sebastia", lat: 40.1745, lng: 44.4560, maxDistanceKm: 5,
    drivingLicence: false, ownCar: false, careTypes: ["child", "elderlyWoman"], ageRange: [4, 90], maxChildren: 3,
    yearsExperience: 30, training: ["pedagogy degree", "own children"], skills: ["homework help", "cooking"],
    certificates: ["Teaching diploma"], smoker: false, petsOk: "yes",
    pricePerHour: 1800, pricePerDay: 12000, bookingTypes: ["1h", "2h", "day"], availability: weekdays(9, 17),
    overnight: false, online: true, rating: 4.9, bookingsDone: 27, acceptRate: 0.92, cancellations: 0,
  },
  {
    id: "n8", firstName: "Davit", lastName: "Harutyunyan", age: 34, gender: "male",
    bio: "Physiotherapy background. I help elderly men stay active and independent — walks, exercises, clinic trips by car.",
    languages: ["Armenian", "Russian", "English"], hobbies: ["sport", "nature walks", "music"],
    city: "Yerevan", district: "Ajapnyak", lat: 40.1968, lng: 44.4710, maxDistanceKm: 12,
    drivingLicence: true, ownCar: true, careTypes: ["elderlyMan", "elderlyWoman"], ageRange: [55, 100], maxChildren: 1,
    yearsExperience: 6, training: ["elderly-care course", "first aid"], skills: ["mobility help", "medication reminders"],
    certificates: ["Physiotherapy BSc", "First aid"], smoker: false, petsOk: "yes",
    pricePerHour: 2800, pricePerDay: 18000, bookingTypes: ["2h", "day"], availability: weekdays(9, 20, [10, 15]),
    overnight: false, online: false, rating: 4.7, bookingsDone: 15, acceptRate: 0.87, cancellations: 1,
  },
  {
    id: "n9", firstName: "Sona", lastName: "Karapetyan", age: 27, gender: "female",
    bio: "Babysitter for evenings and weekends. Bedtime routines, bath time, and a quiet house when you get home.",
    languages: ["Armenian", "English"], hobbies: ["music", "dancing", "drawing"],
    city: "Yerevan", district: "Kentron", lat: 40.1870, lng: 44.5205, maxDistanceKm: 5,
    drivingLicence: false, ownCar: false, careTypes: ["toddler", "child"], ageRange: [1, 8], maxChildren: 2,
    yearsExperience: 3, training: ["previous nanny jobs", "first aid"], skills: ["light housework"],
    certificates: [], smoker: true, petsOk: "yes",
    pricePerHour: 1700, pricePerDay: 11000, bookingTypes: ["1h", "2h"], availability: weekdays(17, 23, [9, 23]),
    overnight: true, online: true, rating: 4.5, bookingsDone: 12, acceptRate: 0.83, cancellations: 2,
  },
  {
    id: "n10", firstName: "Ruzanna", lastName: "Ghazaryan", age: 49, gender: "female",
    bio: "Caring for babies is my calling. Newborn routines, colic tricks and healthy home-cooked purées.",
    languages: ["Armenian", "Russian"], hobbies: ["cooking", "crafts", "reading"],
    city: "Yerevan", district: "Arabkir", lat: 40.2120, lng: 44.4990, maxDistanceKm: 4,
    drivingLicence: false, ownCar: false, careTypes: ["baby", "toddler"], ageRange: [0, 3], maxChildren: 1,
    yearsExperience: 18, training: ["own children", "previous nanny jobs", "nursing course"], skills: ["newborn care", "cooking", "light housework"],
    certificates: ["Infant care course"], smoker: false, petsOk: "no",
    pricePerHour: 2700, pricePerDay: 17500, bookingTypes: ["2h", "day"], availability: weekdays(8, 16),
    overnight: false, online: true, rating: 4.8, bookingsDone: 35, acceptRate: 0.94, cancellations: 0,
  },
  {
    id: "n11", firstName: "Tatevik", lastName: "Simonyan", age: 41, gender: "female",
    bio: "Special-needs experience (autism, ADHD). Structured, gentle and creative — sensory play is my favourite.",
    languages: ["Armenian", "Russian", "English"], hobbies: ["crafts", "music", "nature walks"],
    city: "Yerevan", district: "Shengavit", lat: 40.1555, lng: 44.4930, maxDistanceKm: 9,
    drivingLicence: true, ownCar: true, careTypes: ["toddler", "child", "sick"], ageRange: [2, 14], maxChildren: 1,
    yearsExperience: 11, training: ["pedagogy degree", "first aid", "previous nanny jobs"], skills: ["special needs", "homework help", "medication reminders"],
    certificates: ["ABA basics", "First aid"], smoker: false, petsOk: "yes",
    pricePerHour: 3200, pricePerDay: 20000, bookingTypes: ["1h", "2h", "day"], availability: weekdays(10, 20),
    overnight: false, online: true, rating: 4.9, bookingsDone: 29, acceptRate: 0.97, cancellations: 0,
  },
  {
    id: "n12", firstName: "Gohar", lastName: "Manukyan", age: 55, gender: "female",
    bio: "Companion for elderly ladies in Gyumri. Tea, conversation, cooking together and doctor visits.",
    languages: ["Armenian", "Russian"], hobbies: ["cooking", "reading", "gardening"],
    city: "Gyumri", district: "Kentron", lat: 40.7894, lng: 43.8475, maxDistanceKm: 8,
    drivingLicence: true, ownCar: true, careTypes: ["elderlyWoman", "elderlyMan"], ageRange: [60, 100], maxChildren: 1,
    yearsExperience: 9, training: ["elderly-care course", "own children"], skills: ["medication reminders", "cooking", "light housework", "mobility help"],
    certificates: ["Elderly care course"], smoker: false, petsOk: "yes",
    pricePerHour: 1600, pricePerDay: 10500, bookingTypes: ["2h", "day"], availability: weekdays(8, 18),
    overnight: true, online: true, rating: 4.8, bookingsDone: 19, acceptRate: 0.95, cancellations: 0,
  },
];

const SAMPLE_REVIEWS = [
  { author: "Anna K.", text: "Our daughter was so happy, and the care diary made me calm at work.", tags: ["Punctual", "Very patient"] },
  { author: "Levon M.", text: "Arrived early, followed the nap routine perfectly. Booking again!", tags: ["Punctual", "Calm and kind"] },
  { author: "Elena S.", text: "Creative and kind — the kids made a cardboard castle together.", tags: ["Creative games", "Kids loved her"] },
];

export const NANNIES: NannyProfile[] = seeds.map((s, i) => ({
  ...s,
  verified: true,
  active: true,
  reviewCount: s.reviewCount ?? Math.round(s.bookingsDone * 0.7),
  avatarColor: COLORS[i % COLORS.length],
  reviews: SAMPLE_REVIEWS.map((r, j) => ({
    ...r,
    stars: j === 2 && s.rating < 4.8 ? 4 : 5,
    date: `2026-${String(9 - j).padStart(2, "0")}-${String(10 + i).padStart(2, "0")}`,
  })),
}));

export const getNanny = (id: string) => NANNIES.find((n) => n.id === id);

/** Super Dayak and other badges from section 3 */
export function badges(n: NannyProfile): MessageKey[] {
  const b: MessageKey[] = [];
  if (n.rating >= 4.9 && n.bookingsDone >= 20) b.push("badge.super");
  if (n.training.includes("first aid")) b.push("badge.firstAid");
  if (n.careTypes.some((c) => c.startsWith("elderly")) && n.yearsExperience >= 8) b.push("badge.elderly");
  if (n.languages.length >= 3) b.push("badge.langs");
  return b;
}

/** Deterministic ~300 m offset so pins never show the real home address */
export function fuzzedLocation(n: NannyProfile): [number, number] {
  let h = 0;
  for (const c of n.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const angle = (h % 360) * (Math.PI / 180);
  const dist = 0.0027; // ≈ 300 m in latitude degrees
  return [n.lat + Math.sin(angle) * dist, n.lng + (Math.cos(angle) * dist) / Math.cos((n.lat * Math.PI) / 180)];
}

