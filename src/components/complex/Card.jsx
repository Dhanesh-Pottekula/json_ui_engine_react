import { cn } from "../../utils/cn.js";

export default function Card({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}
