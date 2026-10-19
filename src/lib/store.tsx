"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MessageKey } from "@/i18n/en";
import { DEFAULT_FAMILY_LOCATION, getNanny } from "./data";
import { bookingHours } from "./matching";
import { PENDING_HOLD_MS, URGENT_HOLD_MS, familyRefundShare, nannyPrice, priceBreakdown, startTime } from "./pricing";
import type { Booking, BookingStatus, CareReport, FamilyNeeds, SessionUser } from "./types";

export const DEFAULT_NEEDS: FamilyNeeds = {
  ...DEFAULT_FAMILY_LOCATION,
  languages: ["Armenian"],
  hobbies: ["reading", "music"],
  mustDrive: "no",
  recipients: [{ type: "baby", age: 0 }],
  pets: false,
  preferredGender: "any",
  minExperience: 3,
  mustHaveSkills: ["first aid"],
  nonSmoker: true,
  day: 1,
  startHour: 14,
  bookingType: "2h",
  budgetPerHour: 3000,
};

export interface VerificationItem {
  id: string;
  name: string;
  role: "family" | "nanny";
  submitted: number;
  reason: MessageKey;
  status: "review" | "approved" | "rejected";
}

interface State {
  user: SessionUser | null;
  needs: FamilyNeeds;
  bookings: Booking[];
  favourites: string[];
  verifications: VerificationItem[];
  messages: Record<string, ChatMessage[]>;
}

export interface ChatMessage {
  from: "family" | "nanny";
  text: string;
  at: number;
}

const INITIAL: State = {
  user: null,
  needs: DEFAULT_NEEDS,
  bookings: [],
  favourites: ["n1", "n6"],
  verifications: [
    { id: "v1", name: "Karine Avagyan", role: "nanny", submitted: Date.now() - 3 * 3_600_000, reason: "adm.r1", status: "review" },
    { id: "v2", name: "Tigran Melkonyan", role: "family", submitted: Date.now() - 5 * 3_600_000, reason: "adm.r2", status: "review" },
    { id: "v3", name: "Siranush Poghosyan", role: "nanny", submitted: Date.now() - 50 * 60_000, reason: "adm.r3", status: "review" },
  ],
  messages: {},
};

const KEY = "imdayak-state-v2";
const SESSION_KEY = "imdayak-session-v1";

type NewBooking = Omit<Booking, "id" | "status" | "createdAt" | "diary" | "nannyPrice" | "serviceFee" | "hours">;

interface Store extends State {
  ready: boolean;
  now: number;
  login: (u: SessionUser) => void;
  logout: () => void;
  setNeeds: (n: Partial<FamilyNeeds>) => void;
  toggleFavourite: (id: string) => void;
  createBooking: (b: NewBooking) => Booking;
  setStatus: (id: string, status: BookingStatus, extra?: Partial<Booking>) => void;
  cancelByFamily: (id: string) => number;
  cancelByNanny: (id: string) => void;
  addDiary: (id: string, text: string) => void;
  submitReport: (id: string, r: CareReport) => void;
  review: (id: string, r: NonNullable<Booking["review"]>) => void;
  extend: (id: string) => boolean;
  decideVerification: (id: string, ok: boolean) => void;
  sendMessage: (bookingId: string, from: ChatMessage["from"], text: string) => void;
  isSlotTaken: (nannyId: string, date: string, startHour: number, hours: number, ignoreId?: string) => boolean;
  holdEndsAt: (b: Booking) => number;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

const BLOCKING: BookingStatus[] = ["pending", "accepted", "inProgress"];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const user = sessionStorage.getItem(SESSION_KEY);
      setState({ ...INITIAL, ...(raw ? JSON.parse(raw) : {}), user: user ? JSON.parse(user) : null });
    } catch {}
    loaded.current = true;
    setReady(true);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      const { user, ...shared } = state;
      localStorage.setItem(KEY, JSON.stringify(shared));
      // Session is per tab, so a family tab and a nanny tab can run the demo side by side
      if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }, [state]);

  // Keep demo in sync across tabs (family in one tab, nanny in another)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setState((s) => ({ ...INITIAL, ...JSON.parse(e.newValue!), user: s.user }));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const holdEndsAt = useCallback((b: Booking) => b.createdAt + (b.urgent ? URGENT_HOLD_MS : PENDING_HOLD_MS), []);

  /** Build the next pending booking in an auto-match chain */
  const rematch = (b: Booking): Booking | null => {
    const queue = b.autoQueue ?? [];
    const nextId = queue[0];
    const n = nextId ? getNanny(nextId) : undefined;
    if (!n) return null;
    const base = nannyPrice(n, b.type);
    return {
      ...b,
      id: crypto.randomUUID(),
      nannyId: n.id,
      nannyPrice: base,
      serviceFee: priceBreakdown(base).fee,
      status: "pending",
      createdAt: Date.now(),
      autoQueue: queue.slice(1),
      rejectReason: undefined,
    };
  };

  // Time-driven transitions: expire pending holds, auto-complete finished sessions
  useEffect(() => {
    if (!ready) return;
    let changed = false;
    const added: Booking[] = [];
    const next = state.bookings.map((b) => {
      if (b.status === "pending" && now > holdEndsAt(b)) {
        changed = true;
        const r = rematch(b);
        if (r) added.push(r);
        return { ...b, status: "expired" as const };
      }
      if ((b.status === "accepted" || b.status === "inProgress") && now > startTime(b) + b.hours * 3_600_000) {
        changed = true;
        return { ...b, status: "completed" as const, checkOutAt: b.checkOutAt ?? now };
      }
      return b;
    });
    if (changed) setState((s) => ({ ...s, bookings: [...added, ...next] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, ready]);

  const update = (id: string, fn: (b: Booking) => Booking) =>
    setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? fn(b) : b)) }));

  const isSlotTaken = useCallback(
    (nannyId: string, date: string, startHour: number, hours: number, ignoreId?: string) =>
      state.bookings.some(
        (b) =>
          b.id !== ignoreId &&
          b.nannyId === nannyId &&
          b.date === date &&
          BLOCKING.includes(b.status) &&
          startHour < b.startHour + b.hours &&
          b.startHour < startHour + hours,
      ),
    [state.bookings],
  );

  const store: Store = {
    ...state,
    ready,
    now,
    holdEndsAt,
    isSlotTaken,
    login: (user) => setState((s) => ({ ...s, user })),
    logout: () => setState((s) => ({ ...s, user: null })),
    setNeeds: (n) => setState((s) => ({ ...s, needs: { ...s.needs, ...n } })),
    toggleFavourite: (id) =>
      setState((s) => ({ ...s, favourites: s.favourites.includes(id) ? s.favourites.filter((f) => f !== id) : [...s.favourites, id] })),
    createBooking: (nb) => {
      const n = getNanny(nb.nannyId)!;
      const base = nannyPrice(n, nb.type);
      const b: Booking = {
        ...nb,
        id: crypto.randomUUID(),
        hours: bookingHours(nb.type),
        nannyPrice: base,
        serviceFee: priceBreakdown(base).fee,
        status: "pending",
        createdAt: Date.now(),
        diary: [],
      };
      setState((s) => ({ ...s, bookings: [b, ...s.bookings] }));
      return b;
    },
    setStatus: (id, status, extra) => {
      setState((s) => {
        const added: Booking[] = [];
        const bookings = s.bookings.map((b) => {
          if (b.id !== id) return b;
          const nb = { ...b, ...extra, status };
          if (status === "rejected") {
            const r = rematch(nb);
            if (r) added.push(r);
          }
          return nb;
        });
        return { ...s, bookings: [...added, ...bookings] };
      });
    },
    cancelByFamily: (id) => {
      const b = state.bookings.find((x) => x.id === id);
      if (!b) return 0;
      const share = familyRefundShare(b);
      const refund = Math.round((b.nannyPrice + b.serviceFee) * share);
      update(id, (x) => ({ ...x, status: "cancelled", refund }));
      return refund;
    },
    cancelByNanny: (id) => {
      setState((s) => {
        const added: Booking[] = [];
        const bookings = s.bookings.map((b) => {
          if (b.id !== id) return b;
          // Backup nanny: next best match from the family's favourites
          const backupId = s.favourites.find((f) => f !== b.nannyId);
          const nb: Booking = { ...b, status: "cancelled", refund: b.nannyPrice + b.serviceFee, rejectReason: "Cancelled by nanny" };
          const r = rematch({ ...nb, autoQueue: backupId ? [backupId] : [] });
          if (r) added.push({ ...r, notes: `${b.notes}\n(Backup nanny offered automatically)`.trim() });
          return nb;
        });
        return { ...s, bookings: [...added, ...bookings] };
      });
    },
    addDiary: (id, text) => update(id, (b) => ({ ...b, diary: [...b.diary, { at: Date.now(), text }] })),
    submitReport: (id, report) => update(id, (b) => ({ ...b, report, status: "completed", checkOutAt: Date.now() })),
    review: (id, review) => update(id, (b) => ({ ...b, review })),
    extend: (id) => {
      const b = state.bookings.find((x) => x.id === id);
      if (!b) return false;
      const n = getNanny(b.nannyId)!;
      if (isSlotTaken(b.nannyId, b.date, b.startHour + b.hours, 1, b.id)) return false;
      const slot = n.availability[(new Date(startTime(b)).getDay() + 6) % 7];
      if (!slot || b.startHour + b.hours + 1 > slot[1]) return false;
      update(id, (x) => ({
        ...x,
        hours: x.hours + 1,
        nannyPrice: x.nannyPrice + n.pricePerHour,
        serviceFee: priceBreakdown(x.nannyPrice + n.pricePerHour).fee,
      }));
      return true;
    },
    decideVerification: (id, ok) =>
      setState((s) => ({ ...s, verifications: s.verifications.map((v) => (v.id === id ? { ...v, status: ok ? "approved" : "rejected" } : v)) })),
    sendMessage: (bookingId, from, text) =>
      setState((s) => ({ ...s, messages: { ...s.messages, [bookingId]: [...(s.messages[bookingId] ?? []), { from, text, at: Date.now() }] } })),
    reset: () => setState({ ...INITIAL, user: state.user }),
  };

  return <Ctx.Provider value={useMemo(() => store, [state, ready, now])}>{children}</Ctx.Provider>; // eslint-disable-line react-hooks/exhaustive-deps
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
