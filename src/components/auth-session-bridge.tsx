import { useEffect } from "react";
import { connectSupabaseSession } from "@/lib/account-session";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const devStubEnabled =
  import.meta.env.DEV && import.meta.env.VITE_DEV_RECEIPT_STUB === "true";

/**
 * Restores and follows the Supabase session after mount (browser only).
 * The development receipt stub manages its own session, so Supabase is not
 * connected while the stub is enabled.
 */
export function AuthSessionBridge() {
  useEffect(() => {
    if (devStubEnabled) return;
    // A build without Supabase settings is a supported state, not a fault:
    // /status lists sign-in as blocked and the login form explains it. Logging
    // an error here would put one in the console on every page load.
    if (!isSupabaseConfigured()) return;
    let disconnect: (() => void) | undefined;
    try {
      disconnect = connectSupabaseSession(getSupabaseClient().auth);
    } catch (error) {
      // Only an unexpected failure gets here, so it is still reported.
      console.error(error instanceof Error ? error.message : error);
    }
    return () => disconnect?.();
  }, []);
  return null;
}
