import { cn } from "../../utils/cn.js";

export default function TableCell({ content, className, children }) {
  return (
    <td className={cn("p-4 align-middle", className)}>
      {content}
      {children}
    </td>
  );
}
