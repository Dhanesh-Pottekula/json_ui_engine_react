import { cn } from "../../utils/cn.js";

export default function Switch({
  label,
  checked = false,
  onCheckedChange,
  hint,
  disabled,
  className,
}) {
  return (
    <label className={cn("flex items-center justify-between gap-4", disabled ? "opacity-60" : "", className)}>
      <span className="flex flex-col gap-1">
        {label ? <span className="text-sm font-medium text-slate-800">{label}</span> : null}
        {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
      </span>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={Boolean(checked)}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 items-center rounded-full border transition",
          checked ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-slate-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}
