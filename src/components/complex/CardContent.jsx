import { cn } from "../../utils/cn.js";

export default function CardContent({ children, className }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
