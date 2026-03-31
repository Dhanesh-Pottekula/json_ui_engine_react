export default function Container({
  children,
  variant,
  gap,
  align,
  justify,
  wrap,
  style,
}) {
  const variantClassName =
    variant === "page"
      ? "flex w-full flex-col"
      : variant === "split"
        ? "grid w-full grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(320px,1fr)_minmax(320px,1fr)]"
        : variant === "actions"
          ? "flex w-full flex-row flex-wrap"
          : "flex w-full flex-col";

  return (
    <div
      className={variantClassName}
      style={{
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
