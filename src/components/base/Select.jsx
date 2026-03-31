function normalizeOptions(options = []) {
  return options.map((option) =>
    typeof option === "object" && option !== null
      ? option
      : {
          label: String(option),
          value: option,
        }
  );
}

export default function Select({ label, value, onChange, options, hint, error }) {
  const normalizedOptions = normalizeOptions(options);

  return (
    <label className="flex flex-col gap-2.5">
      <span className="font-semibold tracking-[-0.01em] text-slate-800">{label}</span>
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        value={value}
        onChange={(event) => {
          const selected = normalizedOptions.find((option) => String(option.value) === event.target.value);
          onChange?.(selected ? selected.value : event.target.value);
        }}
      >
        {normalizedOptions.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
      {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}
