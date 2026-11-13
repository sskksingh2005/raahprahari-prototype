// Supabase Edge Function: POST { description } -> { suggestions } | { error }.
// Signed-in users only: the caller's access token is checked with Supabase Auth.
// Deploy: supabase functions deploy extract-hazard
// Secret: supabase secrets set GEMINI_API_KEY=... (optional GEMINI_MODEL)
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided
// by the Edge runtime. Requires migration 20261114120000_ai_usage_rate_limit.
import {
  consumeQuotaViaRpc,
  handleExtract,
  verifyWithSupabaseAuth,
} from "./handler.ts";

// Minimal Deno surface used here, declared so the app's tsc can check this file.
declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void;
  env: { get(name: string): string | undefined };
};

Deno.serve((request) =>
  handleExtract(request, {
    verifyUser: (token) =>
      verifyWithSupabaseAuth(
        fetch,
        Deno.env.get("SUPABASE_URL"),
        Deno.env.get("SUPABASE_ANON_KEY"),
        token,
      ),
    // SUPABASE_SERVICE_ROLE_KEY is provided by the Edge runtime and never
    // leaves the server.
    consumeQuota: (userId) =>
      consumeQuotaViaRpc(
        fetch,
        Deno.env.get("SUPABASE_URL"),
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
        userId,
      ),
    apiKey: Deno.env.get("GEMINI_API_KEY"),
    model: Deno.env.get("GEMINI_MODEL"),
    fetch,
    log: (message) => console.error(`[extract-hazard] ${message}`),
  }),
);
