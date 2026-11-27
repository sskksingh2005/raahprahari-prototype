import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // Vite skips .env.local in test mode, and src/config/env.ts validates at import.
    // Dummy, non-secret values keep module load valid without real credentials.
    env: {
      VITE_APP_ENV: "development",
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: "sb_publishable_test-placeholder",
    },
    testTimeout: 120000,
    hookTimeout: 120000,
    pool: "threads",
    maxWorkers: 1,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
