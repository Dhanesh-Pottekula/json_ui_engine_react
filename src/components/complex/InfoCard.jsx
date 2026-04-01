import { cn } from "../../utils/cn.js";

export default function InfoCard({ title, description, className }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)}>
      <div className="space-y-3 p-6">
        {title ? <h3 className="text-lg font-semibold text-inherit">{title}</h3> : null}
        {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
    </section>
  );
}
