import { Link } from "react-router-dom";
import { Lily } from "@/components/floral/Lily";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Lily size={160} />
      <p className="eyebrow mt-6">404</p>
      <h1 className="mt-3 font-display text-display-md text-ink">This page wandered off.</h1>
      <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-ink-muted">
        The rest of the world is still here, though.
      </p>
      <Link to="/" className={buttonVariants({ size: "md", className: "mt-7" })}>
        Back home
      </Link>
    </div>
  );
}
