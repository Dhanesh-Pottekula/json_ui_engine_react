import { cn } from "../../utils/cn.js";

function sampleData(data = [], maxBars = 12) {
  if (!Array.isArray(data) || data.length <= maxBars) {
    return data;
  }

  const interval = Math.max(1, Math.floor(data.length / maxBars));
  const sampled = data.filter((_, index) => index % interval === 0);
  return sampled.slice(0, maxBars);
}

export default function BarChart({
  data = [],
  bars = [],
  labelKey = "label",
  maxBars = 12,
  className,
  legendClassName,
  legendItemClassName,
  swatchClassName,
  svgClassName,
  axisClassName,
  emptyClassName,
}) {
  const rows = sampleData(data, maxBars);

  if (!rows.length || !bars.length) {
    return <div className={cn("flex flex-col gap-3.5 text-slate-500", emptyClassName)}>No chart data available.</div>;
  }

  const width = 760;
  const height = 320;
  const chartTop = 20;
  const chartBottom = 42;
  const barRegionHeight = height - chartTop - chartBottom;
  const groupWidth = width / rows.length;
  const barWidth = Math.max(10, (groupWidth - 18) / bars.length);
  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) => bars.map((bar) => Number(row?.[bar.key] || 0)))
  );

  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      <div className={cn("flex flex-wrap gap-3", legendClassName)}>
        {bars.map((bar) => (
          <span className={cn("inline-flex items-center gap-2 text-sm text-slate-500", legendItemClassName)} key={bar.key}>
            <span
              className={cn("h-2.5 w-2.5 rounded-full", bar.swatchClassName, swatchClassName)}
            />
            {bar.label}
          </span>
        ))}
      </div>

      <svg
        className={cn("h-auto w-full overflow-visible", svgClassName)}
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

          return (
            <g key={`${row[labelKey]}-${rowIndex}`}>
              {bars.map((bar, barIndex) => {
                const rawValue = Number(row?.[bar.key] || 0);
                const barHeight = (rawValue / maxValue) * barRegionHeight;
                const x = baseX + barIndex * (barWidth + 6);
                const y = height - chartBottom - barHeight;

                return (
                  <rect
                    key={bar.key}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="8"
                    opacity="0.92"
                    className={bar.className}
                  />
                );
              })}

              <text
                x={baseX + ((barWidth + 6) * bars.length - 6) / 2}
                y={height - 16}
                textAnchor="middle"
                className={cn("fill-slate-500 text-[11px]", axisClassName)}
              >
                Y{row[labelKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
