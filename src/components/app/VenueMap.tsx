"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { Venue } from "@/lib/types";

/**
 * Mapa dos bares parceiros (Leaflet + OpenStreetMap, sem chave de API).
 * O tema escuro é um filtro CSS sobre os tiles padrão (ver .dartfy-map em globals.css).
 * Produção: os tiles públicos do OSM são para uso leve — trocar por um provedor
 * (MapTiler, Stadia, Mapbox…) com chave quando houver volume.
 */
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const CURITIBA: [number, number] = [-25.4284, -49.2733];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function pinHtml(v: Venue, selected: boolean) {
  const [a, b] = v.tone;
  return `<div class="dartfy-pin${selected ? " is-selected" : ""}" style="--a:${a};--b:${b}"><span>${initialsOf(v.name)}</span></div>`;
}

export function VenueMap({ venues, selectedId, onSelect }: { venues: Venue[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const L = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Cria o mapa uma vez (Leaflet só roda no navegador).
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((leaflet) => {
      if (cancelled || !el.current || map.current) return;
      L.current = leaflet;
      map.current = leaflet
        .map(el.current, { center: CURITIBA, zoom: 13, zoomControl: false, attributionControl: true })
        .addLayer(leaflet.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }));
      leaflet.control.zoom({ position: "bottomright" }).addTo(map.current);
      sync();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza pontos com filtro/seleção.
  function sync(fit = true) {
    const leaflet = L.current;
    const m = map.current;
    if (!leaflet || !m) return;
    const ids = new Set(venues.map((v) => v.id));
    for (const [id, mk] of markers.current) if (!ids.has(id)) (mk.remove(), markers.current.delete(id));
    for (const v of venues) {
      const icon = leaflet.divIcon({ html: pinHtml(v, v.id === selectedId), className: "", iconSize: [44, 52], iconAnchor: [22, 50] });
      const existing = markers.current.get(v.id);
      if (existing) existing.setIcon(icon).setZIndexOffset(v.id === selectedId ? 1000 : 0);
      else {
        const mk = leaflet.marker([v.lat, v.lng], { icon, title: v.name, keyboard: true }).addTo(m);
        mk.on("click", () => onSelectRef.current(v.id));
        markers.current.set(v.id, mk);
      }
    }
    if (fit && venues.length) {
      const bounds = leaflet.latLngBounds(venues.map((v) => [v.lat, v.lng] as [number, number]));
      m.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
  }

  const venuesKey = venues.map((v) => v.id).join(",");
  useEffect(() => sync(true), [venuesKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    sync(false);
    const v = venues.find((x) => x.id === selectedId);
    if (v && map.current) map.current.panTo([v.lat, v.lng], { animate: true });
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className="dartfy-map h-full w-full" role="application" aria-label="Mapa dos bares parceiros" />;
}
