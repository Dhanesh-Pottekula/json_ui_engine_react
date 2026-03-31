import { cn } from "../../utils/cn.js";

export default function Container({
  children,
  variant,
  gap,
  align,
  justify,
  wrap,
  className,
}) {
  const gapClassName =
    gap === "24px" ? "gap-6" : gap === "20px" ? "gap-5" : gap === "12px" ? "gap-3" : "";
  const alignClassName =
    align === "center"
      ? "items-center"
      : align === "end"
        ? "items-end"
        : align === "stretch"
          ? "items-stretch"
          : align === "baseline"
            ? "items-baseline"
            : "";
  const justifyClassName =
    justify === "between"
      ? "justify-between"
      : justify === "center"
        ? "justify-center"
        : justify === "end"
          ? "justify-end"
          : justify === "around"
            ? "justify-around"
            : justify === "evenly"
              ? "justify-evenly"
              : "";
  const variantClassName =
    variant === "page"
      ? "flex w-full flex-col"
      : variant === "split"
        ? "grid w-full grid-cols-1 items-start xl:grid-cols-[minmax(320px,1fr)_minmax(320px,1fr)]"
        : variant === "actions"
          ? "flex w-full flex-row"
          : "flex w-full flex-col";

  return (
    <div
      className={cn(
        variantClassName,
        gapClassName,
        alignClassName,
        justifyClassName,
        wrap ? "flex-wrap" : "",
        className
      )}
    >
      {children}
    </div>
  );
}
