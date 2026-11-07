const STORAGE_KEY = "fp-unlocked-until";
const SITE_KEY_STORAGE = "fp-site-key";
const SESSION_HOURS = 8;
const NOTES_SALT = "for-precious-notes";

export const gateHash = (import.meta.env.VITE_GATE_HASH as string | undefined)?.trim() ?? "";
export const gateConfigured = gateHash.length === 64;

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveSiteKey(passphrase: string): Promise<string> {
  return sha256(`${passphrase.trim().toLowerCase()}:${NOTES_SALT}`);
}

export async function checkPassphrase(input: string): Promise<boolean> {
  if (!gateConfigured) return false;
  const hash = await sha256(input);
  if (hash !== gateHash.toLowerCase()) return false;
  try {
    sessionStorage.setItem(SITE_KEY_STORAGE, await deriveSiteKey(input));
  } catch {
    /* the gate still unlocks, but notes will ask for the passphrase again */
  }
  return true;
}

export function isUnlocked(): boolean {
  if (!gateConfigured) return false;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const expiry = Number(raw);
    if (!Number.isFinite(expiry) || expiry < Date.now() || !sessionStorage.getItem(SITE_KEY_STORAGE)) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SITE_KEY_STORAGE);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function unlock(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now() + SESSION_HOURS * 3600 * 1000));
  } catch {
    /* session storage unavailable — gate will re-ask on reload */
  }
}

export function lock(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SITE_KEY_STORAGE);
  } catch {
    /* noop */
  }
}

export function getSiteKey(): string {
  try {
    return sessionStorage.getItem(SITE_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}
