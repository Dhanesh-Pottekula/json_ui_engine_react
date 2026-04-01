import { cn } from "../../utils/cn.js";

const gapClassNames = {
  none: "gap-0",
  xs: "gap-1.5",
  sm: "gap-3",
  md: "gap-5",
  lg: "gap-8",
  xl: "gap-12",
};

const alignClassNames = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClassNames = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export default function Stack({
  gap = "md",
  align = "stretch",
  justify = "start",
  className,
  content,
  children,
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gapClassNames[gap] || gap,
        alignClassNames[align] || align,
        justifyClassNames[justify] || justify,
        className
      )}
    >
      {content}
      {children}
    </div>
  );
}
