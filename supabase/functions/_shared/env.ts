// Server-only environment validation for Edge Functions.
// Never import this from frontend code. Error messages and summaries name
// variables only; they never include values.

// Minimal Deno surface used here, declared so the app's tsc can check this file.
declare const Deno: {
  env: { get(name: string): string | undefined };
};

export type AppEnv = "development" | "demo" | "pilot" | "production";

const APP_ENVS: readonly AppEnv[] = [
  "development",
  "demo",
  "pilot",
  "production",
];

export interface ServerEnv {
  appEnv: AppEnv;
  supabaseUrl: string;
  serviceRoleKey: string;
  /** Optional. When absent, AI features are treated as unavailable. */
  aiApiKey: string | null;
}

function read(name: string): string | undefined {
  const value = Deno.env.get(name)?.trim();
  return value ? value : undefined;
}

/** Reads and validates server variables. Throws one error listing every problem. */
export function loadServerEnv(): ServerEnv {
  const errors: string[] = [];

  const appEnv = read("APP_ENV");
  const supabaseUrl = read("SUPABASE_URL");
  const serviceRoleKey = read("SUPABASE_SERVICE_ROLE_KEY");
  const aiApiKey = read("GEMINI_API_KEY");

  if (!appEnv) {
    errors.push(`APP_ENV is missing. Allowed: ${APP_ENVS.join(" | ")}`);
  } else if (!APP_ENVS.includes(appEnv as AppEnv)) {
    errors.push(`APP_ENV is invalid. Allowed: ${APP_ENVS.join(" | ")}`);
  }

  if (!supabaseUrl) {
    errors.push("SUPABASE_URL is missing.");
  } else {
    try {
      new URL(supabaseUrl);
    } catch {
      errors.push("SUPABASE_URL is not a valid URL.");
    }
  }

  if (!serviceRoleKey) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  if (errors.length > 0) {
    throw new Error("Server environment is invalid:\n- " + errors.join("\n- "));
  }

  return {
    appEnv: appEnv as AppEnv,
    supabaseUrl: supabaseUrl as string,
    serviceRoleKey: serviceRoleKey as string,
    aiApiKey: aiApiKey ?? null,
  };
}

/** Safe to log or return: configuration status only, no secret values. */
export function safeEnvSummary(env: ServerEnv): {
  appEnv: AppEnv;
  supabaseUrlSet: boolean;
  serviceRoleKeySet: boolean;
  aiApiKeySet: boolean;
} {
  return {
    appEnv: env.appEnv,
    supabaseUrlSet: Boolean(env.supabaseUrl),
    serviceRoleKeySet: Boolean(env.serviceRoleKey),
    aiApiKeySet: env.aiApiKey !== null,
  };
}
