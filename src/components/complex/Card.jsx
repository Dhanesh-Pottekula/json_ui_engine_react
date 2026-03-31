import { cn } from "../../utils/cn.js";

export default function Card({
  title,
  subtitle,
  tone,
  children,
  className,
  headerClassName,
  titleClassName,
  subtitleClassName,
  bodyClassName,
  decorClassName,
}) {
  const hero = tone === "hero";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[26px] border p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl",
        hero
          ? "border-white/10 bg-gradient-to-br from-teal-700 via-teal-800 to-sky-950 text-slate-50"
          : "border-slate-200/70 bg-white/70 text-slate-900",
        className
      )}
    >
      {hero ? (
        <div className={cn("pointer-events-none absolute -bottom-28 -right-12 h-64 w-64 rounded-full bg-white/10", decorClassName)} />
      ) : null}
      {title || subtitle ? (
        <header className={cn("relative flex flex-col gap-1.5", headerClassName)}>
          {title ? <h2 className={cn("m-0 text-lg font-bold tracking-[-0.02em]", titleClassName)}>{title}</h2> : null}
          {subtitle ? (
            <p className={cn("m-0 max-w-3xl", hero ? "text-slate-100/75" : "text-slate-500", subtitleClassName)}>{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      <div className={cn("relative flex flex-col gap-[18px]", bodyClassName)}>{children}</div>
    </section>
  );
}
