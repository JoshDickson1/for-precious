let started = false;

/**
 * Warm the Lottie player and the gate animation while the passphrase is being
 * typed, so the SVG pops out of the input field instantly on submit instead of
 * flashing the fallback heart while it downloads.
 */
export function preloadGateHeart(): void {
  if (started) return;
  started = true;

  void import("lottie-web/build/player/lottie_svg");
  void fetch(`${import.meta.env.BASE_URL}gate-heart.json`, {
    cache: "force-cache",
  }).catch(() => {
    /* the player will retry when it mounts */
  });
}
