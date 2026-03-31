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
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-semibold tracking-[-0.01em] text-slate-800">{label}</span>
        <span className="font-bold text-teal-700">
          {value}
          {suffix}
        </span>
      </span>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-700"
        type="range"
        value={value ?? 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
      {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
      {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}
