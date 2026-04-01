import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "../../utils/cn.js";

const AccordionContext = createContext(null);
const AccordionItemContext = createContext(null);

function useAccordionContext(name) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`${name} must be used inside Accordion.`);
  }
  return context;
}

function useAccordionItemContext(name) {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`${name} must be used inside AccordionItem.`);
  }
  return context;
}

function normalizeValue(value, type) {
  if (type === "multiple") {
    return Array.isArray(value) ? value : value ? [value] : [];
  }
  return typeof value === "string" ? value : "";
}

export default function Accordion({
  type = "single",
  value,
  defaultValue,
  onChange,
  className,
  children,
}) {
  const [internalValue, setInternalValue] = useState(normalizeValue(defaultValue, type));
  const activeValue = value ?? internalValue;

  const contextValue = useMemo(
    () => ({
      type,
      value: normalizeValue(activeValue, type),
      onToggle: (itemValue) => {
        let nextValue;

        if (type === "multiple") {
          const current = normalizeValue(activeValue, type);
          nextValue = current.includes(itemValue)
            ? current.filter((entry) => entry !== itemValue)
            : [...current, itemValue];
        } else {
          nextValue = activeValue === itemValue ? "" : itemValue;
        }

        if (value == null) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue);
      },
    }),
    [activeValue, onChange, type, value]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn("flex flex-col divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className, children }) {
  const accordion = useAccordionContext("AccordionItem");
  const open =
    accordion.type === "multiple"
      ? accordion.value.includes(value)
      : accordion.value === value;

  return (
    <AccordionItemContext.Provider value={{ value, open }}>
      <div className={cn("px-5 py-1", className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({ className, children, content }) {
  const accordion = useAccordionContext("AccordionTrigger");
  const item = useAccordionItemContext("AccordionTrigger");

  return (
    <button
      type="button"
      onClick={() => accordion.onToggle(item.value)}
      className={cn("flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-slate-900", className)}
    >
      <span>{content}{children}</span>
      <span className={cn("text-slate-400 transition-transform", item.open ? "rotate-45" : "")}>+</span>
    </button>
  );
}

export function AccordionContent({ className, children }) {
  const item = useAccordionItemContext("AccordionContent");
  if (!item.open) {
    return null;
  }

  return <div className={cn("pb-4 text-sm leading-6 text-slate-500", className)}>{children}</div>;
}
