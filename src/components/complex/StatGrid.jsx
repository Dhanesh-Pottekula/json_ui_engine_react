export default function StatGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {items.map((item, index) => (
        <article
          className="rounded-[18px] border border-slate-200/70 bg-white/80 p-4"
          key={`${item.label}-${index}`}
        >
          <span className="mb-1.5 block text-sm text-slate-500">{item.label}</span>
          <strong className="text-base font-extrabold tracking-[-0.03em] text-slate-900">{item.value}</strong>
        </article>
      ))}
    </div>
  );
}
