import { cn } from "../../utils/cn.js";

export default function Table({ children, className }) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>{children}</table>
    </div>
  );
}
