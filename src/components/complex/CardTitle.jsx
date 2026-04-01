import { cn } from "../../utils/cn.js";

export default function CardTitle({ content, className, children }) {
  return (
    <h3 className={cn("font-semibold leading-none tracking-tight", className)}>
      {content}
      {children}
    </h3>
  );
}
