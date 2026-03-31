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
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="font-semibold tracking-[-0.01em] text-slate-800">{label}</span>
      <span className="relative">
        {prefix ? <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span> : null}
        <input
          className={`w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 ${prefix ? "pl-8" : ""}`}
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange?.(Number(event.target.value))}
        />
      </span>
      {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
      {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}
