import { useCallback, useEffect, useState } from "react";

export type ScreenStatus = "loading" | "ready" | "error";

/** How long the loading skeleton stays up after a retry. */
export const RETRY_LOADING_MS = 300;

/**
 * Loading / error / ready state for screens fed by the local store.
 *
 * The data is synchronous, so the first render is never a skeleton (that would
 * only hide server-rendered content). `probe` says whether the data can be
 * shown; if it throws or returns false the screen is in the error state.
 * `retry` shows the loading skeleton briefly and then checks the data again.
 */
export function useScreenState(probe: () => boolean): {
  status: ScreenStatus;
  retry: () => void;
} {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), RETRY_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const retry = useCallback(() => setLoading(true), []);

  if (loading) return { status: "loading", retry };
  let ok = false;
  try {
    ok = probe();
  } catch (error) {
    console.error("Screen data check failed", error);
  }
  return { status: ok ? "ready" : "error", retry };
}
