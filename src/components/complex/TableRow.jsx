import { cn } from "../../utils/cn.js";

export default function TableRow({ children, className }) {
  return (
    <tr className={cn("border-b border-slate-200 transition-colors hover:bg-slate-50/80", className)}>
      {children}
    </tr>
  );
}
