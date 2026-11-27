import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

const CLIENT_SECRET_NAME =
  /SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|GEMINI|API_KEY/i;

function isServiceRoleKey(value: string) {
  if (value.startsWith("sb_secret_")) return true;

  const payload = value.split(".")[1];
  if (!payload) return false;
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return decoded.role === "service_role";
  } catch {
    return false;
  }
}

function assertClientEnvIsSafe(mode: string) {
  const unsafe = Object.entries(loadEnv(mode, process.cwd(), ""))
    .filter(
      ([name, value]) =>
        name.startsWith("VITE_") &&
        (CLIENT_SECRET_NAME.test(name) || isServiceRoleKey(value)),
    )
    .map(([name]) => name);

  if (unsafe.length > 0) {
    throw new Error(
      `Unsafe client-exposed environment variable(s): ${unsafe.join(", ")}. ` +
        "VITE_ variables are included in browser bundles; remove secrets and rotate any exposed credentials.",
    );
  }
}

export default defineConfig(({ command, mode }) => {
  assertClientEnvIsSafe(mode);

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      tailwindcss(),
      command === "build" ? netlify() : null,
      tanstackStart(),
      viteReact(),
    ],
  };
});
