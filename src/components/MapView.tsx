"use client";

import dynamic from "next/dynamic";
import { useT } from "@/lib/i18n";
import { HeartSpinner } from "./Icons";

export type { MapPin, PinState } from "./MapInner";

export const MapView = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  const { t } = useT();
  return (
    <div className="flex h-[420px] items-center justify-center rounded-[16px] bg-brand-light">
      <HeartSpinner label={t("common.loadingMap")} />
    </div>
  );
}

export function MapLegend() {
  const { t } = useT();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 shrink-0 rounded-full bg-brand" /> {t("map.available")}</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 shrink-0 rounded-full bg-heart" /> {t("map.busy")}</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 shrink-0 rounded-full bg-[#A7B4B7]" /> {t("map.offline")}</span>
      <span className="flex items-center gap-1.5"><span className="text-bad">♥</span> {t("common.you")}</span>
    </div>
  );
}
