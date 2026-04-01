import { cn } from "../../utils/cn.js";

export default function Separator({ orientation = "horizontal", className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        orientation === "vertical" ? "h-full min-h-6 w-px self-stretch" : "h-px w-full",
        "bg-slate-200/80",
        className
      )}
    />
  );
}
