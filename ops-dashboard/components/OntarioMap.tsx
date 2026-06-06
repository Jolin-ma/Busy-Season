'use client';

import { useEffect, useRef, useState } from 'react';

export type MarkerStatus = 'ACTIVE' | 'DORMANT' | 'BROKEN';

export interface MapMarker {
  id:            string;
  name:          string;   // cemetery / trail name
  city:          string;
  latitude:      number;
  longitude:     number;
  scans:         number;         // selected time-frame total
  scansThisWeek: number;
  status:        MarkerStatus;
  shortId?:      string;         // LegacyLink profile short ID → /p/:shortId
}

interface Props {
  markers:        MapMarker[];
  highlightId?:   string | null;
  focusId?:       string | null;
  onMarkerClick?: (marker: MapMarker) => void;
}

// ── Colour tokens ─────────────────────────────────────────────────────────────
const COLOR: Record<MarkerStatus, { fill: string; ring: string; bg: string; text: string }> = {
  ACTIVE:  { fill: '#10b981', ring: '#059669', bg: '#ecfdf5', text: '#065f46' },
  DORMANT: { fill: '#94a3b8', ring: '#64748b', bg: '#f8fafc', text: '#475569' },
  BROKEN:  { fill: '#ef4444', ring: '#dc2626', bg: '#fef2f2', text: '#991b1b' },
};
const LABEL: Record<MarkerStatus, string> = {
  ACTIVE: 'Active', DORMANT: 'Dormant', BROKEN: 'Broken',
};

const ONTARIO_CENTER: [number, number] = [44.5, -79.5];
const DEFAULT_ZOOM = 7;

// ── Pin icon HTML ─────────────────────────────────────────────────────────────
// Layout: dot (geographic anchor) + label card below-right.
// The whole wrapper has pointer-events:auto and cursor:pointer so every pixel
// of the label is clickable, not just the tiny dot.
function buildPinHtml(m: MapMarker, highlighted: boolean, focused: boolean): string {
  const { fill, ring } = COLOR[m.status];
  const dot = highlighted || focused ? 13 : 10;
  // Truncate long cemetery names so the card stays compact
  const shortName = m.name.length > 28 ? m.name.slice(0, 26) + '…' : m.name;

  return `
    <div style="
      display:inline-flex;flex-direction:column;align-items:flex-start;gap:3px;
      pointer-events:auto;cursor:pointer;
    ">
      <div class="${focused ? 'll-blink' : ''}" style="
        width:${dot}px;height:${dot}px;border-radius:50%;flex-shrink:0;
        background:${fill};border:2px solid ${ring};
        --blink-color:${fill}90;
        box-shadow:${highlighted && !focused
          ? `0 0 0 5px ${fill}35, 0 2px 10px rgba(0,0,0,0.28)`
          : '0 1px 4px rgba(0,0,0,0.22)'};
        transition:box-shadow .15s;
      "></div>
      <div style="
        display:inline-flex;align-items:center;gap:4px;
        background:rgba(255,255,255,0.97);
        border:1px solid rgba(0,0,0,0.09);
        border-radius:7px;
        padding:3px 8px 3px 5px;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
        white-space:nowrap;
      ">
        <span style="
          width:7px;height:7px;border-radius:50%;
          background:${fill};flex-shrink:0;
        "></span>
        <span style="font-size:11px;font-weight:700;color:#1c1c1e;font-family:system-ui,sans-serif;">${shortName}</span>
        <span style="font-size:9px;font-weight:600;color:${ring};font-family:system-ui,sans-serif;opacity:0.85;">${LABEL[m.status]}</span>
      </div>
    </div>`;
}

// ── Popup card HTML ───────────────────────────────────────────────────────────
function buildPopupHtml(m: MapMarker): string {
  const { fill, ring, bg, text } = COLOR[m.status];
  const label = LABEL[m.status];

  return `
    <div style="font-family:system-ui,sans-serif;width:220px;padding:4px 0 2px">

      <!-- name + location -->
      <p style="font-weight:800;font-size:13px;margin:0 0 2px;color:#111;line-height:1.35">${m.name}</p>
      <p style="font-size:11px;color:#9ca3af;margin:0 0 10px;display:flex;align-items:center;gap:4px">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        ${m.city}, Canada
      </p>

      <!-- status badge + scans this week -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="
          display:inline-flex;align-items:center;gap:5px;
          font-size:11px;font-weight:700;
          padding:4px 10px;border-radius:9999px;
          background:${bg};color:${text};
          border:1px solid ${fill}40;
        ">
          <span style="
            width:6px;height:6px;border-radius:50%;background:${fill};
            ${m.status === 'ACTIVE' ? 'box-shadow:0 0 0 2px ' + fill + '40;' : ''}
          "></span>
          ${label}
        </span>
        <div style="text-align:right">
          <p style="font-size:13px;font-weight:800;color:#111;margin:0;line-height:1">${m.scansThisWeek.toLocaleString()}</p>
          <p style="font-size:9px;color:#9ca3af;margin:0">scans this week</p>
        </div>
      </div>

      <!-- divider + footer -->
      <div style="border-top:1px solid #f3f4f6;padding-top:9px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:11px;color:#6b7280">
          <strong style="color:#374151">${m.scans.toLocaleString()}</strong> total scans
        </span>
        ${m.shortId
          ? `<a href="/accounts?shortId=${m.shortId}" style="font-size:10px;font-weight:700;color:#6366f1;text-decoration:none;display:inline-flex;align-items:center;gap:3px;padding:4px 9px;border-radius:7px;background:#eef2ff;border:1px solid #c7d2fe;cursor:pointer;">View Account ↗</a>`
          : `<span style="font-size:10px;color:#d1d5db">No account linked</span>`
        }
      </div>
    </div>`;
}

export default function OntarioMap({ markers, highlightId, focusId, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<import('leaflet').Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef   = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef   = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // ── Init map once ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const mod = await import('leaflet');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L: any = (mod as any).default ?? mod;
      (window as unknown as Record<string, unknown>).L = L;
      await import('leaflet.markercluster');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const LC = (window as unknown as Record<string, any>).L;

      if (cancelled || !containerRef.current) return;
      leafletRef.current = LC;

      const map = LC.map(containerRef.current, {
        center: ONTARIO_CENTER,
        zoom:   DEFAULT_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      LC.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const cluster = LC.markerClusterGroup({
        maxClusterRadius: 55,
        showCoverageOnHover: false,
        // Custom cluster bubble
        iconCreateFunction: (c: { getChildCount: () => number }) => {
          const n = c.getChildCount();
          return LC.divIcon({
            html: `
              <div style="
                width:38px;height:38px;border-radius:50%;
                background:#18181b;color:#fff;
                display:flex;align-items:center;justify-content:center;
                font-size:12px;font-weight:800;font-family:system-ui,sans-serif;
                border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.28);
                cursor:pointer;
              ">${n}</div>`,
            className: '',
            iconSize:  [38, 38],
            iconAnchor: [19, 19],
          });
        },
      });

      map.addLayer(cluster);
      clusterRef.current = cluster;
      mapRef.current     = map;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = clusterRef.current = leafletRef.current = null;
    };
  }, []);

  // ── Fly to focused marker ────────────────────────────────────────────────────
  useEffect(() => {
    if (!focusId || !mapRef.current || !mapReady) return;
    const target = markers.find(m => m.id === focusId);
    if (!target) return;
    mapRef.current.flyTo([target.latitude, target.longitude], 14, {
      animate:      true,
      duration:     1.2,
      easeLinearity: 0.25,
    });
  // markers intentionally excluded — only fly when focusId itself changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, mapReady]);

  // ── Rebuild markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const L       = leafletRef.current;
    const map     = mapRef.current;
    const cluster = clusterRef.current;
    if (!L || !map || !cluster || !mapReady) return;

    cluster.clearLayers();

    markers.forEach((m) => {
      const highlighted = !!highlightId && m.id === highlightId;
      const focused     = !!focusId     && m.id === focusId;
      const dotPx = highlighted || focused ? 13 : 10;

      // iconAnchor = center of the dot so the coordinate maps exactly to the dot
      // popupAnchor = opens the popup above the dot
      const icon = L.divIcon({
        className:   '',
        iconSize:    [200, 50],
        iconAnchor:  [Math.round(dotPx / 2), Math.round(dotPx / 2)],
        popupAnchor: [75, -8],
        html: buildPinHtml(m, highlighted, focused),
      });

      const marker = L.marker([m.latitude, m.longitude], {
        icon,
        // Raise interactive z-index so the label card captures events properly
        riseOnHover: true,
      });

      // Popup — opens on click AND hover
      const popup = L.popup({
        maxWidth:       260,
        className:      'll-popup',
        autoPan:        true,
        autoPanPadding: [40, 40],
        closeButton:    true,
      }).setContent(buildPopupHtml(m));

      marker.bindPopup(popup);

      // Open popup on hover too (per spec)
      marker.on('mouseover', function (this: typeof marker) {
        this.openPopup();
      });

      // Notify parent on click (for table row highlight)
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(m);
      });

      cluster.addLayer(marker);
    });
  }, [markers, highlightId, focusId, mapReady, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height: 360 }}
    />
  );
}
