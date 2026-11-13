import { describe, expect, it, vi } from "vitest";
import { en, hi } from "@/i18n/dictionary";
import { deliveryPrivacyKey } from "@/routes/about";

const source = vi.hoisted(() => ({ current: "none" as string }));
vi.mock("@/lib/sync/sync-engine", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sync/sync-engine")>()),
  getTransportSource: () => source.current,
}));

describe("privacy copy", () => {
  it("describes report delivery to match the configured transport", () => {
    source.current = "none";
    expect(deliveryPrivacyKey()).toBe("aboutPage.privacyDeliveryNone");
    source.current = "dev_stub";
    expect(deliveryPrivacyKey()).toBe("aboutPage.privacyDeliveryDev");
    source.current = "http";
    expect(deliveryPrivacyKey()).toBe("aboutPage.privacyDeliveryConfigured");
  });

  it("no longer claims nothing leaves the browser", () => {
    expect(en["aboutPage.privacyBody"]).not.toMatch(/nothing is uploaded/i);
  });

  it("states the AI facts without inventing guarantees", () => {
    for (const text of [en["aboutPage.privacyAi"], en["ai.privacy"]]) {
      expect(text).toMatch(/optional/i);
      expect(text).toMatch(/Supabase/);
      expect(text).toMatch(/Gemini/);
      expect(text).toMatch(/photos are (never|not) sent/i);
      expect(text).toMatch(/names, contact details and identifying addresses/);
      expect(text).not.toMatch(
        /never (sold|shared)|not (sold|shared)|deleted after|retain/i,
      );
    }
    expect(en["aboutPage.privacyAi"]).toMatch(/cannot guarantee/);
    for (const key of [
      "aboutPage.privacyAi",
      "ai.privacy",
      "ai.signinRequired",
    ] as const)
      expect(hi[key]).toBeTruthy();
  });
});
