import { cn } from "../../utils/cn.js";

export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "",
  hint,
  error,
  className,
  headerClassName,
  labelClassName,
  valueClassName,
  inputClassName,
  hintClassName,
  errorClassName,
}) {
  return (
    <label className={cn("flex flex-col gap-2.5", className)}>
      <span className={cn("flex items-baseline justify-between gap-3", headerClassName)}>
        <span className={cn("font-semibold tracking-[-0.01em] text-slate-800", labelClassName)}>{label}</span>
        <span className={cn("font-bold text-teal-700", valueClassName)}>
          {value}
          {suffix}
        </span>
      </span>
      <input
        className={cn("h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-700", inputClassName)}
        type="range"
        value={value ?? 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
      {hint ? <span className={cn("text-sm text-slate-500", hintClassName)}>{hint}</span> : null}
      {error ? <span className={cn("text-sm font-semibold text-red-700", errorClassName)}>{error}</span> : null}
    </label>
  );
}
