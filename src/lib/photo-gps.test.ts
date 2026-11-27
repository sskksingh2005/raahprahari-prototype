import { beforeEach, describe, expect, it, vi } from "vitest";

const gps = vi.hoisted(() => vi.fn());

vi.mock("exifr", () => ({ default: { gps } }));

import { readPhotoGps } from "@/lib/photo-gps";

describe("readPhotoGps", () => {
  beforeEach(() => gps.mockReset());

  it("returns finite GPS coordinates within geographic bounds", async () => {
    gps.mockResolvedValue({ latitude: 30.555, longitude: 79.5643 });
    const file = new File(["photo"], "road.jpg", { type: "image/jpeg" });

    await expect(readPhotoGps(file)).resolves.toEqual({
      lat: 30.555,
      lon: 79.5643,
    });
    expect(gps).toHaveBeenCalledWith(file);
  });

  it.each([
    undefined,
    { latitude: Number.NaN, longitude: 79.5 },
    { latitude: 91, longitude: 79.5 },
    { latitude: 30, longitude: -181 },
  ])(
    "returns no coordinates for missing or invalid GPS data",
    async (value) => {
      gps.mockResolvedValue(value);
      const file = new File(["photo"], "road.jpg", { type: "image/jpeg" });

      await expect(readPhotoGps(file)).resolves.toBeNull();
    },
  );
});
