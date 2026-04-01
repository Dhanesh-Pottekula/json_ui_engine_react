import { cn } from "../../utils/cn.js";

export default function Label({ content, htmlFor, className, children }) {
  return (
    <label className={cn("text-sm font-medium leading-none", className)} htmlFor={htmlFor}>
      {content}
      {children}
    </label>
  );
}
