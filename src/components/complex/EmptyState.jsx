import Button from "../base/Button.jsx";
import { cn } from "../../utils/cn.js";

export default function EmptyState({
  title,
  description,
  actionLabel,
  action,
  secondaryActionLabel,
  secondaryAction,
  className,
  children,
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center", className)}>
      {title ? <h3 className="text-xl font-semibold text-slate-900">{title}</h3> : null}
      {description ? <p className="max-w-xl text-sm leading-6 text-slate-500">{description}</p> : null}
      {actionLabel || secondaryActionLabel ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {secondaryActionLabel ? <Button label={secondaryActionLabel} variant="secondary" onClick={secondaryAction} /> : null}
          {actionLabel ? <Button label={actionLabel} onClick={action} /> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
