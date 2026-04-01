import { cn } from "../../utils/cn.js";
import { getSeriesMax, sampleRows } from "./chartUtils.js";

export default function BarChart({
  data = [],
  series = [],
  labelKey = "label",
  maxPoints = 12,
  height = 320,
  className,
}) {
  const rows = sampleRows(data, maxPoints);

  if (!rows.length || !series.length) {
    return <div className="text-sm text-slate-500">No chart data available.</div>;
  }

  const width = 760;
  const chartTop = 20;
  const chartBottom = 42;
  const barRegionHeight = height - chartTop - chartBottom;
  const groupWidth = width / rows.length;
  const barWidth = Math.max(10, (groupWidth - 18) / series.length);
  const maxValue = getSeriesMax(rows, series);

  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      <div className="flex flex-wrap gap-3">
        {series.map((entry) => (
          <span className="inline-flex items-center gap-2 text-sm text-slate-500" key={entry.key}>
            <span className={cn("h-2.5 w-2.5 rounded-full", entry.swatchClassName || entry.className)} />
            {entry.label || entry.key}
          </span>
        ))}
      </div>

      <svg
        className="h-auto w-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Bar chart"
      >
        <line
          x1="0"
          y1={height - chartBottom}
          x2={width}
          y2={height - chartBottom}
          stroke="rgba(31, 41, 55, 0.18)"
          strokeWidth="1"
        />

        {rows.map((row, rowIndex) => {
          const baseX = rowIndex * groupWidth + 8;
          const label = row?.[labelKey] ?? "";

          return (
            <g key={`${label}-${rowIndex}`}>
              {series.map((entry, seriesIndex) => {
                const rawValue = Number(row?.[entry.key] || 0);
                const barHeight = (rawValue / maxValue) * barRegionHeight;
                const x = baseX + seriesIndex * (barWidth + 6);
                const y = height - chartBottom - barHeight;

                return (
                  <rect
                    key={entry.key}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="8"
                    opacity="0.92"
                    className={entry.className}
                  />
                );
              })}

              <text
                x={baseX + ((barWidth + 6) * series.length - 6) / 2}
                y={height - 16}
                textAnchor="middle"
                className="fill-slate-500 text-[11px]"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
