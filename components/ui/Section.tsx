import { ReactNode } from "react";

type SectionProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function Section({
  title,
  subtitle,
  action,
  children,
  className = "",
  contentClassName = "",
}: SectionProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2 className="text-2xl font-black tracking-tight text-white">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      <div className={contentClassName}>
        {children}
      </div>
    </section>
  );
}