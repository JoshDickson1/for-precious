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

/** A lily seen head-on: six slender tepals, freckled throat, six long stamens. */
const OUTER_TEPAL =
  "M0 0C-8-14-16-34-15-52C-14-69-7-78 0-84C7-78 14-69 15-52C16-34 8-14 0 0Z";
const INNER_TEPAL =
  "M0 0C-7-13-14-31-13-48C-12-63-6-72 0-78C6-72 12-63 13-48C14-31 7-13 0 0Z";

const OUTER_ANGLES = [0, 120, 240];
const INNER_ANGLES = [60, 180, 300];
const STAMEN_ANGLES = [15, 75, 135, 195, 255, 315];

const FRECKLES = [
  [-6, -24],
  [4, -30],
  [-3, -38],
  [6, -44],
];

export function Lily({
  className,
  size = 240,
  tone = "blush",
  animated = false,
  strokeWidth = 1.6,
}: {
  className?: string;
  size?: number;
  tone?: "blush" | "cream" | "line";
  animated?: boolean;
  /** Only used by the `line` tone. Thicker strokes hold up at small sizes. */
  strokeWidth?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const outerId = `lily-outer-${uid}`;
  const accentId = `lily-accent-${uid}`;
  const shadeId = `lily-shade-${uid}`;
  const innerId = `lily-inner-${uid}`;

  const line = tone === "line";

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
        <radialGradient id={outerId} cx="50%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#FFB4DE" />
          <stop offset="55%" stopColor="#FF3FA2" />
          <stop offset="100%" stopColor="#96004F" />
        </radialGradient>
        <radialGradient id={accentId} cx="50%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#FFF0C4" />
          <stop offset="70%" stopColor="#FFC857" />
          <stop offset="100%" stopColor="#B5790E" />
        </radialGradient>
        <radialGradient id={innerId} cx="50%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#FFD9EF" />
          <stop offset="62%" stopColor="#FF6FC4" />
          <stop offset="100%" stopColor="#C40066" />
        </radialGradient>
        <radialGradient id={shadeId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF2E9A" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#FF2E9A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {line ? null : <circle cx="0" cy="0" r="46" fill={`url(#${shadeId})`} />}

      {/* inner tepals sit behind the outer three */}
      {INNER_ANGLES.map((angle) => (
        <path
          key={`inner-${angle}`}
          d={INNER_TEPAL}
          fill={palette.inner}
          stroke={palette.stroke}
          strokeWidth={line ? strokeWidth : 0.9}
          strokeOpacity={line ? 0.7 : 0.5}
          strokeLinejoin="round"
          transform={`rotate(${angle})`}
        />
      ))}

      {OUTER_ANGLES.map((angle) => (
        <g key={`outer-${angle}`} transform={`rotate(${angle})`}>
          <path
            d={OUTER_TEPAL}
            fill={palette.outer}
            stroke={palette.stroke}
            strokeWidth={line ? strokeWidth : 1.1}
            strokeOpacity={line ? 0.85 : 0.55}
            strokeLinejoin="round"
          />
          <path
            d="M0 -6L0 -70"
            stroke={line ? "currentColor" : "#8E0046"}
            strokeWidth={line ? strokeWidth * 0.55 : 1}
            strokeOpacity={line ? 0.45 : 0.28}
            strokeLinecap="round"
          />
          {line
            ? null
            : FRECKLES.map(([x, y], index) => (
                <ellipse
                  key={`freckle-${angle}-${index}`}
                  cx={x}
                  cy={y}
                  rx="1.9"
                  ry="1.3"
                  fill="#7A0040"
                  opacity="0.38"
                />
              ))}
        </g>
      ))}

      {STAMEN_ANGLES.map((angle, index) => (
        <g key={`stamen-${angle}`} transform={`rotate(${angle})`}>
          <path
            d={`M0 0C1.6 -12 2.4 -22 0 -${index % 2 === 0 ? 36 : 32}`}
            stroke={line ? "currentColor" : "#FFC857"}
            strokeWidth={line ? strokeWidth * 0.8 : 1.3}
            strokeOpacity={line ? 0.6 : 0.9}
            strokeLinecap="round"
          />
          <ellipse
            cx="0"
            cy={index % 2 === 0 ? -38 : -34}
            rx="4.2"
            ry="2.3"
            fill={line ? "none" : "#F2B23F"}
            stroke={line ? "currentColor" : "none"}
            strokeWidth={line ? strokeWidth * 0.8 : 0}
            strokeOpacity={line ? 0.6 : 0}
            opacity={line ? 1 : 0.92}
          />
        </g>
      ))}

      {line ? null : <circle cx="0" cy="0" r="4" fill="#FFC857" opacity="0.95" />}
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
