import { cn } from "../../utils/cn.js";

export default function CardFooter({ children, className }) {
  return <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>;
}
