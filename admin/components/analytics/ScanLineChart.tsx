'use client';

interface Props {
  data: number[];       // daily counts, oldest → newest
  height?: number;
  color?: string;       // tailwind stroke colour class
}

export default function ScanLineChart({ data, height = 120, color = '#292524' }: Props) {
  if (data.length < 2) return null;

  const W = 600;
  const H = height;
  const pad = { top: 8, right: 4, bottom: 4, left: 4 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const max = Math.max(...data, 1);
  const xs = data.map((_, i) => pad.left + (i / (data.length - 1)) * iW);
  const ys = data.map(v => pad.top + iH - (v / max) * iH);

  // Smooth bezier path
  function mkPath(pts: [number, number][]): string {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = (pts[i - 1][0] + pts[i][0]) / 2;
      d += ` C ${cp1x} ${pts[i - 1][1]}, ${cp1x} ${pts[i][1]}, ${pts[i][0]} ${pts[i][1]}`;
    }
    return d;
  }

  const pts = xs.map((x, i) => [x, ys[i]] as [number, number]);
  const linePath = mkPath(pts);
  const areaPath = linePath
    + ` L ${xs[xs.length - 1]} ${pad.top + iH} L ${xs[0]} ${pad.top + iH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* dots on non-zero days */}
      {pts.map(([x, y], i) =>
        data[i] > 0 ? (
          <circle key={i} cx={x} cy={y} r="2.5" fill={color} opacity="0.6">
            <title>{data[i]} scan{data[i] !== 1 ? 's' : ''}</title>
          </circle>
        ) : null
      )}
    </svg>
  );
}
