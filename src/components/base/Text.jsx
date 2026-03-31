export default function Text({ as = "p", content, tone, align, children }) {
  const Component = as;
  const toneClassName =
    tone === "eyebrow"
      ? "inline-flex w-fit rounded-full bg-white/15 px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-inherit"
      : tone === "display"
        ? "font-serif text-5xl leading-none tracking-[-0.06em] md:text-7xl"
        : tone === "lead"
          ? "max-w-3xl text-base text-white/85 md:text-[1.04rem]"
          : tone === "metric"
            ? "font-serif text-4xl leading-none tracking-[-0.05em] md:text-5xl"
            : tone === "caption"
              ? "text-sm text-slate-500"
              : tone === "note"
                ? "rounded-2xl bg-orange-100 px-4 py-3 text-sm font-medium text-orange-800"
                : tone === "success"
                  ? "rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800"
                  : "";

  return (
    <Component className={toneClassName} style={{ textAlign: align }}>
      {content}
      {children}
    </Component>
  );
}
