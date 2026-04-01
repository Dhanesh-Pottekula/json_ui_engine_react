import { cn } from "../../utils/cn.js";

export default function AlertDescription({ content, className, children }) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)}>
      {content}
      {children}
    </div>
  );
}
