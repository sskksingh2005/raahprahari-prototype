/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Deployment environment selected at build time. */
  readonly VITE_APP_ENV?: string;
  /** Public Supabase project URL. */
  readonly VITE_SUPABASE_URL?: string;
  /** Public Supabase anon or publishable key (RLS enforces access). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
