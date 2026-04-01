import { cn } from "../../utils/cn.js";

const sizeClassNames = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-lg",
  xl: "h-20 w-20 text-xl",
};

function buildFallback(label = "", fallback = "") {
  if (fallback) {
    return fallback;
  }

  const parts = String(label)
    .trim()
    .split(/\s+/)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "?";
}

export default function Avatar({
  src,
  alt = "",
  label = "",
  fallback = "",
  size = "md",
  className,
}) {
  const sizeClassName = sizeClassNames[size] || size;

  return src ? (
    <img
      src={src}
      alt={alt || label}
      className={cn("rounded-full object-cover ring-1 ring-slate-200", sizeClassName, className)}
    />
  ) : (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 ring-1 ring-slate-200",
        sizeClassName,
        className
      )}
      aria-label={alt || label}
    >
      {buildFallback(label, fallback)}
    </div>
  );
}
