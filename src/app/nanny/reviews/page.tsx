"use client";

import Link from "next/link";
import { Stars } from "@/components/Bits";
import { badges } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { useMine } from "../useMine";

export default function Reviews() {
  const { nanny, mine } = useMine();
  const { t, tp, td, num } = useT();
  const fresh = mine.filter((b) => b.review);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("rev.title")}</h1>
      <p className="mt-1"><Stars value={nanny.rating} /> <b>{num(nanny.rating, 1)}</b> · {tp("unit.reviews", nanny.reviewCount)}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{badges(nanny).map((b) => <span key={b} className="chip-pink">{t(b)}</span>)}</div>
      <Link href={`/nannies/${nanny.id}`} className="btn-ghost btn-sm mt-4">{t("rev.preview")}</Link>
      <ul className="mt-6 space-y-3">
        {fresh.map((b) => (
          <li key={b.id} className="card p-4"><b>{b.familyName}</b> <Stars value={b.review!.stars} size="text-sm" /><p className="text-sm">{b.review!.text}</p><p className="text-xs text-brand-dark">{b.review!.tags.map((x) => td("tag.", x)).join(" · ")}</p></li>
        ))}
        {nanny.reviews.map((r) => (
          <li key={r.author + r.date} className="card p-4"><b>{r.author}</b> <Stars value={r.stars} size="text-sm" /><p className="text-sm" lang="en">{r.text}</p><p className="text-xs text-brand-dark">{r.tags.map((x) => td("tag.", x)).join(" · ")}</p></li>
        ))}
      </ul>
    </div>
  );
}
