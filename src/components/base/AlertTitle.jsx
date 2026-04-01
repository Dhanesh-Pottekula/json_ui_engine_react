import { cn } from "../../utils/cn.js";

export default function AlertTitle({ content, className, children }) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)}>
      {content}
      {children}
    </h5>
  );
}
