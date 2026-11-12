/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public Supabase project URL. */
  readonly VITE_SUPABASE_URL?: string;
  /** Public Supabase anon key (safe for the browser; RLS enforces access). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
