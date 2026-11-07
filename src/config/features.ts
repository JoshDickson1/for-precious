/**
 * Launch flags.
 *
 * v1 is the ask: gate → home → story → the last page.
 * Everything below is kept in the codebase and switched back on for V2/V3.
 */
export const features = {
  /** My Space: notes, feelings, day plan, favourites. */
  mySpace: false,
  /** Little Things archive. The daily note on Home stays. */
  littleThings: false,
  /** Morning email signup, Resend and the daily scheduler. */
  email: false,
  /** Preferences page (email, backup, erase, lock). */
  preferences: false,
  /** Unsubscribe route. Only needed once email is on. */
  unsubscribe: false,
} as const;
