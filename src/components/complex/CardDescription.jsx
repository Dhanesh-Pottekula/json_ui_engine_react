import { cn } from "../../utils/cn.js";

export default function CardDescription({ content, className, children }) {
  return (
    <p className={cn("text-sm text-slate-500", className)}>
      {content}
      {children}
    </p>
  );
}
