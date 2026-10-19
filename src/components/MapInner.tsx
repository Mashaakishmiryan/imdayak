"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { fuzzedLocation } from "@/lib/data";
import { useT } from "@/lib/i18n";
import type { NannyProfile } from "@/lib/types";

export type PinState = "available" | "busy" | "offline";
const PIN_COLOR: Record<PinState, string> = { available: "#0C8FA0", busy: "#F4ADB3", offline: "#A7B4B7" };

const pinIcon = (state: PinState, highlight: boolean) =>
  L.divIcon({
    className: "",
    html: `<div class="pin" style="background:${PIN_COLOR[state]};${highlight ? "outline:3px solid #1F3A40;" : ""}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });

const homeIcon = L.divIcon({
  className: "",
  html: `<svg viewBox="0 0 24 24" width="38" height="38" style="filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))"><path fill="#E5675F" stroke="white" stroke-width="1.5" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.2 1.7-2 3.1-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>`,
  iconSize: [38, 38],
  iconAnchor: [19, 34],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center[0], center[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export interface MapPin {
  nanny: NannyProfile;
  state: PinState;
  score?: number;
  distanceKm?: number;
}

export default function MapInner({
  center,
  pins,
  radiusKm,
  highlightId,
  height = 520,
  zoom = 13,
}: {
  center: [number, number];
  pins: MapPin[];
  radiusKm?: number;
  highlightId?: string;
  height?: number;
  zoom?: number;
}) {
  const { t, money, num } = useT();
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: "100%" }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} />
      {radiusKm && <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: "#0C8FA0", weight: 1, fillOpacity: 0.05 }} />}
      <Marker position={center} icon={homeIcon} />
      {pins.map(({ nanny: n, state, score, distanceKm }) => (
        <Marker key={n.id} position={fuzzedLocation(n)} icon={pinIcon(state, n.id === highlightId)}>
          <Popup>
            <div style={{ minWidth: 190, fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 40, height: 40, borderRadius: 99, background: n.avatarColor, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                  {n.firstName[0]}
                  {n.lastName[0]}
                </span>
                <div>
                  <b style={{ fontSize: 15 }}>{n.firstName}</b> <span style={{ color: "#3BB273", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{t("common.verified")}</span>
                  <div style={{ fontSize: 12, color: "#1F3A40aa" }}>
                    ★ {num(n.rating, 1)} {distanceKm !== undefined && `· ${t("common.km", { n: num(distanceKm, 1) })}`}
                  </div>
                </div>
              </div>
              <div style={{ margin: "8px 0", fontSize: 13 }}>
                {score !== undefined && <b style={{ background: "#F4ADB3", borderRadius: 99, padding: "2px 8px", marginRight: 6 }}>♥ {score}%</b>}
                <b style={{ whiteSpace: "nowrap" }}>{money(n.pricePerHour)}</b> {t("common.perHour")}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <Link href={`/nannies/${n.id}`} style={{ flex: 1, textAlign: "center", border: "1px solid #0C8FA055", borderRadius: 99, padding: "5px 8px", color: "#0A7785", fontWeight: 700 }}>
                  {t("common.profile")}
                </Link>
                <Link href={`/book/${n.id}`} style={{ flex: 1, textAlign: "center", background: "#0C8FA0", borderRadius: 99, padding: "5px 8px", color: "#fff", fontWeight: 700 }}>
                  {t("common.book")}
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
