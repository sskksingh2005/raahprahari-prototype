import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("frontend environment configuration", () => {
  it("accepts production with public Supabase configuration", async () => {
    vi.stubEnv("VITE_APP_ENV", "production");
    vi.stubEnv("VITE_SUPABASE_URL", "https://production.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_publishable_test-placeholder");

    const { env } = await import("./env");

    expect(env.appEnv).toBe("production");
    expect(env.isSynthetic).toBe(false);
  });

  it("rejects insecure production URLs and malformed public keys", async () => {
    vi.stubEnv("VITE_APP_ENV", "production");
    vi.stubEnv("VITE_SUPABASE_URL", "http://production.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "not-a-supabase-key");

    const error = await import("./env").then(
      () => null,
      (cause: unknown) => cause,
    );

    expect(error).toBeInstanceOf(Error);
    if (!(error instanceof Error))
      throw new Error("Expected invalid env error.");
    expect(error.message).toContain(
      "VITE_SUPABASE_URL must use HTTPS in production.",
    );
    expect(error.message).toContain(
      "VITE_SUPABASE_ANON_KEY must be a Supabase publishable key or legacy anon JWT.",
    );
  });
});
