import { cn } from "../../utils/cn.js";
import { buildAreaPath, buildLinearPath, getSeriesMax, sampleRows } from "./chartUtils.js";

export default function AreaChart({
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
  const chartTop = 18;
  const chartBottom = 40;
  const maxValue = getSeriesMax(rows, series);
  const usableHeight = height - chartTop - chartBottom;
  const stepX = rows.length > 1 ? width / (rows.length - 1) : 0;
  const baselineY = height - chartBottom;

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

      <svg className="h-auto w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Area chart">
        <line x1="0" y1={baselineY} x2={width} y2={baselineY} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />

        {rows.map((row, index) => (
          <text
            key={`${row?.[labelKey] ?? index}-label`}
            x={index * stepX}
            y={height - 14}
            textAnchor={index === 0 ? "start" : index === rows.length - 1 ? "end" : "middle"}
            className="fill-slate-500 text-[11px]"
          >
            {row?.[labelKey] ?? ""}
          </text>
        ))}

        {series.map((entry) => {
          const points = rows.map((row, index) => {
            const value = Number(row?.[entry.key] || 0);
            return {
              x: index * stepX,
              y: baselineY - (value / maxValue) * usableHeight,
            };
          });

          return (
            <g key={entry.key}>
              <path d={buildAreaPath(points, baselineY)} className={cn("opacity-20", entry.fillClassName || entry.className)} />
              <path
                d={buildLinearPath(points)}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={entry.className}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
