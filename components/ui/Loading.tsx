"use client";

type LoadingProps = {
  text?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: {
    spinner: "h-5 w-5 border-2",
    text: "text-sm",
  },
  md: {
    spinner: "h-9 w-9 border-[3px]",
    text: "text-base",
  },
  lg: {
    spinner: "h-14 w-14 border-4",
    text: "text-lg",
  },
};

export default function Loading({
  text = "טוען נתונים...",
  fullScreen = false,
  size = "md",
  className = "",
}: LoadingProps) {
  const selectedSize = sizes[size];

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <div className="relative">
        <div
          className={`
            ${selectedSize.spinner}
            animate-spin
            rounded-full
            border-purple-500/20
            border-t-purple-400
            shadow-[0_0_30px_rgba(168,85,247,0.25)]
          `}
        />

        <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/10 blur-xl" />
      </div>

      {text && (
        <p
          className={`${selectedSize.text} font-bold text-white/50`}
        >
          {text}
        </p>
      )}

      <span className="sr-only">{text || "טוען"}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080910]/90 backdrop-blur-md"
      >
        <div className="relative overflow-hidden rounded-[30px] border border-purple-400/15 bg-[#11131a]/95 px-12 py-10 shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/15 blur-3xl" />

          <div className="relative z-10">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-white/[0.07] bg-[#11131a]/70"
    >
      {content}
    </div>
  );
}