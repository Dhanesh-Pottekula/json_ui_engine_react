import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "../../utils/cn.js";

const TabsContext = createContext(null);

function useTabsContext(name) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${name} must be used inside Tabs.`);
  }
  return context;
}

export default function Tabs({ value, defaultValue, onChange, className, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const activeValue = value ?? internalValue;

  const contextValue = useMemo(
    () => ({
      value: activeValue,
      onChange: (nextValue) => {
        if (value == null) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue);
      },
    }),
    [activeValue, onChange, value]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return <div className={cn("inline-flex w-fit items-center rounded-xl bg-slate-100 p-1", className)}>{children}</div>;
}

export function TabsTrigger({ value, className, children, content }) {
  const tabs = useTabsContext("TabsTrigger");
  const active = tabs.value === value;

  return (
    <button
      type="button"
      onClick={() => tabs.onChange(value)}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
        className
      )}
    >
      {content}
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const tabs = useTabsContext("TabsContent");
  if (tabs.value !== value) {
    return null;
  }

  return <div className={cn("outline-none", className)}>{children}</div>;
}
