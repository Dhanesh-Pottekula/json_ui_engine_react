import { cn } from "../../utils/cn.js";

function normalizeCell(cell) {
  if (cell && typeof cell === "object" && !Array.isArray(cell)) {
    return {
      content: cell.content ?? "",
      className: cell.className || "",
    };
  }

  return {
    content: cell ?? "",
    className: "",
  };
}

export default function DataTable({ columns = [], rows = [], className }) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>
        <thead className="[&_tr]:border-b">
          <tr className="border-slate-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn("h-12 px-4 text-left align-middle font-medium text-slate-500", column.headerClassName)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id || row.key || rowIndex}
              className={cn("border-b border-slate-200 transition-colors hover:bg-slate-50/80", row.className)}
            >
              {columns.map((column) => {
                const cell = normalizeCell(row[column.key]);
                return (
                  <td key={column.key} className={cn("p-4 align-middle", column.cellClassName, cell.className)}>
                    {cell.content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
