"use client";

import Image from "next/image";

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy";
  rounded?: boolean;
  className?: string;
};

const sizes = {
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const statusColors = {
  online: "bg-emerald-500",
  offline: "bg-gray-500",
  busy: "bg-red-500",
};

export default function Avatar({
  name,
  src,
  size = "md",
  status,
  rounded = true,
  className = "",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          relative
          overflow-hidden
          ${sizes[size]}
          ${rounded ? "rounded-full" : "rounded-2xl"}
          border
          border-white/10
          bg-gradient-to-br
          from-purple-600
          to-violet-900
          shadow-[0_0_25px_rgba(147,51,234,.18)]
          flex
          items-center
          justify-center
          font-black
          text-white
          select-none
        `}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {status && (
        <span
          className={`
            absolute
            bottom-0
            right-0
            h-3.5
            w-3.5
            rounded-full
            border-2
            border-[#11131a]
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
}