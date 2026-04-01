import { cn } from "../../utils/cn.js";

export default function Badge({ label, variant = "default", className, children }) {
  const variantClassName =
    variant === "secondary"
      ? "border-slate-200 bg-slate-100 text-slate-700"
      : variant === "outline"
        ? "border-slate-300 bg-transparent text-slate-700"
        : variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-teal-200 bg-teal-50 text-teal-700";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.02em]",
        variantClassName,
        className
      )}
    >
      {label}
      {children}
    </span>
  );
}
