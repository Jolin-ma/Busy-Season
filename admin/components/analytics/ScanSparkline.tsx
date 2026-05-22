'use client';

interface Props {
  // Array of daily scan counts, oldest first, last 30 days
  data: number[];
  height?: number;
}

export default function ScanSparkline({ data, height = 48 }: Props) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const width = 320;
  const barW = Math.floor(width / data.length) - 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      {data.map((val, i) => {
        const barH = Math.max(2, (val / max) * (height - 4));
        const x = i * (barW + 2);
        const y = height - barH;
        return (
          <rect
            key={i}
            x={x} y={y}
            width={barW} height={barH}
            rx={2}
            className="fill-stone-300"
          >
            <title>{val} scan{val !== 1 ? 's' : ''}</title>
          </rect>
        );
      })}
    </svg>
  );
}
