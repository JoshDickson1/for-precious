import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const INFINITY_PATH =
  "M14 50C14 30 38 30 50 50C62 70 86 70 86 50C86 30 62 30 50 50C38 70 14 70 14 50Z";

export interface InfinitySpinnerProps
  extends React.ComponentPropsWithoutRef<"span"> {
  /** Width/height in px */
  size?: number;
  /** Screen-reader label */
  label?: string;
  /** Soft pink glow around the stroke (no box, scales with size) */
  glow?: boolean;
  /** Seconds per loop */
  duration?: number;
}

export const InfinitySpinner = forwardRef<HTMLSpanElement, InfinitySpinnerProps>(
  function InfinitySpinner(
    {
      size = 72,
      label = "Loading",
      glow = true,
      duration = 2.2,
      className,
      style,
      ...props
    },
    ref,
  ) {
    // useId returns ":r1:"-style ids; strip chars that break url(#...)
    const gradientId = `spinner-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

    return (
      <span
        ref={ref}
        role="status"
        className={cn("inline-flex items-center justify-center", className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        {/* Self-contained animation: no global CSS needed */}
        <style>{`
          @keyframes infinity-spinner-trace {
            to { stroke-dashoffset: -100; }
          }
          @keyframes infinity-spinner-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
          }
          .infinity-spinner-trace {
            animation: infinity-spinner-trace var(--infinity-spinner-duration, 2.2s) linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .infinity-spinner-trace {
              stroke-dasharray: 100 0;
              animation: infinity-spinner-pulse 2s ease-in-out infinite;
            }
          }
        `}</style>

        <svg
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
          focusable="false"
          className="h-full w-full overflow-visible"
          style={
            glow
              ? {
                  filter: `drop-shadow(0 0 ${Math.round(size * 0.08)}px rgba(255, 46, 154, 0.45))`,
                }
              : undefined
          }
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="14"
              y1="36"
              x2="86"
              y2="64"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="var(--spinner-from, #FF6FC4)" />
              <stop offset="46%" stopColor="var(--spinner-via, #FF2E9A)" />
              <stop offset="100%" stopColor="var(--spinner-to, #B0005E)" />
            </linearGradient>
          </defs>

          {/* Faint static track */}
          <path
            d={INFINITY_PATH}
            stroke={`url(#${gradientId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
          />

          {/* Traveling segment */}
          <path
            d={INFINITY_PATH}
            pathLength={100}
            stroke={`url(#${gradientId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="25 75"
            className="infinity-spinner-trace"
            style={
              {
                "--infinity-spinner-duration": `${duration}s`,
              } as React.CSSProperties
            }
          />
        </svg>

        <span className="sr-only">{label}</span>
      </span>
    );
  },
);