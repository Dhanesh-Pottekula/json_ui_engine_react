import { cn } from "../../utils/cn.js";

export default function CardHeader({ children, className }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}
