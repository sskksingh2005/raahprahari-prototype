// src/components/EnvBanner.tsx
import { env } from "../config/env";

export function EnvBanner() {
  // Only demo shows a banner (synthetic-data warning); other environments show none.
  if (env.appEnv !== "demo") return null;

  const text =
    "DEMO: yahan ka saara data synthetic (nakli) hai. Asli advisory nahi hai.";

  return (
    <div
      role="note"
      data-testid="env-banner"
      className="glass-strong border-status-caution px-3 py-2 text-center font-semibold text-foreground"
    >
      {text}
    </div>
  );
}
