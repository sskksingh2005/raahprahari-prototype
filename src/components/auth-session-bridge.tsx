import { useEffect } from "react";
import { connectSupabaseSession } from "@/lib/account-session";
import { getSupabaseClient } from "@/lib/supabase";

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
    let disconnect: (() => void) | undefined;
    try {
      disconnect = connectSupabaseSession(getSupabaseClient().auth);
    } catch (error) {
      // Missing configuration leaves the visitor signed out; the login form
      // reports the problem when someone tries to sign in.
      console.error(error instanceof Error ? error.message : error);
    }
    return () => disconnect?.();
  }, []);
  return null;
}
