import exifr from "exifr";

export type PhotoGpsCoordinates = { lat: number; lon: number };

export async function readPhotoGps(
  file: File,
): Promise<PhotoGpsCoordinates | null> {
  try {
    const coordinates = await exifr.gps(file);
    const { latitude, longitude } = coordinates;
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }
    return { lat: latitude, lon: longitude };
  } catch {
    return null;
  }
}
