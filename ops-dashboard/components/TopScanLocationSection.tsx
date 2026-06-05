'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { MapMarker, MarkerStatus } from './OntarioMap';

const OntarioMap = dynamic(() => import('./OntarioMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-stone-100 animate-pulse" style={{ height: 360 }} />
  ),
});

// ── Time-frame definition ─────────────────────────────────────────────────────
const TIME_FRAMES = ['Today', 'This Week', 'This Month', 'All-Time'] as const;
type TimeFrame = typeof TIME_FRAMES[number];

// Multipliers relative to the monthly base figure in GEO_DATA
const TF_MULTIPLIER: Record<TimeFrame, number> = {
  'Today':      0.04,
  'This Week':  0.26,
  'This Month': 1.00,
  'All-Time':   4.30,
};

// ── Individual memorial locations ─────────────────────────────────────────────
// Each entry is a real cemetery, memorial park, or lakefront trail where a
// LegacyLink plaque has been installed.  Coordinates are cemetery/trail-level,
// not city-centre.  Scan volumes are distributed from the GEO_DATA city totals.
interface LocationSeed {
  id:        string;
  name:      string;
  city:      string;
  lat:       number;
  lng:       number;
  scans:     number;
  status:    MarkerStatus;
}

const BASE_MARKERS: LocationSeed[] = [
  // ── Toronto area ────────────────────────────────────────────────────────────
  { id: 'tor-01', name: 'Mount Pleasant Cemetery',      city: 'Toronto', lat: 43.6969, lng: -79.3892, scans: 214, status: 'ACTIVE'  },
  { id: 'tor-02', name: 'Toronto Necropolis',           city: 'Toronto', lat: 43.6673, lng: -79.3598, scans: 187, status: 'ACTIVE'  },
  { id: 'tor-03', name: 'Prospect Cemetery',            city: 'Toronto', lat: 43.6611, lng: -79.4661, scans: 143, status: 'ACTIVE'  },
  { id: 'tor-04', name: 'Pine Hills Cemetery',          city: 'Toronto', lat: 43.7504, lng: -79.2418, scans:  98, status: 'ACTIVE'  },
  { id: 'tor-05', name: 'Humber Bay Shores Trail',      city: 'Toronto', lat: 43.6276, lng: -79.4783, scans:  76, status: 'DORMANT' },
  { id: 'tor-06', name: 'York Cemetery',                city: 'Toronto', lat: 43.7334, lng: -79.4649, scans:  45, status: 'ACTIVE'  },

  // ── Ottawa ───────────────────────────────────────────────────────────────────
  { id: 'ott-01', name: 'Beechwood National Cemetery',  city: 'Ottawa',  lat: 45.4415, lng: -75.6606, scans: 134, status: 'ACTIVE'  },
  { id: 'ott-02', name: 'Notre-Dame Cemetery',          city: 'Ottawa',  lat: 45.4381, lng: -75.6907, scans:  64, status: 'ACTIVE'  },

  // ── Hamilton ─────────────────────────────────────────────────────────────────
  { id: 'ham-01', name: 'Hamilton Cemetery',            city: 'Hamilton', lat: 43.2557, lng: -79.8625, scans:  89, status: 'ACTIVE'  },
  { id: 'ham-02', name: 'Woodland Cemetery Hamilton',   city: 'Hamilton', lat: 43.2267, lng: -79.8967, scans:  54, status: 'DORMANT' },

  // ── London, ON ───────────────────────────────────────────────────────────────
  { id: 'lon-01', name: 'London Cemetery',              city: 'London',   lat: 42.9849, lng: -81.2453, scans:  71, status: 'ACTIVE'  },
  { id: 'lon-02', name: 'Woodland Cemetery London',     city: 'London',   lat: 43.0094, lng: -81.2956, scans:  38, status: 'DORMANT' },

  // ── Kingston ─────────────────────────────────────────────────────────────────
  { id: 'kin-01', name: 'Cataraqui Cemetery',           city: 'Kingston', lat: 44.2415, lng: -76.5429, scans:  52, status: 'ACTIVE'  },

  // ── Barrie ───────────────────────────────────────────────────────────────────
  { id: 'bar-01', name: 'Barrie Union Cemetery',        city: 'Barrie',   lat: 44.3894, lng: -79.7031, scans:  31, status: 'ACTIVE'  },

  // ── Peterborough ─────────────────────────────────────────────────────────────
  { id: 'pet-01', name: 'Little Lake Cemetery',         city: 'Peterborough', lat: 44.2955, lng: -78.3192, scans: 28, status: 'DORMANT' },

  // ── Niagara Falls ────────────────────────────────────────────────────────────
  { id: 'nia-01', name: 'Fairview Cemetery Niagara',    city: 'Niagara Falls', lat: 43.1145, lng: -79.0813, scans: 19, status: 'BROKEN'  },

  // ── Windsor ──────────────────────────────────────────────────────────────────
  { id: 'win-01', name: 'Victoria Memorial Cemetery',   city: 'Windsor',  lat: 42.3073, lng: -83.0389, scans:  24, status: 'BROKEN'  },

  // ── Vancouver ────────────────────────────────────────────────────────────────
  { id: 'van-01', name: 'Mountain View Cemetery',       city: 'Vancouver', lat: 49.2334, lng: -123.0956, scans: 198, status: 'ACTIVE'  },
  { id: 'van-02', name: 'Forest Lawn Memorial Park',    city: 'Vancouver', lat: 49.2333, lng: -122.9977, scans: 163, status: 'ACTIVE'  },
  { id: 'van-03', name: 'Lynn Valley Greenway Trail',   city: 'Vancouver', lat: 49.3581, lng: -123.0239, scans:  87, status: 'ACTIVE'  },
  { id: 'van-04', name: 'Ocean View Burial Park',       city: 'Vancouver', lat: 49.1981, lng: -122.8544, scans:  93, status: 'DORMANT' },

  // ── Calgary ──────────────────────────────────────────────────────────────────
  { id: 'cal-01', name: "Queen's Park Cemetery",        city: 'Calgary',  lat: 51.0607, lng: -114.0630, scans: 156, status: 'ACTIVE'  },
  { id: 'cal-02', name: 'Burnsland Cemetery',           city: 'Calgary',  lat: 51.0332, lng: -114.0582, scans: 112, status: 'ACTIVE'  },
  { id: 'cal-03', name: 'Bow River Pathway Memorial',   city: 'Calgary',  lat: 51.0447, lng: -114.0719, scans:  79, status: 'ACTIVE'  },
  { id: 'cal-04', name: 'Union Cemetery Calgary',       city: 'Calgary',  lat: 51.0512, lng: -114.0399, scans:  40, status: 'DORMANT' },

  // ── Montreal ─────────────────────────────────────────────────────────────────
  { id: 'mtl-01', name: 'Notre-Dame-des-Neiges Cemetery', city: 'Montreal', lat: 45.4967, lng: -73.6265, scans: 142, status: 'ACTIVE'  },
  { id: 'mtl-02', name: 'Mount Royal Cemetery',           city: 'Montreal', lat: 45.5085, lng: -73.6048, scans: 107, status: 'ACTIVE'  },
  { id: 'mtl-03', name: 'Côte-des-Neiges Cemetery',       city: 'Montreal', lat: 45.4934, lng: -73.6174, scans:  63, status: 'DORMANT' },

  // ── Edmonton ─────────────────────────────────────────────────────────────────
  { id: 'edm-01', name: 'Edmonton Cemetery',            city: 'Edmonton', lat: 53.5571, lng: -113.5063, scans:  88, status: 'ACTIVE'  },
  { id: 'edm-02', name: 'River Valley Trail Memorial',  city: 'Edmonton', lat: 53.5202, lng: -113.5398, scans:  55, status: 'DORMANT' },

  // ── Winnipeg ─────────────────────────────────────────────────────────────────
  { id: 'wpg-01', name: 'Elmwood Cemetery',             city: 'Winnipeg', lat: 49.9050, lng: -97.0960, scans:  52, status: 'ACTIVE'  },
  { id: 'wpg-02', name: 'St. Vital Cemetery',           city: 'Winnipeg', lat: 49.8402, lng: -97.1053, scans:  35, status: 'DORMANT' },

  // ── Halifax ──────────────────────────────────────────────────────────────────
  { id: 'hfx-01', name: 'Camp Hill Cemetery',           city: 'Halifax',  lat: 44.6461, lng: -63.5804, scans:  15, status: 'BROKEN'  },
];

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_META: Record<MarkerStatus, { dot: string; text: string; bg: string }> = {
  ACTIVE:  { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50'  },
  DORMANT: { dot: 'bg-slate-400',   text: 'text-slate-500',   bg: 'bg-slate-50'    },
  BROKEN:  { dot: 'bg-red-500',     text: 'text-red-600',     bg: 'bg-red-50'      },
};

function StatusBadge({ status }: { status: MarkerStatus }) {
  const { dot, text, bg } = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${text} ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ── Live scan ticker ──────────────────────────────────────────────────────────
interface LiveScan { shortId: string; city?: string; timestamp: string }

export default function TopScanLocationSection() {
  const [timeFrame,    setTimeFrame]    = useState<TimeFrame>('This Month');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<MarkerStatus | 'ALL'>('ALL');
  const [highlighted,  setHighlighted]  = useState<string | null>(null); // location id
  const [liveScans,    setLiveScans]    = useState<LiveScan[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket — Fastify /ops/ws
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_FASTIFY_WS_URL ?? 'ws://localhost:3000/ops/ws';
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data as string);
          if (msg.type === 'scan')
            setLiveScans((p) => [msg.data as LiveScan, ...p].slice(0, 5));
        } catch { /* ignore */ }
      };
      wsRef.current = ws;
    } catch { /* no backend in dev */ }
    return () => ws?.close();
  }, []);

  // Derive scan count for the selected time-frame
  const scansForTF = (base: number) =>
    Math.max(1, Math.round(base * TF_MULTIPLIER[timeFrame]));

  // Full marker list for the map — all locations, clustering handles density
  const allMarkers: MapMarker[] = useMemo(() =>
    BASE_MARKERS.map((m) => ({
      id:            m.id,
      name:          m.name,
      city:          m.city,
      latitude:      m.lat,
      longitude:     m.lng,
      scans:         scansForTF(m.scans),
      scansThisWeek: Math.max(1, Math.round(m.scans * TF_MULTIPLIER['This Week'])),
      status:        m.status,
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [timeFrame]);

  // Filtered + sorted list for the data table
  const tableRows = useMemo(() => {
    return BASE_MARKERS
      .filter((m) => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          m.city.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q);
        const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
        return matchSearch && matchStatus;
      })
      .map((m) => ({ ...m, tfScans: scansForTF(m.scans) }))
      .sort((a, b) => b.tfScans - a.tfScans);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus, timeFrame]);

  const tableMax = tableRows[0]?.tfScans ?? 1;

  return (
    <section id="geographic" className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-0.5">
            Top Scan Locations
          </h2>
          <p className="text-sm font-semibold text-stone-800">Ontario & Canada · live map view</p>
        </div>
        {liveScans.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live: {liveScans[0].city ?? liveScans[0].shortId}
          </span>
        )}
      </div>

      {/* ── Map ── */}
      <div className="px-5 pb-2">
        <OntarioMap
          markers={allMarkers}
          highlightId={highlighted}
          onMarkerClick={(m) => setHighlighted(m.id === highlighted ? null : m.id)}
        />
        {/* Legend */}
        <div className="flex items-center gap-5 mt-2.5">
          {(Object.keys(STATUS_META) as MarkerStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium transition-opacity ${
                filterStatus !== 'ALL' && filterStatus !== s ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
              <span className="text-stone-600">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
            </button>
          ))}
          <span className="ml-auto text-[10px] text-stone-400 tabular-nums">
            {allMarkers.length} markers · zoom in to uncluster
          </span>
        </div>
      </div>

      {/* ── Controls bar: time-frame + search + filter ── */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-t border-stone-50 mt-2">
        {/* Time-frame tabs */}
        <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
          {TIME_FRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                timeFrame === tf
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-center gap-2 justify-end">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="City or memorial…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-stone-300 text-stone-800 placeholder:text-stone-400 w-44"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as MarkerStatus | 'ALL')}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-stone-300 text-stone-700"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DORMANT">Dormant</option>
            <option value="BROKEN">Broken</option>
          </select>
        </div>
      </div>

      {/* ── Data table ── */}
      <div className="px-5 pb-5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 w-6">#</th>
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">Location</th>
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden sm:table-cell">Volume</th>
              <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Scans · <span className="text-indigo-400">{timeFrame}</span>
              </th>
              <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {tableRows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-xs text-stone-400">
                  No locations match your search.
                </td>
              </tr>
            )}
            {tableRows.map((row, i) => {
              const isActive = highlighted === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => setHighlighted(isActive ? null : row.id)}
                  className={`cursor-pointer transition-colors group ${
                    isActive ? 'bg-stone-50' : 'hover:bg-stone-50/70'
                  }`}
                >
                  {/* rank */}
                  <td className="py-3 pr-3">
                    <span className="text-[11px] font-bold text-stone-300 tabular-nums">{i + 1}</span>
                  </td>

                  {/* location */}
                  <td className="py-3 min-w-0 pr-4">
                    <p className="text-xs font-semibold text-stone-800 truncate">{row.name}</p>
                    <p className="text-[10px] text-stone-400">{row.city}, Canada</p>
                  </td>

                  {/* volume bar */}
                  <td className="py-3 hidden sm:table-cell pr-4">
                    <div className="w-28 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-stone-800 transition-all duration-500"
                        style={{ width: `${(row.tfScans / tableMax) * 100}%` }}
                      />
                    </div>
                  </td>

                  {/* scan count */}
                  <td className="py-3 text-right pr-4">
                    <span className="text-xs font-semibold text-stone-800 tabular-nums">
                      {row.tfScans.toLocaleString()}
                    </span>
                  </td>

                  {/* status */}
                  <td className="py-3 text-right hidden md:table-cell">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tableRows.length > 0 && (
          <p className="text-[10px] text-stone-300 mt-3 text-right">
            Showing {tableRows.length} location{tableRows.length !== 1 ? 's' : ''} · ordered by scan volume
          </p>
        )}
      </div>
    </section>
  );
}
