import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Home, Lock, Settings, Shield } from "lucide-react";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { LilyMark } from "@/components/floral/Lily";
import { features } from "@/config/features";
import { nav, site } from "@/config/site";
import { lock } from "@/lib/gate";
import { cn } from "@/lib/utils";

const mobileNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/our-story", label: "Story", icon: BookOpen },
  { to: "/privacy", label: "Privacy", icon: Shield },
] as const;

function lockDevice() {
  lock();
  window.location.assign("/");
}

function Wordmark() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5"
      aria-label="For Precious, home"
    >
      <LilyMark className="h-5 w-5 text-rose transition-transform duration-500 ease-silk group-hover:rotate-12" />
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.01em] text-ink">
        For Precious
      </span>
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-[0.82rem] tracking-[-0.01em] text-ink-muted transition-colors hover:bg-blush/70 hover:text-ink",
                  isActive && "bg-blush text-ink",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {features.preferences ? (
          <Link
            to="/preferences"
            aria-label="Preferences"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-blush hover:text-ink"
          >
            <Settings className="h-[1.05rem] w-[1.05rem]" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={lockDevice}
            aria-label="Lock this device"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-blush hover:text-ink"
          >
            <Lock className="h-[1.05rem] w-[1.05rem]" />
          </button>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-[0.84rem] leading-relaxed text-ink-muted">
              A little world made for one person. Everything here is yours.
            </p>
            <p className="mt-5 font-display text-lg italic text-rose-deep">
              Baber.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-[0.84rem] sm:gap-16">
            <div>
              <p className="eyebrow mb-4">Wander</p>
              <ul className="space-y-2.5">
                {nav.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-ink-muted transition-colors hover:text-rose-deep"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Housekeeping</p>
              <ul className="space-y-2.5">
                {features.preferences ? (
                  <li>
                    <Link
                      to="/preferences"
                      className="text-ink-muted transition-colors hover:text-rose-deep"
                    >
                      Email preferences
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link
                    to="/privacy"
                    className="text-ink-muted transition-colors hover:text-rose-deep"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={lockDevice}
                    className="text-left text-ink-muted transition-colors hover:text-rose-deep"
                  >
                    Lock this device
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line/80 pt-6 text-[0.72rem] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Made for {site.her.name}, by {site.him.name}.
          </p>
          <p className="tracking-[0.14em]">{site.domain}</p>
        </div>
      </div>
    </footer>
  );
}

function MobileNav() {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 rounded-full border border-line bg-canvas/95 px-2 py-2 shadow-lift backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Main"
    >
      <ul className="flex items-center justify-between">
        {mobileNav.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 rounded-full py-1.5 text-[0.6rem] tracking-[0.04em] text-ink-muted transition-colors",
                  isActive && "text-rose-deep",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className="h-[1.15rem] w-[1.15rem]"
                    strokeWidth={isActive ? 2 : 1.6}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function Shell() {
  return (
    <>
      <AuroraBackground />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-rose-deep focus:px-4 focus:py-2 focus:text-sm focus:text-on-accent"
        >
          Skip to content
        </a>
        <ScrollToTop />
        <Header />
        <main
          id="main"
          className="mx-auto w-full max-w-6xl flex-1 px-5 pb-28 pt-0 sm:px-8 md:pb-16"
        >
          <Outlet />
        </main>
        <Footer />
        <MobileNav />
      </div>
    </>
  );
}
