import { cn } from "../../utils/cn.js";

export default function TableHead({ content, className, children }) {
  return (
    <th className={cn("h-12 px-4 text-left align-middle font-medium text-slate-500", className)}>
      {content}
      {children}
    </th>
  );
}
