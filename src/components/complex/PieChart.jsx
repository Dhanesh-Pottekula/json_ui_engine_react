import { cn } from "../../utils/cn.js";
import { describeArc, describeDonutSlice } from "./chartUtils.js";

export default function PieChart({
  data = [],
  labelKey = "label",
  valueKey = "value",
  variant = "pie",
  centerLabel,
  centerValue,
  className,
}) {
  const rows = Array.isArray(data) ? data.filter((item) => Number(item?.[valueKey] || 0) > 0) : [];

  if (!rows.length) {
    return <div className="text-sm text-slate-500">No chart data available.</div>;
  }

  const total = rows.reduce((sum, row) => sum + Number(row?.[valueKey] || 0), 0);
  const width = 420;
  const height = 320;
  const cx = 160;
  const cy = 160;
  const outerRadius = 92;
  const isDonut = variant === "donut";
  const innerRadius = isDonut ? 56 : 0;
  let currentAngle = 0;

  return (
    <div className={cn("grid gap-4 md:grid-cols-[320px_minmax(0,1fr)] md:items-center", className)}>
      <svg className="h-auto w-full max-w-[320px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Pie chart">
        <g transform={`translate(${cx}, ${cy})`}>
          {rows.map((row, index) => {
            const value = Number(row?.[valueKey] || 0);
            const angle = (value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;
            const path = isDonut
              ? describeDonutSlice(0, 0, outerRadius, innerRadius, startAngle, endAngle)
              : `${describeArc(0, 0, outerRadius, startAngle, endAngle)} L 0 0 Z`;

            return (
              <path
                key={row.id || row.key || row?.[labelKey] || index}
                d={path}
                className={cn("stroke-slate-950", row.className)}
                strokeWidth="2"
              />
            );
          })}

          {isDonut ? (
            <>
              {centerLabel ? <text y="-6" textAnchor="middle" className="fill-slate-500 text-[12px]">{centerLabel}</text> : null}
              {centerValue ? <text y="18" textAnchor="middle" className="fill-slate-100 text-[22px] font-semibold">{centerValue}</text> : null}
            </>
          ) : null}
        </g>
      </svg>

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const value = Number(row?.[valueKey] || 0);
          const percent = Math.round((value / total) * 100);
          const label = row?.[labelKey] ?? `Slice ${index + 1}`;

          return (
            <div
              key={row.id || row.key || label || index}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 px-4 py-3"
            >
              <div className="inline-flex items-center gap-3">
                <span className={cn("h-3 w-3 rounded-full", row.swatchClassName || row.className)} />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
              <div className="text-sm text-slate-500">{percent}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
