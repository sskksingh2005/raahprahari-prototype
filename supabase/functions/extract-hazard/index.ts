// Supabase Edge Function: POST { description } -> { suggestions } | { error }.
// Guests are allowed with per-IP quota; signed-in users are verified with Supabase Auth.
// Deploy: supabase functions deploy extract-hazard --no-verify-jwt
// Secret: supabase secrets set GEMINI_API_KEY=... (optional GEMINI_MODEL)
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided
// by the Edge runtime. Requires the user and guest quota migrations.
import {
  consumeGuestQuotaViaRpc,
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
    getGuestQuotaKey: async (guestRequest) => {
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!serviceRoleKey) return null;
      const forwardedFor = guestRequest.headers.get("x-forwarded-for");
      const clientIp =
        guestRequest.headers.get("cf-connecting-ip")?.trim() ||
        guestRequest.headers.get("x-real-ip")?.trim() ||
        forwardedFor?.split(",").at(-1)?.trim();
      const guestId = guestRequest.headers.get("x-guest-id");
      const identity = clientIp
        ? `ip:${clientIp}`
        : guestId
          ? `browser:${guestId}`
          : null;
      if (!identity) return null;
      const hmacKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(serviceRoleKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const digest = new Uint8Array(
        await crypto.subtle.sign(
          "HMAC",
          hmacKey,
          new TextEncoder().encode(identity),
        ),
      );
      return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    },
    consumeGuestQuota: (guestKey) =>
      consumeGuestQuotaViaRpc(
        fetch,
        Deno.env.get("SUPABASE_URL"),
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
        guestKey,
      ),
    apiKey: Deno.env.get("GEMINI_API_KEY"),
    model: Deno.env.get("GEMINI_MODEL"),
    fetch,
    log: (message) => console.error(`[extract-hazard] ${message}`),
  }),
);
