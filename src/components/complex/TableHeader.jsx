import { cn } from "../../utils/cn.js";

export default function TableHeader({ children, className }) {
  return <thead className={cn("[&_tr]:border-b", className)}>{children}</thead>;
}
