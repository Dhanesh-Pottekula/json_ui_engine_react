import { cn } from "../../utils/cn.js";

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
  hint,
  error,
  disabled,
  className,
}) {
  return (
    <label className={cn("flex flex-col gap-2.5", className)}>
      {label ? <span className="font-semibold tracking-[-0.01em] text-slate-800">{label}</span> : null}
      <input
        className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
      {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}
