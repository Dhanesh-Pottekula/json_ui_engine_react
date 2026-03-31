import { cn } from "../../utils/cn.js";

export default function StatGrid({
  items = [],
  className,
  gridClassName,
  itemClassName,
  labelClassName,
  valueClassName,
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2", className, gridClassName)}>
      {items.map((item, index) => (
        <article
          className={cn("rounded-[18px] border border-slate-200/70 bg-white/80 p-4", itemClassName)}
          key={`${item.label}-${index}`}
        >
          <span className={cn("mb-1.5 block text-sm text-slate-500", labelClassName)}>{item.label}</span>
          <strong className={cn("text-base font-extrabold tracking-[-0.03em] text-slate-900", valueClassName)}>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}
