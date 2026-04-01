import { cn } from "../../utils/cn.js";

export default function Alert({ children, className }) {
  return (
    <div
      role="alert"
      className={cn("relative w-full rounded-lg border border-slate-200 bg-white p-4 text-slate-950", className)}
    >
      {children}
    </div>
  );
}
