import type { HTMLAttributes, ReactNode } from "react";

type CardVariant =
  | "default"
  | "purple"
  | "gold"
  | "success"
  | "danger";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: CardVariant;
  interactive?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "border-white/[0.08] bg-[#12141c]/90",

  purple:
    "border-purple-400/20 bg-gradient-to-br from-purple-500/[0.12] via-[#12141c]/95 to-[#12141c]/95",

  gold:
    "border-amber-300/20 bg-gradient-to-br from-amber-400/[0.11] via-[#12141c]/95 to-[#12141c]/95",

  success:
    "border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.10] via-[#12141c]/95 to-[#12141c]/95",

  danger:
    "border-red-400/20 bg-gradient-to-br from-red-500/[0.10] via-[#12141c]/95 to-[#12141c]/95",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function Card({
  children,
  variant = "default",
  interactive = false,
  glow = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <article
      className={[
        "relative overflow-hidden rounded-[26px] border backdrop-blur-xl",
        "shadow-[0_18px_50px_rgba(0,0,0,0.22)]",
        "transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        interactive
          ? "hover:-translate-y-1 hover:border-purple-300/30 hover:shadow-[0_24px_70px_rgba(88,28,135,0.22)]"
          : "",
        glow
          ? "before:pointer-events-none before:absolute before:-right-16 before:-top-16 before:h-40 before:w-40 before:rounded-full before:bg-purple-500/10 before:blur-3xl"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </article>
  );
}

type CardHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function CardHeader({
  title,
  description,
  icon,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <header
      className={`flex items-start justify-between gap-4 ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] text-purple-300">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-base font-black text-white sm:text-lg">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-sm leading-6 text-white/40">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

type CardContentProps = {
  children: ReactNode;
  className?: string;
};

export function CardContent({
  children,
  className = "",
}: CardContentProps) {
  return (
    <div className={`mt-5 ${className}`}>
      {children}
    </div>
  );
}

type CardFooterProps = {
  children: ReactNode;
  className?: string;
};

export function CardFooter({
  children,
  className = "",
}: CardFooterProps) {
  return (
    <footer
      className={`mt-6 border-t border-white/[0.07] pt-5 ${className}`}
    >
      {children}
    </footer>
  );
}