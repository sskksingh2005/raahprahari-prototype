import { describe, expect, it } from "vitest";
import { REDACTED, sanitizeDescription } from "@/lib/pii-sanitize";

describe("sanitizeDescription", () => {
  it("removes email addresses", () => {
    expect(
      sanitizeDescription("Mail ravi.k+road@example.co.in for photos"),
    ).toBe(`Mail ${REDACTED} for photos`);
  });

  it.each(["+91 98765 43210", "9876543210", "098765-43210", "(0135) 271-2345"])(
    "removes the phone number %s",
    (phone) => {
      expect(sanitizeDescription(`Call ${phone} now`)).toBe(
        `Call ${REDACTED} now`,
      );
    },
  );

  it("removes long digit runs such as ID numbers", () => {
    expect(sanitizeDescription("Aadhaar 123412341234 lost")).toBe(
      `Aadhaar ${REDACTED} lost`,
    );
  });

  it("keeps road codes, distances, times and short numbers", () => {
    const text =
      "NH-58 blocked at km 42-48 near Rishikesh since 10:30, 2 trucks stuck on 2026-10-25";
    expect(sanitizeDescription(text)).toBe(text);
  });
});
