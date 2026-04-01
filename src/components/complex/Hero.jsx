import Badge from "../base/Badge.jsx";
import Button from "../base/Button.jsx";
import { cn } from "../../utils/cn.js";

const alignClassNames = {
  left: "items-start text-left",
  center: "items-center text-center",
};

export default function Hero({
  badge,
  badgeVariant = "default",
  title,
  description,
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
  primaryActionDisabled,
  secondaryActionDisabled,
  align = "left",
  className,
  children,
}) {
  const hasActions = primaryActionLabel || secondaryActionLabel;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm",
        className
      )}
    >
      <div className={cn("flex flex-col gap-5 p-6 sm:p-8", alignClassNames[align] || align)}>
        {badge ? <Badge label={badge} variant={badgeVariant} /> : null}
        {title ? <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1> : null}
        {description ? <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}

        {hasActions ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {secondaryActionLabel ? (
              <Button
                label={secondaryActionLabel}
                variant="secondary"
                onClick={secondaryAction}
                disabled={secondaryActionDisabled}
              />
            ) : null}
            {primaryActionLabel ? (
              <Button
                label={primaryActionLabel}
                variant="primary"
                onClick={primaryAction}
                disabled={primaryActionDisabled}
              />
            ) : null}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}
