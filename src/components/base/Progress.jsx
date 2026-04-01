import { cn } from "../../utils/cn.js";

export default function Progress({
  value = 0,
  max = 100,
  label,
  hint,
  showValue = true,
  className,
}) {
  const safeMax = Math.max(1, Number(max) || 100);
  const safeValue = Math.max(0, Math.min(Number(value) || 0, safeMax));
  const percent = (safeValue / safeMax) * 100;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-3">
          {label ? <span className="text-sm font-medium text-slate-800">{label}</span> : <span />}
          {showValue ? <span className="text-sm text-slate-500">{Math.round(percent)}%</span> : null}
        </div>
      ) : null}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-950 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      {hint ? <div className="text-sm text-slate-500">{hint}</div> : null}
    </div>
  );
}
