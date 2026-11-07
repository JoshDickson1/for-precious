import { useId } from "react";
import { cn } from "@/lib/utils";

export function LilyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("h-6 w-6", className)}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 15c-2.2-3.2-2.2-7.4 0-10.6 2.2 3.2 2.2 7.4 0 10.6Z" />
        <path d="M16 15c3.2-2.1 7-1.6 9.6 1.1-2.7 2.7-6.4 2.7-9.6-1.1Z" />
        <path d="M16 15c-3.2-2.1-7-1.6-9.6 1.1 2.7 2.7 6.4 2.7 9.6-1.1Z" />
        <path d="M16 15c2.7 2.7 3.7 6.4 1.6 10.6-2.7-2.1-3.7-6.4-1.6-10.6Z" />
        <path d="M16 15c-2.7 2.7-3.7 6.4-1.6 10.6 2.7-2.1 3.7-6.4 1.6-10.6Z" />
      </g>
    </svg>
  );
}

export function Lily({
  className,
  size = 240,
  tone = "blush",
  animated = false,
}: {
  className?: string;
  size?: number;
  tone?: "blush" | "cream" | "line";
  animated?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const outerId = `lily-outer-${uid}`;
  const accentId = `lily-accent-${uid}`;
  const shadeId = `lily-shade-${uid}`;
  const innerId = `lily-inner-${uid}`;

  const fills: Record<string, { outer: string; inner: string; stroke: string }> = {
    blush: { outer: `url(#${outerId})`, inner: `url(#${innerId})`, stroke: "#FF6FC4" },
    cream: { outer: `url(#${accentId})`, inner: "#2A1A08", stroke: "#FFC857" },
    line: { outer: "none", inner: "none", stroke: "currentColor" },
  };
  const palette = fills[tone];

  return (
    <svg
      viewBox="-100 -100 200 200"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={cn("overflow-visible", animated && "animate-breathe", className)}
    >
      <defs>
        <radialGradient id={outerId} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FF9BD5" />
          <stop offset="62%" stopColor="#FF2E9A" />
          <stop offset="100%" stopColor="#A1005A" />
        </radialGradient>
        <radialGradient id={accentId} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFE9AE" />
          <stop offset="70%" stopColor="#FFC857" />
          <stop offset="100%" stopColor="#B5790E" />
        </radialGradient>
        <radialGradient id={innerId} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFD1EC" />
          <stop offset="68%" stopColor="#FF6FC4" />
          <stop offset="100%" stopColor="#E00074" />
        </radialGradient>
        <radialGradient id={shadeId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF2E9A" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FF2E9A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="0" cy="0" r="46" fill={`url(#${shadeId})`} />

      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <path
          key={`outer-${angle}`}
          d="M0 0C-17-20-15-52 0-72C15-52 17-20 0 0Z"
          fill={palette.outer}
          stroke={palette.stroke}
          strokeWidth="1.1"
          strokeOpacity="0.55"
          transform={`rotate(${angle})`}
        />
      ))}

      {[30, 90, 150, 210, 270, 330].map((angle) => (
        <path
          key={`inner-${angle}`}
          d="M0 0C-10-14-9-36 0-50C9-36 10-14 0 0Z"
          fill={palette.inner}
          stroke={palette.stroke}
          strokeWidth="0.9"
          strokeOpacity="0.45"
          transform={`rotate(${angle})`}
        />
      ))}

      {[15, 90, 165, 255, 315].map((angle, index) => (
        <g key={`stamen-${angle}`} transform={`rotate(${angle})`}>
          <path d="M0 0L0 -30" stroke="#FFC857" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.85" />
          <ellipse cx="0" cy="-33" rx="3.4" ry="2" fill="#FFC857" opacity={0.8 - index * 0.06} />
        </g>
      ))}

      <circle cx="0" cy="0" r="4.2" fill="#FFC857" opacity="0.9" />
    </svg>
  );
}

export function LilyDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-line sm:w-24" />
      <LilyMark className="h-4 w-4 text-rose-soft" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-line sm:w-24" />
    </div>
  );
}
