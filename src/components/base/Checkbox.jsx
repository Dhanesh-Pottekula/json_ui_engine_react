import { cn } from "../../utils/cn.js";

export default function Checkbox({
  label,
  checked = false,
  onCheckedChange,
  hint,
  disabled,
  className,
}) {
  return (
    <label className={cn("flex items-start gap-3", disabled ? "opacity-60" : "", className)}>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-slate-950 accent-slate-950"
      />
      <span className="flex flex-col gap-1">
        {label ? <span className="text-sm font-medium text-slate-800">{label}</span> : null}
        {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
      </span>
    </label>
  );
}
