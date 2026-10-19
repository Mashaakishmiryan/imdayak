export type CareType = "baby" | "toddler" | "child" | "sick" | "elderlyWoman" | "elderlyMan";
export type Language = "Armenian" | "Russian" | "English" | "Other";
export type BookingType = "1h" | "2h" | "day";
export type Gender = "female" | "male";

/** Weekly availability: day 0 (Mon) … 6 (Sun) → [startHour, endHour) */
export type WeeklyAvailability = Record<number, [number, number] | null>;

export interface NannyProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
  bio: string;
  languages: Language[];
  hobbies: string[];
  city: string;
  district: string;
  lat: number;
  lng: number;
  maxDistanceKm: number;
  drivingLicence: boolean;
  ownCar: boolean;
  careTypes: CareType[];
  ageRange: [number, number];
  maxChildren: number;
  yearsExperience: number;
  training: string[];
  skills: string[];
  certificates: string[];
  smoker: boolean;
  petsOk: "yes" | "no" | "allergic";
  pricePerHour: number;
  pricePerDay: number;
  bookingTypes: BookingType[];
  availability: WeeklyAvailability;
  overnight: boolean;
  verified: boolean;
  active: boolean;
  online: boolean;
  rating: number;
  reviewCount: number;
  bookingsDone: number;
  acceptRate: number;
  cancellations: number;
  avatarColor: string;
  reviews: Review[];
}

export interface Review {
  author: string;
  stars: number;
  tags: string[];
  text: string;
  date: string;
}

export interface CareRecipient {
  type: CareType;
  age: number;
}

export interface FamilyNeeds {
  lat: number;
  lng: number;
  address: string;
  languages: Language[];
  hobbies: string[];
  mustDrive: "yes" | "no" | "nice";
  recipients: CareRecipient[];
  pets: boolean;
  preferredAge?: [number, number];
  preferredGender?: "any" | Gender;
  minExperience: number;
  mustHaveSkills: string[];
  nonSmoker: boolean;
  day: number; // 0 = Monday
  startHour: number;
  bookingType: BookingType;
  budgetPerHour: number;
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "inProgress"
  | "completed"
  | "cancelled"
  | "disputed";

export interface DiaryEntry {
  at: number;
  text: string;
}

export interface CareReport {
  meals: string;
  sleep: string;
  mood: string;
  medicines: string;
  notes: string;
}

export interface Booking {
  id: string;
  nannyId: string;
  familyName: string;
  type: BookingType;
  date: string; // YYYY-MM-DD
  startHour: number;
  hours: number;
  nannyPrice: number;
  serviceFee: number;
  status: BookingStatus;
  createdAt: number;
  notes: string;
  /** Stored as raw data, labelled at render time in the viewer's language */
  emergencyContact?: string;
  urgent?: boolean;
  matchScore?: number;
  sick?: { symptoms: string; temperature: string; medicine: string; doctorPhone: string };
  checkInAt?: number;
  checkOutAt?: number;
  diary: DiaryEntry[];
  report?: CareReport;
  review?: { stars: number; tags: string[]; text: string };
  refund?: number;
  rejectReason?: string;
  /** "Find my nanny automatically": next nannies to try if this one rejects or times out */
  autoQueue?: string[];
  disputeReason?: string;
}

export type Role = "family" | "nanny" | "admin";

export interface SessionUser {
  role: Role;
  name: string;
  verified: boolean;
  nannyId?: string;
}
