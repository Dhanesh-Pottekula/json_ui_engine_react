import { cn } from "../../utils/cn.js";

export default function StatCard({ label, value, description, className }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)}>
      <div className="space-y-2 p-5">
        {label ? <div className="text-sm text-slate-500">{label}</div> : null}
        {value ? <div className="text-2xl font-semibold text-inherit">{value}</div> : null}
        {description ? <div className="text-sm leading-6 text-slate-400">{description}</div> : null}
      </div>
    </section>
  );
}
