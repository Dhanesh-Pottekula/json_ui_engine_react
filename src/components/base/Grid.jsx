import { cn } from "../../utils/cn.js";

const gapClassNames = {
  none: "gap-0",
  xs: "gap-1.5",
  sm: "gap-3",
  md: "gap-5",
  lg: "gap-8",
  xl: "gap-12",
};

const columnClassNames = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

function getColumnClass(prefix, value) {
  if (!value) {
    return "";
  }

  const baseClassName = columnClassNames[value];

  if (!baseClassName) {
    return String(value);
  }

  return prefix ? `${prefix}:${baseClassName}` : baseClassName;
}

export default function Grid({
  cols = 1,
  sm,
  md,
  lg,
  xl,
  gap = "md",
  className,
  content,
  children,
}) {
  return (
    <div
      className={cn(
        "grid",
        getColumnClass("", cols),
        getColumnClass("sm", sm),
        getColumnClass("md", md),
        getColumnClass("lg", lg),
        getColumnClass("xl", xl),
        gapClassNames[gap] || gap,
        className
      )}
    >
      {content}
      {children}
    </div>
  );
}
