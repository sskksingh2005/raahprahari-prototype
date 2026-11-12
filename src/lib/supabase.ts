import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Thrown when the browser build lacks the public Supabase configuration. */
export class SupabaseConfigError extends Error {
  constructor(missing: string[]) {
    super(
      `Supabase is not configured. Missing environment variable(s): ${missing.join(", ")}. ` +
        "Set them in .env.local (see AGENTS.md) and restart the dev server.",
    );
    this.name = "SupabaseConfigError";
  }
}

let client: SupabaseClient | null = null;

/**
 * Returns the browser Supabase client. Only the public URL and anon key are
 * read here; role checks must still be enforced by the backend (RLS).
 * Throws SupabaseConfigError if either variable is missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  if (typeof window === "undefined") {
    throw new Error("The Supabase browser client is unavailable during SSR.");
  }
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  const missing = [
    !url && "VITE_SUPABASE_URL",
    !anonKey && "VITE_SUPABASE_ANON_KEY",
  ].filter((name): name is string => Boolean(name));
  if (!url || !anonKey) throw new SupabaseConfigError(missing);
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
