"use client";

import { useEffect, useRef, useState } from "react";
import type { MessageKey } from "@/i18n/en";
import { getNanny } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Avatar } from "./Bits";

const PHONE_RE = /(\+?\d[\d\s-]{7,}\d)/g;

/** In-app chat after a booking request. Phone numbers are hidden until the booking is accepted. */
export function Chat({ as }: { as: "family" | "nanny" }) {
  const { bookings, messages, sendMessage, user } = useStore();
  const { t, date: fmtDate } = useT();
  const mine = bookings.filter((b) => (as === "nanny" ? b.nannyId === user?.nannyId : true));
  const [active, setActive] = useState<string | undefined>(mine[0]?.id);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const b = mine.find((x) => x.id === active);
  const thread = active ? messages[active] ?? [] : [];

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [thread.length]);

  if (mine.length === 0)
    return <div className="card p-10 text-center text-ink/70">{t("chat.empty")}</div>;

  const accepted = b && ["accepted", "inProgress", "completed"].includes(b.status);
  const mask = (s: string) => (accepted ? s : s.replace(PHONE_RE, t("chat.hidden")));

  return (
    <div className="card grid overflow-hidden md:grid-cols-[260px_1fr]">
      <ul className="max-h-48 overflow-y-auto md:max-h-[520px] border-b border-ink/5 md:border-b-0 md:border-r">
        {mine.map((x) => {
          const n = getNanny(x.nannyId)!;
          const name = as === "family" ? n.firstName : x.familyName;
          return (
            <li key={x.id}>
              <button onClick={() => setActive(x.id)} className={`flex w-full items-center gap-3 p-3 text-left ${x.id === active ? "bg-brand-light" : "hover:bg-cream"}`}>
                <Avatar name={name} color={as === "family" ? n.avatarColor : "#F4ADB3"} size={40} />
                <span className="min-w-0">
                  <b className="block truncate">{name}</b>
                  <span className="block truncate text-xs text-ink/60">{fmtDate(x.date)} · {t(`status.${x.status}` as MessageKey)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex h-[440px] min-w-0 flex-col md:h-[520px]">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {thread.length === 0 && <p className="text-center text-sm text-ink/50">{t("chat.hello")}</p>}
          {thread.map((m, i) => (
            <div key={i} className={`flex ${m.from === as ? "justify-end" : ""}`}>
              <p className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.from === as ? "bg-brand text-white" : "bg-blush"}`}>{mask(m.text)}</p>
            </div>
          ))}
          <div ref={end} />
        </div>
        <form
          className="flex gap-2 border-t border-ink/5 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim() || !active) return;
            sendMessage(active, as, text.trim());
            setText("");
          }}
        >
          <input className="input min-w-0" placeholder={t("chat.placeholder")} value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn-primary btn-sm shrink-0">{t("common.send")}</button>
        </form>
      </div>
    </div>
  );
}
