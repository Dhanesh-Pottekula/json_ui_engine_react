import { cn } from "../../utils/cn.js";

export default function SectionCard({ badge, title, description, className, children }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)}>
      {badge || title || description ? (
        <div className="flex flex-col gap-1.5 p-6">
          {badge ? <div>{badge}</div> : null}
          {title ? <h2 className="font-semibold leading-none tracking-tight">{title}</h2> : null}
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
      ) : null}
      <div className={cn("p-6", badge || title || description ? "pt-0" : "")}>{children}</div>
    </section>
  );
}
