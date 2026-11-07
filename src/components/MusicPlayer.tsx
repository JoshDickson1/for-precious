import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Lily } from "@/components/floral/Lily";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

type Track = {
  title: string;
  artist: string;
  album: string;
  duration: string;
  spotifyId?: string;
  cover?: string;
};

const TRACKS: Track[] = [
  { title: "Diamonds", artist: "Rihanna", album: "Unapologetic (Deluxe)", duration: "3:45", spotifyId: "6O20JhBJPePEkBdrB5sqRx", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e026dee21d6cd1823e4d6231d37" },
  { title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", album: "Die With A Smile", duration: "4:12", spotifyId: "2plbrEY59IikOBgBGLjaoe", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0282ea2e9e1858aa012c57cd45" },
  { title: "Dandelions", artist: "Ruth B.", album: "Safe Haven", duration: "3:54", spotifyId: "2eAvDnpXP5W0cVtiI0PUxV", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02b09403f05bc0c306cf96990f" },
  { title: "Cinnamon Girl", artist: "Lana Del Rey", album: "Norman Fucking Rockwell!", duration: "5:01", spotifyId: "2mdEsXPu8ZmkHRRtAdC09e", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02879e9318cb9f4e05ee552ac9" },
  { title: "Lost Boy", artist: "Ruth B.", album: "Safe Haven", duration: "4:36", spotifyId: "0zMzyHAeMvwq5CRstru1Fp", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02b09403f05bc0c306cf96990f" },
  { title: "Ghost", artist: "Justin Bieber", album: "Justice", duration: "2:33", spotifyId: "6I3mqTwhRpn34SLVafSH7G", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e6f407c7f3a0ec98845e4431" },
  { title: "Let Me Down Slowly", artist: "Alec Benjamin", album: "Narrated For You", duration: "2:49", spotifyId: "2qxmye6gAegTMjLKEBoR3d", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02459d675aa0b6f3b211357370" },
  { title: "Unstoppable", artist: "Sia", album: "This Is Acting (Deluxe)", duration: "3:38", spotifyId: "1yvMUkIOTeUNtNWlWRgANS", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0209fc2936525fc269032451c9" },
  { title: "Me & U", artist: "Tems", album: "Me & U", duration: "3:13", spotifyId: "4nFrcGM7MY1mpoQCC7Kefj", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02d855d745cdaa465b415776a0" },
  { title: "Someone You Loved", artist: "Lewis Capaldi", album: "Divinely Uninspired To A Hellish Extent", duration: "3:02", spotifyId: "7qEHsqek33rTcFNT9PFqLf", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02fc2101e6889d6ce9025f85f2" },
  { title: "Last Heartbreak Song", artist: "Ayra Starr, GIVĒON", album: "The Year I Turned 21", duration: "2:30", spotifyId: "1A1ifX8sWzelNpkL5PxcHT", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02fa88b93bb6dde97f7258cdec" },
  { title: "Commas", artist: "Ayra Starr", album: "The Year I Turned 21", duration: "2:37", spotifyId: "4GXW3Ne1jzdORKHvHjK31V", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02fa88b93bb6dde97f7258cdec" },
  { title: "Flowers", artist: "Lauren Spencer Smith", album: "Flowers", duration: "2:37", spotifyId: "6Z165JvPnS8PYvGW8oLGLc", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02295d21d0987dcc3d88b4e993" },
  { title: "28", artist: "Ruth B., Dean Lewis", album: "28 (with Dean Lewis)", duration: "3:28", spotifyId: "3fajzhEHSdlSmY31dORz9M", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e023ec018d927bbccf5b35e6622" },
  { title: "like my father", artist: "Jax", album: "like my father", duration: "3:03", spotifyId: "5YVmHTAsdWnoanWXB7AwZX", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02efa3cbe349ba5c09046c7b52" },
  { title: "Beautiful Things", artist: "Benson Boone", album: "Fireworks & Rollerblades", duration: "3:00", spotifyId: "6tNQ70jh4OwmPGpYy6R2o9", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02f85058b7e234523d2d2ef834" },
  { title: "Oga Eme", artist: "Kolaboy, Evado", album: "Nwa Nwanyi Deeper", duration: "3:19", spotifyId: "5bZhsyEiLjpkLWZDySGxQu", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e023f0c6fda3d5c7ea5ca0020eb" },
  { title: "a thousand years", artist: "Christina Perri", album: "a thousand years", duration: "4:45", spotifyId: "6vS1uzFFH8tUWDPnGbBDbc", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02967061227cd1c947467c66c8" },
  { title: "Set Fire to the Rain", artist: "Adele", album: "21", duration: "4:03", spotifyId: "3di5hcvxxciiqwMH1jarhY", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e63ac9f24aab9acc90f81960" },
  { title: "I love you", artist: "Amma", album: "to what we were", duration: "2:14", spotifyId: "6xqIF3NJu8rBtRAeIBkSIZ", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02071564df337b864f328e76ac" },
  { title: "Young And Beautiful", artist: "Lana Del Rey", album: "Young And Beautiful", duration: "3:56", spotifyId: "2nMeu6UenVvwUktBCpLMK9", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02d7fb3e4c63020039d1cff6b2" },
  { title: "you broke me first", artist: "Tate McRae", album: "TOO YOUNG TO BE SAD", duration: "2:50", spotifyId: "4l0RmWt52FxpVxMNni6i63", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e027e2764c2192137c81a9e2cab" },
  { title: "Train Wreck", artist: "James Arthur", album: "Back from the Edge", duration: "3:29", spotifyId: "55Am8neGJkdj2ADaM3aw5H", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e028d34e1fc21441df43571faaa" },
  { title: "bloodstream", artist: "Alyssa Grace", album: "bloodstream", duration: "2:57", spotifyId: "2oWFJJW9d1bIra3zHjR6GO", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e029c031feeff1647deb7577309" },
  { title: "Ms. Paper", artist: "Ayra Starr, Theodora", album: "Stargirl", duration: "2:45", spotifyId: "0e6cXkbHc57qMSN3DwmfSI", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e024457e5b19771c406c6edad32" },
  { title: "Heaven Baby", artist: "Ayra Starr, ZAYN", album: "Stargirl", duration: "2:39", spotifyId: "4iJJOsuXC9Y3Xp3wrmfl24", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e024457e5b19771c406c6edad32" },
  { title: "Gratitude", artist: "Asake", album: "M$NEY", duration: "2:50", spotifyId: "7hiRlw64LXcHpGAVJ6eUzv", cover: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02d9cd09fb89c473c2e6ce70b1" },
  { title: "Fire On Fire", artist: "Sam Smith", album: "Love Goes", duration: "4:07", spotifyId: "7t3Xdbufg7q2onVsR8RBdY", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e020d1f3930676c34a23dbf5c46" },
  { title: "Young Dumb & Broke", artist: "Khalid", album: "American Teen", duration: "3:23", spotifyId: "5Z3GHaZ6ec9bsiI5BenrbY", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e024ac041e0d889d3a2608210d5" },
  { title: "Devil Doesn't Bargain", artist: "Alec Benjamin", album: "(Un)Commentary", duration: "2:44", spotifyId: "1zu2GKHPJIsUu80SUJX4H4", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0219bf737aaa3bf07790660bb2" },
  { title: "I Love You, I'm Sorry", artist: "Gracie Abrams", album: "The Secret of Us", duration: "2:37", spotifyId: "51rfRCiUSvxXlCSCfIztBy", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e026e2101520787791370f4a96b" },
  { title: "Nicole Kidman", artist: "ADÉLA", album: "PRIMA", duration: "3:01", spotifyId: "70cHKK8bHAfJrOGVnfRG9J", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02ac9d5d5263e9f03802d6864c" },
];

type SpotifyEmbedController = {
  loadEntity?: (uri: string) => void;
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  addListener: (
    event: "playback_update",
    callback: (event: { data: { isPaused: boolean } }) => void,
  ) => void;
  destroy: () => void;
};

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    spotifyIframeApi?: SpotifyIframeApi;
  }
}

let iframeApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (window.spotifyIframeApi) return Promise.resolve(window.spotifyIframeApi);
  if (iframeApiPromise) return iframeApiPromise;

  iframeApiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Spotify player timed out"));
    }, 8000);

    window.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timeout);
      window.spotifyIframeApi = api;
      resolve(api);
    };

    const existing = document.getElementById("spotify-iframe-api");
    if (existing && !existing.getAttribute("src")?.includes("/embed/iframe-api/v1")) {
      existing.remove();
    }

    if (!document.getElementById("spotify-iframe-api")) {
      const script = document.createElement("script");
      script.id = "spotify-iframe-api";
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        script.remove();
        reject(new Error("Spotify player failed to load"));
      };
      document.body.appendChild(script);
    }
  }).catch((error) => {
    iframeApiPromise = null;
    throw error;
  });

  return iframeApiPromise;
}

function spotifyUrl(track: Track) {
  return track.spotifyId
    ? `https://open.spotify.com/track/${track.spotifyId}`
    : `https://open.spotify.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`;
}

function loadTrack(controller: SpotifyEmbedController, uri: string) {
  if (controller.loadEntity) {
    controller.loadEntity(uri);
  } else {
    controller.loadUri(uri);
  }
}

function Equalizer() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-[2px] rounded-full bg-rose-deep"
          style={{
            height: `${[8, 12, 6][bar]}px`,
            animation: `breathe ${1.1 + bar * 0.25}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}

export function MusicPlayer() {
  const firstPlayable = TRACKS.findIndex((track) => track.spotifyId);
  const [activeIndex, setActiveIndex] = useState(firstPlayable === -1 ? 0 : firstPlayable);
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);

  const embedRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const pendingUriRef = useRef<string | null>(null);

  const active = TRACKS[activeIndex];
  const embedUri = active.spotifyId ? `spotify:track:${active.spotifyId}` : null;
  const activeUrl = spotifyUrl(active);

  pendingUriRef.current = embedUri;

  useEffect(() => {
    let cancelled = false;
    const initialUri = pendingUriRef.current;

    loadSpotifyIframeApi()
      .then((api) => {
        if (cancelled || !embedRef.current || !initialUri) return;
        api.createController(
          embedRef.current,
          { uri: initialUri, width: "100%", height: 152 },
          (controller) => {
            if (cancelled) {
              controller.destroy();
              return;
            }
            controllerRef.current = controller;
            controller.addListener("playback_update", (event) => {
              setIsPlaying(!event.data.isPaused);
            });
            setApiReady(true);

            const latestUri = pendingUriRef.current;
            if (latestUri && latestUri !== initialUri) {
              loadTrack(controller, latestUri);
              window.setTimeout(() => {
                try {
                  controller.play();
                } catch {
                  /* player was replaced */
                }
              }, 300);
            }
          },
        );
      })
      .catch(() => {
        if (!cancelled) setApiFailed(true);
      });

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!embedUri) return;
    const controller = controllerRef.current;
    if (!controller) return;
    loadTrack(controller, embedUri);
    const timer = window.setTimeout(() => {
      if (controllerRef.current !== controller) return;
      try {
        controller.play();
      } catch {
        /* player was replaced */
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [embedUri]);

  const startListening = () => {
    const target = firstPlayable === -1 ? 0 : firstPlayable;
    if (target === activeIndex) {
      controllerRef.current?.play();
      return;
    }
    setActiveIndex(target);
  };

  const selectTrack = (index: number) => {
    if (index === activeIndex) {
      controllerRef.current?.play();
      return;
    }
    setActiveIndex(index);
  };

  const step = (direction: number) => {
    setActiveIndex((index) => (index + direction + TRACKS.length) % TRACKS.length);
  };

  const togglePlayback = () => {
    if (controllerRef.current) {
      controllerRef.current.togglePlay();
      return;
    }
    window.open(activeUrl, "_blank", "noopener,noreferrer");
  };

  const playButton =
    embedUri && !apiFailed ? (
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? `Pause ${active.title}` : `Play ${active.title}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-deep text-on-accent shadow-soft transition-transform duration-300 ease-silk hover:scale-105 hover:shadow-lift"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        )}
      </button>
    ) : (
      <a
        href={activeUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${active.title} on Spotify`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-deep text-on-accent shadow-soft transition-transform duration-300 ease-silk hover:scale-105 hover:shadow-lift"
      >
        <Play className="ml-0.5 h-5 w-5 fill-current" />
      </a>
    );

  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] top-0 h-[152px] w-[400px] overflow-hidden opacity-0"
      >
        <div ref={embedRef} className="h-[152px] w-full" />
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {apiFailed
          ? "Spotify player unavailable. Use Open in Spotify."
          : apiReady
            ? "Spotify player ready."
            : "Loading player…"}
      </p>

      <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface/70 shadow-lift backdrop-blur-xl">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-rose/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(240,55,165,0.08)_0%,transparent_55%)]" />

        <div className="relative grid gap-10 p-6 sm:p-9 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:p-12">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="eyebrow">Her playlist</span>
              <span className="h-px w-8 bg-line" />
            </div>

            <h2 className="mt-4 text-balance font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[0.98] tracking-[-0.02em] text-ink">
              Songs that sound
              <br />
              <span className="italic text-rose-deep">like us.</span>
            </h2>

            <p className="mt-5 max-w-sm text-pretty text-[0.92rem] leading-relaxed text-ink-muted">
              She made this one. No skips, a few that hit harder than they
              should, and one or two I pretend I don't know all the words to.
              Press play.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startListening}
                className={buttonVariants({ size: "md" })}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Start listening"}
              </button>
              <a
                href={activeUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "secondary", size: "md" })}
              >
                Open in Spotify
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-xl2 border border-line bg-white/[0.04] px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush">
                <Heart className="h-4 w-4 text-rose-deep" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.78rem] font-medium text-ink">A private playlist</p>
                <p className="truncate text-[0.72rem] text-ink-muted">
                  {TRACKS.length} songs she keeps coming back to
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl2 border border-line bg-surface/80 p-5 shadow-soft backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-gradient-to-br from-blush via-[#180912] to-[#0B0509]">
                  <Lily size={64} className="absolute left-0 top-0 opacity-80" />
                  {active.cover ? (
                    <img
                      src={active.cover}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-ink-muted">
                    {isPlaying ? "Now playing" : "From her playlist"}
                  </p>
                  <p className="mt-1 truncate font-display text-[1.35rem] leading-tight text-ink">
                    {active.title}
                  </p>
                  <p className="truncate text-[0.78rem] text-ink-muted">{active.artist}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setLiked((value) => !value)}
                  aria-label={liked ? "Remove from favourites" : "Add to favourites"}
                  aria-pressed={liked}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                    liked
                      ? "border-rose/40 bg-blush text-rose-deep"
                      : "border-line text-ink-muted hover:border-rose-soft hover:text-rose-deep",
                  )}
                >
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous song"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/[0.04] text-ink-muted transition-colors hover:border-rose-soft hover:text-rose-deep"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                {playButton}

                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next song"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/[0.04] text-ink-muted transition-colors hover:border-rose-soft hover:text-rose-deep"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-[0.66rem] uppercase tracking-[0.18em] text-ink-muted">
                <span className="truncate">{active.album}</span>
                <span className="tabular-nums">{active.duration}</span>
              </div>
            </div>

            <div className="relative">
              <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                {TRACKS.map((track, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${track.title}-${track.artist}`}
                      type="button"
                      onClick={() => selectTrack(index)}
                      aria-pressed={isActive}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl2 border px-3 py-2.5 text-left transition-all duration-300 ease-silk",
                        isActive
                          ? "border-rose/30 bg-blush/70 shadow-soft"
                          : "border-transparent hover:border-line hover:bg-white/[0.05]",
                      )}
                    >
                      <span className="w-5 shrink-0 text-right font-sans text-[0.66rem] tabular-nums text-ink-muted">
                        {isActive ? <Equalizer /> : String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-[0.84rem] font-medium",
                            isActive ? "text-rose-deep" : "text-ink",
                          )}
                        >
                          {track.title}
                        </span>
                        <span className="block truncate text-[0.7rem] text-ink-muted">
                          {track.artist}
                        </span>
                      </span>

                      <span className="hidden w-28 shrink-0 truncate text-[0.68rem] text-ink-muted sm:block">
                        {track.album}
                      </span>
                      <span className="w-9 shrink-0 text-right text-[0.68rem] tabular-nums text-ink-muted">
                        {track.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[0.72rem] text-ink-muted">
        For {site.her.name}. Every one of these is a small argument for you.
      </p>
    </section>
  );
}

export default MusicPlayer;
