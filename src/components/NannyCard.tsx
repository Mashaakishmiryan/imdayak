"use client";

import Link from "next/link";
import { badges } from "@/lib/data";
import { useMsg, useT } from "@/lib/i18n";
import type { Msg } from "@/lib/msg";
import { useStore } from "@/lib/store";
import type { NannyProfile } from "@/lib/types";
import { Avatar, MatchBadge, Stars, VerifiedBadge } from "./Bits";
import { Heart, Pin } from "./Icons";

export function NannyCard({
  nanny: n,
  score,
  distanceKm,
  reasons,
  rank,
  compact,
}: {
  nanny: NannyProfile;
  score?: number;
  distanceKm?: number;
  reasons?: Msg[];
  rank?: number;
  compact?: boolean;
}) {
  const { t, num, money } = useT();
  const msg = useMsg();
  const { favourites, toggleFavourite } = useStore();
  const fav = favourites.includes(n.id);
  return (
    <article className={`@container card lift relative flex min-w-0 flex-col p-5 ${rank === 1 ? "ring-2 ring-heart" : ""}`}>
      {rank && (
        <span className="absolute -top-3 left-5 max-w-[calc(100%-2.5rem)] truncate rounded-full bg-brand px-3 py-0.5 text-xs font-black text-white">
          {t("card.rank", { n: rank })}
        </span>
      )}
      <button
        onClick={() => toggleFavourite(n.id)}
        className="absolute right-4 top-4 text-heart-dark transition hover:scale-110"
        aria-label={fav ? t("card.unsave") : t("card.save")}
        aria-pressed={fav}
      >
        <Heart className="h-6 w-6" filled={fav} />
      </button>
      <div className="flex items-center gap-4 pr-8">
        <Avatar name={`${n.firstName} ${n.lastName}`} color={n.avatarColor} size={compact ? 48 : 64} />
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-black">
            {n.firstName}, {n.age} <VerifiedBadge />
          </h3>
          <p className="flex flex-wrap items-center gap-x-1 text-sm text-ink/70">
            <Pin /> <span>{n.district}, {n.city}</span>
            {distanceKm !== undefined && <span className="whitespace-nowrap">· {t("common.km", { n: num(distanceKm, 1) })}</span>}
          </p>
          <p className="text-sm">
            <Stars value={n.rating} size="text-sm" /> <b>{num(n.rating, 1)}</b> <span className="text-ink/60">({n.reviewCount})</span>
          </p>
        </div>
      </div>
      {score !== undefined && (
        <div className="mt-4">
          <MatchBadge score={score} />
        </div>
      )}
      {reasons && <p className="mt-3 text-sm font-semibold text-brand-dark">{reasons.map(msg).join(" · ")}</p>}
      {/* Bio is written by the nanny, so it stays in the language they wrote it in */}
      {!compact && <p className="mt-3 line-clamp-2 text-sm text-ink/75">{n.bio}</p>}
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges(n).slice(0, 3).map((b) => (
            <span key={b} className="chip-pink text-xs">{t(b)}</span>
          ))}
        </div>
      )}
      {/* Price on its own line. Buttons sit side by side only when the card itself is wide enough
          (container query, not screen width): "Забронировать" is one long word that can't wrap. */}
      <div className="mt-auto pt-4">
        <p className="whitespace-nowrap text-lg font-black">
          {money(n.pricePerHour)} <span className="text-sm font-semibold text-ink/60">{t("common.perHour")}</span>
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 @[19rem]:grid-cols-2">
          <Link href={`/nannies/${n.id}`} className="btn-ghost btn-sm px-3">{t("common.profile")}</Link>
          <Link href={`/book/${n.id}`} className="btn-primary btn-sm heart-pulse px-3">
            <Heart className="h-4 w-4 shrink-0" /> {t("common.book")}
          </Link>
        </div>
      </div>
    </article>
  );
}
