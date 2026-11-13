import { z } from "zod";
import { STORAGE_KEYS } from "@/lib/storage";

/**
 * Optional observation details (SU-05). Each defaults to an explicit
 * "unknown"; the UI never forces a guess. These stay in the local draft only:
 * the report API contract does not carry them until the backend agrees it.
 */
export const OBSERVATION_SOURCES = [
  "unknown",
  "firsthand",
  "secondhand",
] as const;
export const LANE_DIRECTIONS = [
  "unknown",
  "full_width",
  "one_lane",
  "roadside",
] as const;
export const VEHICLE_APPLICABILITY = [
  "unknown",
  "all_vehicles",
  "light_vehicles",
  "two_wheelers",
  "no_vehicles",
] as const;

export type ObservationSource = (typeof OBSERVATION_SOURCES)[number];
export type LaneDirection = (typeof LANE_DIRECTIONS)[number];
export type VehicleApplicability = (typeof VEHICLE_APPLICABILITY)[number];

/** Invalid or missing values fall back to "unknown" (older drafts lack them). */
export const ObservationExtrasSchema = z.object({
  source: z.enum(OBSERVATION_SOURCES).catch("unknown"),
  laneDirection: z.enum(LANE_DIRECTIONS).catch("unknown"),
  vehicleApplicability: z.enum(VEHICLE_APPLICABILITY).catch("unknown"),
});

export type ObservationExtras = z.infer<typeof ObservationExtrasSchema>;

export function observationExtras(value: unknown): ObservationExtras {
  return ObservationExtrasSchema.parse(
    typeof value === "object" && value !== null ? value : {},
  );
}

/** Fills the optional observation fields on drafts saved before they existed. */
export function withObservationDefaults(
  draft: Omit<ReportDraft, keyof ObservationExtras> &
    Partial<ObservationExtras>,
): ReportDraft {
  return { ...draft, ...observationExtras(draft) };
}

export const REPORT_HAZARDS = [
  "landslide",
  "flooding",
  "road_block",
  "fallen_tree",
  "damaged_bridge",
  "accident",
  "poor_visibility",
  "other",
] as const;

export type ReportHazard = (typeof REPORT_HAZARDS)[number];

export interface ReportPhoto {
  id: string;
  name: string;
  type: string;
  size: number;
  timestamp: number;
  locationTag: string;
}

export interface ReportLocation {
  query: string;
  roadSegment: string;
  lat: number | null;
  lon: number | null;
  accuracyM: number | null;
  source: "manual" | "device" | null;
  confirmed: boolean;
}

export interface ReportDraft {
  hazardType: ReportHazard | "";
  description: string;
  observedAt: string;
  photo: ReportPhoto | null;
  location: ReportLocation | null;
  source: ObservationSource;
  laneDirection: LaneDirection;
  vehicleApplicability: VehicleApplicability;
}

export interface LocalReport {
  reference: string;
  status: "Saved on this device";
  savedAt: number;
  draft: ReportDraft;
  synthetic: true;
}

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_DATABASE = "raahprahari-report-evidence";
const PHOTO_STORE = "photos";

export const createEmptyReportDraft = (date = new Date()): ReportDraft => ({
  hazardType: "",
  description: "",
  observedAt: toLocalDateTime(date),
  photo: null,
  location: null,
  source: "unknown",
  laneDirection: "unknown",
  vehicleApplicability: "unknown",
});

const pad = (value: number) => String(value).padStart(2, "0");

export function toLocalDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function validateObservation(
  draft: ReportDraft,
  now = new Date(),
): Partial<Record<"hazardType" | "description" | "observedAt", string>> {
  const errors: Partial<
    Record<"hazardType" | "description" | "observedAt", string>
  > = {};
  if (!draft.hazardType) errors.hazardType = "Choose the hazard you observed.";
  if (draft.description.length > 500)
    errors.description = "Description must be 500 characters or fewer.";
  const observed = new Date(draft.observedAt);
  if (!draft.observedAt || Number.isNaN(observed.getTime())) {
    errors.observedAt = "Enter when you observed the hazard.";
  } else if (observed.getTime() > now.getTime()) {
    errors.observedAt = "Observation time cannot be in the future.";
  }
  return errors;
}

export type PhotoValidationCode = "empty" | "type" | "size";

/** Client-side check only; it does not replace server-side validation. */
export function photoValidationCode(file: File): PhotoValidationCode | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const acceptedType = file.type === "image/jpeg" || file.type === "image/png";
  const acceptedExtension =
    extension === "jpg" || extension === "jpeg" || extension === "png";
  if (!acceptedType && !(file.type === "" && acceptedExtension)) return "type";
  if (file.size === 0) return "empty";
  if (file.size > MAX_PHOTO_BYTES) return "size";
  return null;
}

export function validatePhoto(file: File): string | null {
  switch (photoValidationCode(file)) {
    case "type":
      return "Choose a JPG or PNG image.";
    case "empty":
      return "This photo file is empty.";
    case "size":
      return "Photo must be 10 MB or smaller.";
    default:
      return null;
  }
}

export function readReportDraft(): ReportDraft | null {
  if (typeof window === "undefined") return null;
  let value: unknown;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.reportDraft);
    if (!raw) return null;
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    typeof value !== "object" ||
    value === null ||
    !("description" in value) ||
    typeof value.description !== "string" ||
    !("observedAt" in value) ||
    typeof value.observedAt !== "string"
  ) {
    return null;
  }
  const saved = value as Record<string, unknown> & {
    description: string;
    observedAt: string;
  };
  const hazardTypes: readonly ReportHazard[] = REPORT_HAZARDS;
  const hazardType =
    typeof saved.hazardType === "string" &&
    hazardTypes.includes(saved.hazardType as ReportHazard)
      ? (saved.hazardType as ReportHazard)
      : "";
  const photoValue = saved.photo;
  const photo =
    typeof photoValue === "object" &&
    photoValue !== null &&
    "id" in photoValue &&
    typeof photoValue.id === "string" &&
    "name" in photoValue &&
    typeof photoValue.name === "string" &&
    "type" in photoValue &&
    typeof photoValue.type === "string" &&
    "size" in photoValue &&
    typeof photoValue.size === "number" &&
    "timestamp" in photoValue &&
    typeof photoValue.timestamp === "number" &&
    "locationTag" in photoValue &&
    typeof photoValue.locationTag === "string"
      ? {
          id: photoValue.id,
          name: photoValue.name,
          type: photoValue.type,
          size: photoValue.size,
          timestamp: photoValue.timestamp,
          locationTag: photoValue.locationTag,
        }
      : null;
  let location: ReportLocation | null = null;
  if (typeof saved.location === "object" && saved.location !== null) {
    const rawLocation = saved.location as Record<string, unknown>;
    const lat = rawLocation.lat;
    const lon = rawLocation.lon;
    if (
      typeof lat === "number" &&
      Number.isFinite(lat) &&
      typeof lon === "number" &&
      Number.isFinite(lon)
    ) {
      const source =
        rawLocation.source === "device" || rawLocation.method === "gps"
          ? "device"
          : "manual";
      location = {
        query:
          typeof rawLocation.query === "string"
            ? rawLocation.query
            : typeof rawLocation.landmark === "string"
              ? rawLocation.landmark
              : "",
        roadSegment:
          typeof rawLocation.roadSegment === "string"
            ? rawLocation.roadSegment
            : "",
        lat,
        lon,
        accuracyM:
          typeof rawLocation.accuracyM === "number"
            ? rawLocation.accuracyM
            : null,
        source,
        confirmed: rawLocation.confirmed === true,
      };
    }
  }
  return {
    hazardType,
    description: saved.description,
    observedAt: saved.observedAt,
    photo,
    location,
    ...observationExtras(saved),
  };
}

export function writeReportDraft(draft: ReportDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.reportDraft, JSON.stringify(draft));
}

export function clearReportDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.reportDraft);
}

export function readLocalReports(): LocalReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.localReports);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as LocalReport[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalReports(reports: LocalReport[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEYS.localReports,
    JSON.stringify(reports),
  );
}

export function writeLastLocalReport(report: LocalReport) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEYS.lastLocalReport,
    JSON.stringify(report),
  );
}

export function readLastLocalReport(): LocalReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.lastLocalReport);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null && "reference" in value
      ? (value as LocalReport)
      : null;
  } catch {
    return null;
  }
}

export function makeLocalReference(now = new Date()) {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LOCAL-RP-${date}-${suffix}`;
}

function openPhotoDatabase(): Promise<IDBDatabase> {
  if (
    typeof window === "undefined" ||
    typeof window.indexedDB === "undefined"
  ) {
    return Promise.reject(
      new Error("Browser-local photo storage is unavailable."),
    );
  }
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(PHOTO_DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(PHOTO_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open photo storage."));
  });
}

async function runPhotoStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openPhotoDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(PHOTO_STORE, mode);
      const request = run(transaction.objectStore(PHOTO_STORE));
      request.onerror = () =>
        reject(request.error ?? new Error("Photo storage request failed."));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () =>
        reject(
          transaction.error ?? new Error("Photo storage transaction failed."),
        );
      transaction.onabort = () =>
        reject(
          transaction.error ??
            new Error("Photo storage transaction was cancelled."),
        );
    });
  } finally {
    database.close();
  }
}

export async function saveReportPhoto(id: string, file: File) {
  await runPhotoStore("readwrite", (store) => store.put(file, id));
}

export async function loadReportPhoto(id: string) {
  return runPhotoStore<Blob | undefined>("readonly", (store) => store.get(id));
}

export async function removeReportPhoto(id: string) {
  await runPhotoStore("readwrite", (store) => store.delete(id));
}
