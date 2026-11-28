// src/config/env.ts
export type AppEnv = "development" | "demo" | "pilot" | "production";

const APP_ENVS: readonly AppEnv[] = [
  "development",
  "demo",
  "pilot",
  "production",
];

// JWT ka payload padh ke "role" nikalta hai (kisi library ke bina)
function jwtRole(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function isSecretKey(value: string): boolean {
  if (value.startsWith("sb_secret_")) return true; // naye Supabase secret key ka format
  return jwtRole(value) === "service_role"; // purane format ka service_role JWT
}

function loadEnv() {
  const errors: string[] = [];

  const appEnv = import.meta.env.VITE_APP_ENV?.trim() as string | undefined;
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() as
    string | undefined;

  if (import.meta.env.SSR) {
    console.info("[RaahPrahari] VITE_APP_ENV:", appEnv ?? "<missing>");
  }

  if (!appEnv || !APP_ENVS.includes(appEnv as AppEnv)) {
    errors.push(
      `VITE_APP_ENV galat ya missing. Allowed: ${APP_ENVS.join(" | ")}`,
    );
  }
  if (!url) {
    errors.push("VITE_SUPABASE_URL missing.");
  } else {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        errors.push("VITE_SUPABASE_URL must use HTTP or HTTPS.");
      } else if (appEnv === "production" && parsedUrl.protocol !== "https:") {
        errors.push("VITE_SUPABASE_URL must use HTTPS in production.");
      }
    } catch {
      errors.push("VITE_SUPABASE_URL valid URL nahi hai.");
    }
  }
  if (!anonKey) {
    errors.push("VITE_SUPABASE_ANON_KEY missing.");
  } else if (isSecretKey(anonKey)) {
    // Value kabhi print nahi karte, sirf naam
    errors.push(
      "VITE_SUPABASE_ANON_KEY me SECRET (service_role) key mili. Browser me secret key kabhi nahi jati. Use turant hatao aur Supabase dashboard se rotate karo.",
    );
  } else if (
    !anonKey.startsWith("sb_publishable_") ||
    anonKey.length === "sb_publishable_".length
  ) {
    if (jwtRole(anonKey) !== "anon") {
      errors.push(
        "VITE_SUPABASE_ANON_KEY must be a Supabase publishable key or legacy anon JWT.",
      );
    }
  }

  // Koi bhi VITE_ variable ka naam secret jaisa to nahi?
  for (const name of Object.keys(import.meta.env)) {
    if (
      name.startsWith("VITE_") &&
      /SECRET|SERVICE_ROLE|PRIVATE|PASSWORD/i.test(name)
    ) {
      errors.push(
        `${name} ka naam secret jaisa hai. VITE_ variables browser me public hote hain.`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error("Environment config galat hai:\n- " + errors.join("\n- "));
  }

  return {
    appEnv: appEnv as AppEnv,
    supabaseUrl: url as string,
    supabaseAnonKey: anonKey as string,
    isSynthetic: appEnv === "development" || appEnv === "demo",
  };
}

export const env = loadEnv();
