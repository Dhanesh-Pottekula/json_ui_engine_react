import { cn } from "../../utils/cn.js";

export default function TableBody({ children, className }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)}>{children}</tbody>;
}
