import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium tracking-[-0.01em] transition-all duration-300 ease-silk disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "bg-rose-deep text-on-accent shadow-soft hover:bg-[#E0007A] hover:shadow-lift",
        secondary:
          "border border-line bg-surface text-ink hover:border-rose-soft hover:bg-blush/50",
        ghost: "text-ink hover:bg-blush",
        quiet: "text-rose-deep hover:bg-blush",
        danger: "border border-error/25 text-error hover:bg-error/10",
      },
      size: {
        sm: "h-9 px-4 text-[0.8rem]",
        md: "h-11 px-6 text-[0.86rem]",
        lg: "h-12 px-7 text-[0.92rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
