export default function Button({ label, onClick, variant = "primary", disabled }) {
  const variantClassName =
    variant === "secondary"
      ? "border border-slate-200 bg-white/90 text-slate-800 hover:-translate-y-0.5"
      : "bg-gradient-to-br from-teal-700 to-cyan-900 text-white shadow-[0_14px_28px_rgba(15,118,110,0.24)] hover:-translate-y-0.5";

  return (
    <button
      className={`rounded-2xl px-4 py-3 font-semibold tracking-[-0.01em] transition disabled:cursor-wait disabled:opacity-55 ${variantClassName}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
