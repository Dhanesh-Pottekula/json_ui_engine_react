import { cn } from "../../utils/cn.js";
import StatCard from "./StatCard.jsx";

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

export default function MetricGrid({
  items = [],
  cols = 1,
  sm,
  md = 2,
  lg,
  gap = "md",
  className,
}) {
  return (
    <div
      className={cn(
        "grid",
        getColumnClass("", cols),
        getColumnClass("sm", sm),
        getColumnClass("md", md),
        getColumnClass("lg", lg),
        gapClassNames[gap] || gap,
        className
      )}
    >
      {items.map((item, index) => (
        <StatCard
          key={item.id || item.key || item.label || index}
          label={item.label}
          value={item.value}
          description={item.description}
          className={item.className}
        />
      ))}
    </div>
  );
}
