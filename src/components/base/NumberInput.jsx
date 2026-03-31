import { cn } from "../../utils/cn.js";

export default function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  hint,
  error,
  className,
  labelClassName,
  inputWrapClassName,
  prefixClassName,
  inputClassName,
  hintClassName,
  errorClassName,
}) {
  return (
    <label className={cn("flex flex-col gap-2.5", className)}>
      <span className={cn("font-semibold tracking-[-0.01em] text-slate-800", labelClassName)}>{label}</span>
      <span className={cn("relative", inputWrapClassName)}>
        {prefix ? (
          <span className={cn("pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", prefixClassName)}>
            {prefix}
          </span>
        ) : null}
        <input
          className={cn(
            "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
            prefix ? "pl-8" : "",
            inputClassName
          )}
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange?.(Number(event.target.value))}
        />
      </span>
      {hint ? <span className={cn("text-sm text-slate-500", hintClassName)}>{hint}</span> : null}
      {error ? <span className={cn("text-sm font-semibold text-red-700", errorClassName)}>{error}</span> : null}
    </label>
  );
}
