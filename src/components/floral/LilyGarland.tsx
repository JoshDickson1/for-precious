import { cn } from "@/lib/utils";
import { Lily } from "./Lily";

/** Three line-art lilies in a row, breathing gently in place of the old rule. */
export function LilyGarland({
  className,
  caption,
}: {
  className?: string;
  caption?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <div
        className="flex items-center justify-center gap-3 sm:gap-5"
        aria-hidden="true"
      >
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-line sm:w-16" />
        <Lily
          size={76}
          tone="line"
          strokeWidth={2.6}
          animated
          className="h-14 w-14 text-rose-soft/75 sm:h-[4.5rem] sm:w-[4.5rem]"
        />
        <Lily
          size={116}
          tone="line"
          strokeWidth={2.2}
          animated
          className="h-20 w-20 text-rose-soft sm:h-28 sm:w-28"
        />
        <Lily
          size={76}
          tone="line"
          strokeWidth={2.6}
          animated
          className="h-14 w-14 text-rose-soft/75 sm:h-[4.5rem] sm:w-[4.5rem]"
        />
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-line sm:w-16" />
      </div>
      {caption ? (
        <p className="mt-3 font-script text-xl text-rose-soft/80 sm:text-2xl">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
