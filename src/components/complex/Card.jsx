export default function Card({ title, subtitle, tone, children }) {
  const hero = tone === "hero";

  return (
    <section
      className={`relative overflow-hidden rounded-[26px] border p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl ${
        hero
          ? "border-white/10 bg-gradient-to-br from-teal-700 via-teal-800 to-sky-950 text-slate-50"
          : "border-slate-200/70 bg-white/70 text-slate-900"
      }`}
    >
      {hero ? (
        <div className="pointer-events-none absolute -bottom-28 -right-12 h-64 w-64 rounded-full bg-white/10" />
      ) : null}
      {title || subtitle ? (
        <header className="relative flex flex-col gap-1.5">
          {title ? <h2 className="m-0 text-lg font-bold tracking-[-0.02em]">{title}</h2> : null}
          {subtitle ? (
            <p className={`m-0 max-w-3xl ${hero ? "text-slate-100/75" : "text-slate-500"}`}>{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      <div className="relative flex flex-col gap-[18px]">{children}</div>
    </section>
  );
}
