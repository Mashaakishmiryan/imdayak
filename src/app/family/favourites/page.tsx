"use client";

import Link from "next/link";
import { RequireRole } from "@/components/Area";
import { NannyCard } from "@/components/NannyCard";
import { getNanny } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";

function Favs() {
  const { favourites } = useStore();
  const { t } = useT();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-black">{t("fav.title")}</h1>
      <p className="text-ink/70">{t("fav.sub")}</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {favourites.length === 0 && <p className="card p-6 md:col-span-3">{t("fav.empty")} <Link href="/find" className="font-bold text-brand-dark underline">{t("fav.browse")}</Link></p>}
        {favourites.map((id) => getNanny(id)).filter(Boolean).map((n) => <NannyCard key={n!.id} nanny={n!} />)}
      </div>
    </div>
  );
}

export default function Page() {
  return <RequireRole role="family"><Favs /></RequireRole>;
}
