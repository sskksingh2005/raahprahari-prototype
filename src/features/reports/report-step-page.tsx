import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CarFront,
  Check,
  CircleHelp,
  Construction,
  ImagePlus,
  MapPin,
  Mountain,
  RotateCcw,
  Search,
  Send,
  TreePine,
  TriangleAlert,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { DeliveryStatusBadge } from "@/components/delivery-status-badge";
import { scrollContentToTop } from "@/components/motion";
import {
  LocalSaveStatus,
  useLocalSaveStatus,
} from "@/components/local-save-status";
import { SyncNowButton } from "@/components/sync-now-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AiSuggestionAssist } from "@/features/reports/ai-suggestions";
import { ReportLocationMap } from "@/features/reports/report-location-map";
import { Textarea } from "@/components/ui/textarea";
import { PLACES, SEGMENTS, placeById } from "@/data/fixtures";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import { getActiveAccountScope } from "@/lib/account-scope";
import {
  retryAttachmentUpload,
  queueReportForSync,
} from "@/lib/sync/sync-engine";
import {
  loadActiveDraft,
  loadAttachmentBlob,
  getLastSubmittedReportId,
  observeSubmittedReport,
  newReportId,
  removeAttachment,
  saveAttachment,
  saveDraft as saveDraftRecord,
  type getSubmittedReport,
} from "@/lib/draft-repository";
import {
  createEmptyReportDraft,
  readReportDraft,
  toLocalDateTime,
  validateObservation,
  validateHazardType,
  photoValidationCode,
  withObservationDefaults,
  LANE_DIRECTIONS,
  OBSERVATION_SOURCES,
  VEHICLE_APPLICABILITY,
  writeReportDraft,
  decodeReportPhoto,
  type ReportDraft,
  type ReportHazard,
  type ReportLocation,
} from "@/lib/report-store";
import { inCoverage, getCurrentPosition, segmentCandidates } from "@/lib/geo";
import { readPhotoGps } from "@/lib/photo-gps";

export type ReportStep =
  "observation" | "photo" | "location" | "review" | "received";
export type ReportPath =
  | "/"
  | "/report"
  | "/report/photo"
  | "/report/location"
  | "/report/review"
  | "/report/received";

const STEPS = [
  { label: "Photo", path: "/report/photo" },
  { label: "Location", path: "/report/location" },
  { label: "Describe", path: "/report" },
  { label: "Review & send", path: "/report/review" },
] as const;

const HAZARDS: { value: ReportHazard; label: string; icon: typeof Mountain }[] =
  [
    { value: "landslide", label: "Landslide", icon: Mountain },
    { value: "flooding", label: "Flooding", icon: Waves },
    { value: "road_block", label: "Road Block", icon: Construction },
    { value: "fallen_tree", label: "Fallen Tree", icon: TreePine },
    { value: "damaged_bridge", label: "Damaged Bridge", icon: Construction },
    { value: "accident", label: "Accident", icon: CarFront },
    { value: "poor_visibility", label: "Poor Visibility", icon: Wind },
    { value: "other", label: "Other", icon: CircleHelp },
  ];

type SearchOption = {
  key: string;
  label: string;
  lat: number;
  lon: number;
  segment: string;
};

const formatBytes = (size: number) =>
  size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;

/** Device accuracy radius, e.g. "±25 m". */
export const formatAccuracy = (meters: number) => `±${Math.round(meters)} m`;

const formatCoordinates = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;

const isoFromLocalDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};
type SubmittedReport = NonNullable<
  Awaited<ReturnType<typeof getSubmittedReport>>
>;

function optionsFor(query: string): SearchOption[] {
  const search = query.trim().toLocaleLowerCase();
  if (!search) return [];
  const placeOptions = PLACES.filter((place) =>
    place.name.toLocaleLowerCase().includes(search),
  ).map((place) => ({
    key: `place-${place.id}`,
    label: place.name,
    lat: place.lat,
    lon: place.lon,
    // A place is not a road: the segment is chosen from nearby candidates.
    segment: "",
  }));
  const segmentOptions = SEGMENTS.filter((segment) => {
    const from = placeById(segment.from)?.name ?? "";
    const to = placeById(segment.to)?.name ?? "";
    return `${segment.code} ${from} ${to}`.toLocaleLowerCase().includes(search);
  }).map((segment) => {
    const from = placeById(segment.from);
    const to = placeById(segment.to);
    return {
      key: `segment-${segment.id}`,
      label: `${segment.code} · ${from?.name ?? ""} – ${to?.name ?? ""}`,
      lat: ((from?.lat ?? 0) + (to?.lat ?? 0)) / 2,
      lon: ((from?.lon ?? 0) + (to?.lon ?? 0)) / 2,
      segment: segment.code,
    };
  });
  return [...segmentOptions, ...placeOptions].slice(0, 6);
}

/** Stored when no segment is within range; the report can still be confirmed. */
const NO_SEGMENT = "Road segment not identified";

function makeLocation(
  lat: number,
  lon: number,
  query: string,
  roadSegment: string,
  source: ReportLocation["source"],
  accuracyM: number | null = null,
): ReportLocation {
  // Never auto-pick between several nearby segments: leave it empty so the
  // user chooses. A single candidate is pre-filled but still needs confirming.
  const candidates = segmentCandidates(lat, lon);
  const fallbackSegment =
    candidates.length === 1
      ? candidates[0].label
      : candidates.length === 0
        ? NO_SEGMENT
        : "";
  return {
    query,
    roadSegment: roadSegment || fallbackSegment,
    lat,
    lon,
    accuracyM,
    source,
    confirmed: false,
  };
}

export function ReportStepPage({
  step,
  navigate,
  prefillSegmentId,
}: {
  step: ReportStep;
  navigate: (path: ReportPath) => void;
  prefillSegmentId?: string;
}) {
  const { t } = usePrefs();
  const { setSaving, setSaved, setError, ...saveStatus } = useLocalSaveStatus();
  const [draft, setDraft] = useState<ReportDraft>(() => ({
    ...createEmptyReportDraft(),
    observedAt: "",
  }));
  const [draftId, setDraftId] = useState<string | null>(null);
  const draftIdRef = useRef<string | null>(null);
  const confirmedLocationRef = useRef<ReportLocation | null>(null);
  const mountedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoAsset, setPhotoAsset] = useState<{
    id: string;
    url: string;
    error?: string;
  } | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [gpsError, setGpsError] = useState("");
  const [locating, setLocating] = useState(false);
  const [adjustingPin, setAdjustingPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId] = useState(() => {
    if (step !== "received" || typeof window === "undefined") return null;
    return getLastSubmittedReportId();
  });
  const [submittedReport, setSubmittedReport] =
    useState<SubmittedReport | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);

  const setCurrentDraftId = useCallback((id: string | null) => {
    draftIdRef.current = id;
    setDraftId(id);
  }, []);
  const getOrCreateDraftId = useCallback(() => {
    const id = draftIdRef.current ?? draftId ?? newReportId();
    draftIdRef.current = id;
    return id;
  }, [draftId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Read the latest translator through a ref so a language switch does not
  // re-run the restore effect below and overwrite edits not yet autosaved.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    const t = tRef.current;
    let active = true;
    const loadSavedDraft = async () => {
      const legacyDraft = readReportDraft();
      if (legacyDraft) {
        confirmedLocationRef.current = legacyDraft.location?.confirmed
          ? legacyDraft.location
          : null;
        setDraft(
          legacyDraft.observedAt
            ? legacyDraft
            : { ...legacyDraft, observedAt: toLocalDateTime(new Date()) },
        );
        setLocationSearch(legacyDraft.location?.query ?? "");
      }
      try {
        const scope = getActiveAccountScope();
        const saved = await loadActiveDraft(scope);
        if (!active) return;
        if (saved) {
          const restoredDraft = withObservationDefaults(saved.payload);
          confirmedLocationRef.current = restoredDraft.location?.confirmed
            ? restoredDraft.location
            : null;
          setDraft(
            restoredDraft.observedAt
              ? restoredDraft
              : { ...restoredDraft, observedAt: toLocalDateTime(new Date()) },
          );
          setCurrentDraftId(saved.id);
          setLocationSearch(saved.payload.location?.query ?? "");
          setNotice(t("saveStatus.draftRestored"));
        } else {
          if (legacyDraft) {
            setCurrentDraftId(null);
            setNotice(t("saveStatus.draftRestored"));
          } else {
            // Nothing saved: keep anything entered while this was loading.
            setDraft((current) =>
              current.observedAt
                ? current
                : { ...current, observedAt: toLocalDateTime(new Date()) },
            );
            setCurrentDraftId(null);
            const segment = prefillSegmentId
              ? SEGMENTS.find((item) => item.id === prefillSegmentId)
              : undefined;
            if (segment) {
              const from = placeById(segment.from);
              const to = placeById(segment.to);
              const label = `${segment.code} · ${from?.name ?? ""} – ${to?.name ?? ""}`;
              const location = makeLocation(
                ((from?.lat ?? 0) + (to?.lat ?? 0)) / 2,
                ((from?.lon ?? 0) + (to?.lon ?? 0)) / 2,
                label,
                label,
                "manual",
              );
              setDraft((current) =>
                current.location ? current : { ...current, location },
              );
              setLocationSearch((current) => current || label);
            }
          }
        }
      } catch {
        if (active) {
          setStorageError("Could not read the saved draft from this device.");
          setDraft((current) =>
            current.observedAt
              ? current
              : { ...current, observedAt: toLocalDateTime(new Date()) },
          );
        }
      } finally {
        if (active) setLoaded(true);
      }
    };

    if (step === "received") return;
    void loadSavedDraft();
    return () => {
      active = false;
    };
  }, [prefillSegmentId, setCurrentDraftId, step]);

  useEffect(() => {
    if (step !== "received" || !submittedReportId) return;
    const scope = getActiveAccountScope();
    const subscription = observeSubmittedReport(
      submittedReportId,
      scope,
      (report) => setSubmittedReport(report),
      () => setStorageError(t("sync.readFailure")),
    );
    return () => subscription.unsubscribe();
  }, [step, submittedReportId, t]);

  useEffect(() => {
    if (!loaded || step === "received") return;
    if (step === "location" && !draft.photo) {
      navigate("/report/photo");
      return;
    }
    if (step === "observation" && (!draft.photo || !draft.location?.confirmed)) {
      navigate(draft.photo ? "/report/location" : "/report/photo");
      return;
    }
    if (step === "review") {
      const target = !draft.photo
        ? "/report/photo"
        : !draft.location?.confirmed
          ? "/report/location"
          : validateHazardType(draft.hazardType)
            ? "/report"
            : null;
      if (target) navigate(target);
    }
  }, [
    draft.photo,
    draft.location?.confirmed,
    draft.hazardType,
    loaded,
    navigate,
    step,
  ]);

  useEffect(() => {
    if (!loaded || step === "received") return;
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        if (
          !draftId &&
          !draft.hazardType &&
          !draft.description &&
          !draft.location &&
          !draft.photo
        )
          return;
        const scope = getActiveAccountScope();
        const id = getOrCreateDraftId();
        setSaving();
        const result = await saveDraftRecord({
          id,
          accountScope: scope,
          status: "draft",
          payload: draft,
          eventTime: isoFromLocalDate(draft.observedAt),
          observedAtLocal: draft.observedAt,
        });
        if (!active || !mountedRef.current || draftIdRef.current !== id) return;
        if (!result.ok) {
          setError(result.code);
          return;
        }
        setCurrentDraftId(result.id);
        writeReportDraft(draft);
        setSaved(result.savedAt);
      })();
    }, 500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    draft,
    loaded,
    step,
    draftId,
    getOrCreateDraftId,
    setCurrentDraftId,
    setSaving,
    setError,
    setSaved,
  ]);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    const photoId = draft.photo?.id;
    if (!photoId) return;
    loadAttachmentBlob(photoId, getActiveAccountScope())
      .then((blob) => {
        if (!active) return;
        if (!blob) {
          setPhotoAsset({
            id: photoId,
            url: "",
            error:
              "The saved photo is unavailable on this device. You can remove it and choose another.",
          });
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPhotoAsset({ id: photoId, url: objectUrl });
      })
      .catch(() => {
        if (active)
          setPhotoAsset({
            id: photoId,
            url: "",
            error: "Could not load the saved photo from this device.",
          });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [draft.photo?.id]);

  const currentPhotoAsset =
    draft.photo && photoAsset?.id === draft.photo.id ? photoAsset : null;
  const photoPreview = currentPhotoAsset?.url ?? "";
  const photoLoadError = currentPhotoAsset?.error ?? "";

  const updateDraft = (patch: Partial<ReportDraft>) => {
    if (!loaded) return;
    setDraft((current) => ({ ...current, ...patch }));
    setNotice("");
  };

  const updateLocation = (location: ReportLocation) => {
    if (!loaded) return;
    setDraft((current) => ({
      ...current,
      location,
      photo: current.photo
        ? {
            ...current.photo,
            locationTag:
              location.lat !== null && location.lon !== null
                ? formatCoordinates(location.lat, location.lon)
                : "No location tag",
          }
        : null,
    }));
    confirmedLocationRef.current = location.confirmed ? location : null;
    setNotice("");
  };

  const persistDraft = async (nextDraft: ReportDraft = draft) => {
    const scope = getActiveAccountScope();
    const id = getOrCreateDraftId();
    setSaving();
    const result = await saveDraftRecord({
      id,
      accountScope: scope,
      status: "draft",
      payload: nextDraft,
      eventTime: isoFromLocalDate(nextDraft.observedAt),
      observedAtLocal: nextDraft.observedAt,
    });
    if (!mountedRef.current || draftIdRef.current !== id) return null;
    if (!result.ok) {
      setError(result.code);
      setStorageError(result.message);
      return null;
    }
    setCurrentDraftId(result.id);
    writeReportDraft(nextDraft);
    setStorageError("");
    setSaved(result.savedAt);
    return result;
  };

  const saveDraft = () => {
    void persistDraft();
  };

  const ensureDraftIsPersisted = async (nextDraft: ReportDraft = draft) => {
    return persistDraft(nextDraft);
  };

  const persistAndGo = async (path: ReportPath) => {
    if (!loaded) return;
    if (
      draftIdRef.current ||
      draft.hazardType ||
      draft.description ||
      draft.location ||
      draft.photo
    ) {
      const saved = await ensureDraftIsPersisted(draft);
      if (!saved) return;
    }
    go(path);
  };

  const go = (path: ReportPath) => {
    navigate(path);
    scrollContentToTop();
  };

  const continueObservation = async () => {
    if (!loaded) return;
    const nextErrors = validateObservation(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!draft.photo || !draft.location?.confirmed) {
      go(!draft.photo ? "/report/photo" : "/report/location");
      return;
    }
    const saved = await ensureDraftIsPersisted(draft);
    if (!saved) return;
    go("/report/review");
  };

  const choosePhoto = async (file?: File) => {
    if (!loaded) return;
    setPhotoError("");
    if (!file) return;
    // Client-side check before anything is persisted. A rejected file leaves
    // the existing photo, form values and saved draft untouched.
    const validationCode = photoValidationCode(file);
    if (validationCode) {
      setPhotoError(
        t(
          validationCode === "type"
            ? "report.photoTypeErr"
            : validationCode === "empty"
              ? "report.photoEmptyErr"
              : "report.photoSizeErr",
        ),
      );
      return;
    }
    const decoded = await decodeReportPhoto(file);
    if (!mountedRef.current) return;
    if (!decoded) {
      setPhotoError("This image is corrupt or could not be decoded. Choose another JPG or PNG.");
      return;
    }
    const gpsCoordinates = await readPhotoGps(file);
    if (!mountedRef.current) return;
    const photoLocation =
      gpsCoordinates && inCoverage(gpsCoordinates.lat, gpsCoordinates.lon)
        ? makeLocation(
            gpsCoordinates.lat,
            gpsCoordinates.lon,
            "Photo GPS location",
            "",
            "device",
          )
        : null;
    const confirmedLocation =
      confirmedLocationRef.current ??
      (draft.location?.confirmed ? draft.location : null);
    const draftBeforePhoto = confirmedLocation
      ? { ...draft, location: confirmedLocation }
      : draft;
    const scope = getActiveAccountScope();
    const nextDraftId = getOrCreateDraftId();
    // Keep the current photo reference in the saved record until the new
    // attachment has been stored.
    const persisted = await saveDraftRecord({
      id: nextDraftId,
      accountScope: scope,
      status: "draft",
      payload: draftBeforePhoto,
      eventTime: isoFromLocalDate(draftBeforePhoto.observedAt),
      observedAtLocal: draftBeforePhoto.observedAt,
    });
    if (!mountedRef.current || draftIdRef.current !== nextDraftId) return;
    if (!persisted.ok) {
      setError(persisted.code);
      setPhotoError(t("report.photoSaveErr"));
      return;
    }
    const location =
      confirmedLocationRef.current ??
      (draft.location?.confirmed ? draft.location : null) ??
      photoLocation ??
      draftBeforePhoto.location;
    const attachmentResult = await saveAttachment(persisted.id, scope, file);
    if (!mountedRef.current || draftIdRef.current !== nextDraftId) {
      if (attachmentResult.ok) {
        await removeAttachment(attachmentResult.id, scope);
      }
      return;
    }
    if (!attachmentResult.ok) {
      setPhotoError(t("report.photoSaveErr"));
      setError(attachmentResult.code);
      return;
    }
    setCurrentDraftId(persisted.id);
    const nextPhoto = {
      id: attachmentResult.id,
      name: file.name,
      type: file.type || "image/jpeg",
      size: file.size,
      timestamp: Date.now(),
      locationTag:
        location?.lat !== null &&
        location?.lat !== undefined &&
        location.lon !== null
          ? formatCoordinates(location.lat, location.lon)
          : "No location tag",
    };
    const nextDraft = { ...draftBeforePhoto, photo: nextPhoto, location };
    const photoSaved = await saveDraftRecord({
      id: persisted.id,
      accountScope: scope,
      status: "draft",
      payload: nextDraft,
      eventTime: isoFromLocalDate(nextDraft.observedAt),
      observedAtLocal: nextDraft.observedAt,
    });
    if (!photoSaved.ok) {
      await removeAttachment(attachmentResult.id, scope);
      if (mountedRef.current && draftIdRef.current === nextDraftId) {
        setError(photoSaved.code);
        setPhotoError(t("report.photoSaveErr"));
      }
      return;
    }
    if (!mountedRef.current || draftIdRef.current !== nextDraftId) return;
    updateDraft({ photo: nextPhoto, location });
    if (draft.photo) {
      await removeAttachment(draft.photo.id, scope);
    }
  };

  const removePhoto = async () => {
    if (!loaded || !draft.photo) return;
    const scope = getActiveAccountScope();
    const result = await removeAttachment(draft.photo.id, scope);
    if (!result.ok) {
      setPhotoError("Could not remove the photo from this device. Try again.");
      return;
    }
    updateDraft({ photo: null });
    setPhotoError("");
  };

  const chooseSearchOption = (option: SearchOption) => {
    if (!loaded) return;
    setLocationSearch(option.label);
    updateLocation(
      makeLocation(
        option.lat,
        option.lon,
        option.label,
        option.segment,
        "manual",
      ),
    );
    setGpsError("");
  };

  const useDeviceLocation = async () => {
    if (!loaded) return;
    setLocating(true);
    setGpsError("");
    const result = await getCurrentPosition();
    if (!mountedRef.current) return;
    setLocating(false);
    if (!result.ok) {
      setGpsError(
        t(
          result.reason === "denied"
            ? "loc.gpsDenied"
            : result.reason === "unsupported"
              ? "loc.gpsUnsupported"
              : "loc.gpsUnavailable",
        ),
      );
      return;
    }
    if (!inCoverage(result.lat, result.lon)) {
      setGpsError(t("loc.gpsOutside"));
      return;
    }
    const loc = makeLocation(
      result.lat,
      result.lon,
      "Current device location",
      "",
      "device",
      result.accuracyM,
    );
    updateLocation(loc);
    setLocationSearch(loc.query);
  };

  const setMapPoint = (lat: number, lon: number) => {
    if (!loaded) return;
    const location = makeLocation(
      lat,
      lon,
      "Manually adjusted map pin",
      "",
      "manual",
    );
    updateLocation(location);
  };

  /** An explicit segment choice; any location edit clears confirmation. */
  const chooseSegment = (label: string) => {
    if (!loaded || !draft.location) return;
    updateLocation({ ...draft.location, roadSegment: label, confirmed: false });
    setErrors((current) => ({ ...current, location: "" }));
  };

  const confirmLocation = async () => {
    if (!loaded) return;
    if (
      !draft.location ||
      draft.location.lat === null ||
      draft.location.lon === null
    ) {
      setErrors({
        location:
          "Search for a place or road, use device location, or adjust the map pin.",
      });
      return;
    }
    if (!draft.location.roadSegment) {
      setErrors({ location: t("loc.chooseSegmentError") });
      return;
    }
    const next = { ...draft, location: { ...draft.location, confirmed: true } };
    confirmedLocationRef.current = next.location;
    setDraft(next);
    const scope = getActiveAccountScope();
    const id = getOrCreateDraftId();
    const result = await saveDraftRecord({
      id,
      accountScope: scope,
      status: "draft",
      payload: next,
      eventTime: isoFromLocalDate(next.observedAt),
      observedAtLocal: next.observedAt,
    });
    if (!mountedRef.current || draftIdRef.current !== id) return;
    if (!result.ok) {
      setError(result.code);
      setStorageError(result.message);
      return;
    }
    setCurrentDraftId(result.id);
    writeReportDraft(next);
    setStorageError("");
    setErrors({});
    go("/report");
  };

  const submitReport = async () => {
    if (!loaded || submitting) return;
    if (!draft.photo) {
      setErrors({ photo: "Add at least one photo before submitting." });
      go("/report/photo");
      return;
    }
    const observationErrors = validateObservation(draft);
    if (Object.keys(observationErrors).length) {
      setErrors(observationErrors);
      return;
    }
    if (!draft.location?.confirmed) {
      setErrors({ location: "Confirm a report location before submitting." });
      return;
    }
    const scope = getActiveAccountScope();
    const savedReportDraft = {
      ...draft,
      location: { ...draft.location, confirmed: true },
    };
    const id = getOrCreateDraftId();
    setSubmitting(true);
    setSaving();
    const saved = await saveDraftRecord({
      id,
      accountScope: scope,
      status: "draft",
      payload: savedReportDraft,
      eventTime: isoFromLocalDate(savedReportDraft.observedAt),
      observedAtLocal: savedReportDraft.observedAt,
    });
    if (!mountedRef.current || draftIdRef.current !== id) return;
    if (!saved.ok) {
      setSubmitting(false);
      setError(saved.code);
      setStorageError(saved.message);
      return;
    }
    setCurrentDraftId(saved.id);
    const queued = await queueReportForSync(saved.id);
    if (!mountedRef.current || draftIdRef.current !== id) return;
    if (!queued.ok) {
      setSubmitting(false);
      setError(queued.code);
      setStorageError(queued.message);
      return;
    }
    setStorageError("");
    setSaved(saved.savedAt);
    setSubmitting(false);
    go("/report/received");
  };

  // Hide the result list once the typed query has been chosen.
  const searchChosen =
    draft.location?.lat != null && draft.location.query === locationSearch;
  const allMatches = useMemo(
    () => optionsFor(locationSearch),
    [locationSearch],
  );
  const matchingOptions = searchChosen ? [] : allMatches;
  const locLat = draft.location?.lat ?? null;
  const locLon = draft.location?.lon ?? null;
  const nearbyChoices = useMemo(
    () =>
      locLat !== null && locLon !== null
        ? segmentCandidates(locLat, locLon)
        : [],
    [locLat, locLon],
  );
  const currentStep =
    step === "photo"
      ? 1
      : step === "location"
        ? 2
        : step === "observation"
          ? 3
          : 4;

  if (step === "received") {
    return (
      <ReceivedReport
        report={submittedReport}
        hasReportId={Boolean(submittedReportId)}
        navigate={navigate}
        storageError={storageError}
      />
    );
  }

  if (!loaded) {
    return (
      <div className="rp-container max-w-content py-12">
        <p role="status" aria-live="polite">
          {t("saveStatus.restoringDraft")}
        </p>
      </div>
    );
  }

  const title =
    step === "photo"
      ? "Add photo evidence"
      : step === "location"
        ? "Confirm the location"
        : step === "observation"
          ? "Describe the hazard"
          : "Review your report";

  return (
    <div className="min-h-full overflow-x-clip">
      <section
        className="photo-surface relative border-b border-border bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--photo-scrim-a), var(--photo-scrim-b) 60%, var(--photo-scrim-c)), url('/img/banner-strip.png')",
        }}
      >
        <div className="rp-container relative py-6 sm:py-8">
          <div className="mt-1 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm text-muted-foreground">Report a hazard</p>
              <h1 className="rp-page-title">
                {title}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Share what you observed to help others make informed decisions.
              </p>
            </div>
            <ol
              aria-label="Report steps"
              className="grid min-w-72 grid-cols-4 gap-2 sm:min-w-[26rem]"
            >
              {STEPS.map((item, index) => {
                const number = index + 1;
                const active = currentStep === number;
                const complete = currentStep > number;
                return (
                  <li
                    key={item.label}
                    aria-current={active ? "step" : undefined}
                    className={`relative flex min-w-0 flex-col items-center gap-1 text-center ${
                      index > 0
                        ? `before:absolute before:top-4 before:right-[calc(50%+1.25rem)] before:h-0.5 before:w-[calc(100%-1.75rem)] before:rounded-full ${
                            currentStep >= number
                              ? "before:bg-brand-orange"
                              : "before:bg-border"
                          }`
                        : ""
                    }`}
                  >
                    <span
                      className={`glass-pill relative flex size-8 items-center justify-center border-2 text-xs font-semibold ${
                        active
                          ? "border-brand-orange bg-brand-orange text-report-foreground"
                          : complete
                            ? "border-brand-orange text-brand-orange"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {complete ? (
                        <Check aria-hidden className="size-4" />
                      ) : (
                        number
                      )}
                    </span>
                    <span
                      className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <div className="rp-container max-w-content py-5 sm:py-8">
        <div
          className={
            step === "observation"
              ? "grid gap-5 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]"
              : "mx-auto max-w-5xl"
          }
        >
          {step === "observation" && (
            <aside className="glass-strong relative hidden h-[min(36rem,calc(100svh-8rem))] overflow-hidden rounded-2xl border border-border lg:sticky lg:top-[calc(var(--shell-bar-height)+1rem)] lg:block lg:self-start">
              <img
                src="/img/hero-road.png"
                alt="Illustrative mountain road through a Himalayan valley."
                className="absolute inset-0 size-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/5"
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-2xl font-semibold">
                  Local observations matter
                </p>
                <p className="mt-2 max-w-sm text-sm text-foreground/90">
                  Share what you saw. A community report provides information,
                  not an official road restriction.
                </p>
              </div>
            </aside>
          )}
          <div className="min-w-0">
            {storageError && (
              <p
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-xl border border-status-dnt/60 bg-status-dnt/10 p-3 text-sm"
              >
                <TriangleAlert
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-status-dnt"
                />
                <span>{storageError}</span>
              </p>
            )}
            {notice && (
              <p className="glass mb-4 rounded-xl border border-border p-3 text-sm">
                {notice}
              </p>
            )}
            <LocalSaveStatus
              status={saveStatus.status}
              savedAt={saveStatus.savedAt}
              errorCode={saveStatus.errorCode}
              onRetry={() => {
                void saveDraft();
              }}
            />

            {step === "observation" && (
              <section
                aria-labelledby="observation-heading"
                className="glass-strong rounded-2xl border border-border p-4 sm:p-7"
              >
                <h2
                  id="observation-heading"
                  className="font-display text-xl font-semibold"
                >
                  What did you observe?
                </h2>
                <fieldset
                  className="mt-5"
                  aria-describedby={
                    errors.hazardType ? "hazard-error" : undefined
                  }
                >
                  <legend className="mb-3 text-sm font-medium">
                    Choose the condition that best describes the road
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {HAZARDS.map(({ value, label, icon: Icon }) => (
                      <button
                        type="button"
                        key={value}
                        aria-pressed={draft.hazardType === value}
                        onClick={() => {
                          updateDraft({ hazardType: value });
                          setErrors((current) => ({
                            ...current,
                            hazardType: "",
                          }));
                        }}
                        className={`glass relative flex min-h-24 flex-col items-start justify-between gap-3 rounded-xl border-2 p-3 text-left text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          draft.hazardType === value
                            ? "border-brand-orange bg-brand-orange/12 font-semibold shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand-orange)_18%,transparent)]"
                            : "border-border hover:border-brand-orange/60 hover:bg-accent"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex size-10 items-center justify-center rounded-lg ${
                            draft.hazardType === value
                              ? "bg-brand-orange text-report-foreground"
                              : "bg-brand-orange/15 text-brand-orange"
                          }`}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span>{label}</span>
                        {draft.hazardType === value && (
                          <Check
                            aria-hidden
                            className="absolute top-2.5 right-2.5 size-4 text-brand-orange"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.hazardType && (
                    <p
                      id="hazard-error"
                      role="alert"
                      className="mt-2 flex items-start gap-2 text-sm text-foreground"
                    >
                      <TriangleAlert
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-status-dnt"
                      />
                      <span>{errors.hazardType}</span>
                    </p>
                  )}
                </fieldset>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="report-description"
                      className="text-sm font-medium"
                    >
                      Describe the condition
                    </label>
                    <span
                      aria-live="polite"
                      className="text-xs text-muted-foreground"
                    >
                      {draft.description.length}/500
                    </span>
                  </div>
                  <Textarea
                    id="report-description"
                    rows={4}
                    maxLength={500}
                    value={draft.description}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                      errors.description
                        ? "description-error description-count"
                        : "description-count"
                    }
                    onChange={(event) =>
                      updateDraft({ description: event.target.value })
                    }
                    placeholder="Add details that may help someone understand your observation."
                    className="rounded-xl"
                  />
                  <div className="mt-1 flex justify-between gap-3">
                    {errors.description && (
                      <p
                        id="description-error"
                        role="alert"
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <TriangleAlert
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-status-dnt"
                        />
                        <span>{errors.description}</span>
                      </p>
                    )}
                    <span id="description-count" className="ml-auto sr-only">
                      {draft.description.length} of 500 characters
                    </span>
                  </div>
                  <AiSuggestionAssist
                    description={draft.description}
                    hazardOptions={HAZARDS}
                    onApply={(patch) => {
                      updateDraft(patch);
                      if (patch.hazardType)
                        setErrors((current) => ({
                          ...current,
                          hazardType: "",
                        }));
                    }}
                  />
                </div>

                <div className="mt-5 max-w-sm">
                  <label
                    htmlFor="report-observed-at"
                    className="mb-2 block text-sm font-medium"
                  >
                    When did you observe it?
                  </label>
                  <Input
                    id="report-observed-at"
                    type="datetime-local"
                    value={draft.observedAt}
                    aria-invalid={Boolean(errors.observedAt)}
                    aria-describedby={
                      errors.observedAt ? "observed-at-error" : undefined
                    }
                    onChange={(event) =>
                      updateDraft({ observedAt: event.target.value })
                    }
                  />
                  {errors.observedAt && (
                    <p
                      id="observed-at-error"
                      role="alert"
                      className="mt-1.5 flex items-start gap-2 text-sm text-foreground"
                    >
                      <TriangleAlert
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-status-dnt"
                      />
                      <span>{errors.observedAt}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 space-y-5">
                  <p className="text-sm text-muted-foreground">
                    {t("obs.optionalNote")}
                  </p>
                  <ObservationChoice
                    id="report-source"
                    legend={t("obs.source.legend")}
                    value={draft.source}
                    options={OBSERVATION_SOURCES}
                    labelKey={(value) => `obs.source.${value}`}
                    onChange={(source) => updateDraft({ source })}
                  />
                  <ObservationChoice
                    id="report-lane"
                    legend={t("obs.lane.legend")}
                    value={draft.laneDirection}
                    options={LANE_DIRECTIONS}
                    labelKey={(value) => `obs.lane.${value}`}
                    onChange={(laneDirection) => updateDraft({ laneDirection })}
                  />
                  <ObservationChoice
                    id="report-vehicle"
                    legend={t("obs.vehicle.legend")}
                    value={draft.vehicleApplicability}
                    options={VEHICLE_APPLICABILITY}
                    labelKey={(value) => `obs.vehicle.${value}`}
                    onChange={(vehicleApplicability) =>
                      updateDraft({ vehicleApplicability })
                    }
                  />
                </div>

                <p className="mt-4 flex items-start gap-3 rounded-xl border border-status-caution/50 border-l-4 border-l-status-caution bg-status-caution/10 p-3 text-sm">
                  <TriangleAlert
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-status-caution"
                  />
                  <span>
                    Capture evidence only when you are away from traffic. Do not
                    stop in a dangerous area.
                  </span>
                </p>
                <StepActions
                  back={() => void persistAndGo("/report/location")}
                  continueLabel="Continue"
                  onContinue={continueObservation}
                  onSave={saveDraft}
                  backLabel="Back"
                />
              </section>
            )}

            {step === "photo" && (
              <section
                aria-labelledby="photo-heading"
                className="glass-strong rounded-2xl border border-border p-4 sm:p-7"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(15rem,0.7fr)]">
                  <div>
                    <h2
                      id="photo-heading"
                      className="font-display text-xl font-semibold"
                    >
                      Add photo evidence
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Attach one image to support your observation.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => cameraInput.current?.click()}
                        className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-orange/45 bg-brand-orange/5 px-3 text-sm font-semibold transition-colors motion-reduce:transition-none hover:border-brand-orange hover:bg-brand-orange/10"
                      >
                        <span
                          aria-hidden
                          className="flex size-11 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange"
                        >
                          <Camera className="size-5" />
                        </span>
                        Take photo
                      </button>
                      <button
                        type="button"
                        onClick={() => libraryInput.current?.click()}
                        className="glass flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-3 text-center text-sm font-semibold transition-colors motion-reduce:transition-none hover:border-brand-orange hover:bg-brand-orange/10"
                      >
                        <span
                          aria-hidden
                          className="glass-pill flex size-11 items-center justify-center rounded-full text-foreground"
                        >
                          <ImagePlus className="size-5" />
                        </span>
                        Choose existing photo
                      </button>
                    </div>
                    <input
                      ref={cameraInput}
                      type="file"
                      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                      capture="environment"
                      className="sr-only"
                      aria-label="Take a JPG or PNG photo"
                      aria-describedby="photo-format photo-error"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        void choosePhoto(file);
                      }}
                    />
                    <input
                      ref={libraryInput}
                      type="file"
                      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                      className="sr-only"
                      aria-label="Choose an existing JPG or PNG photo"
                      aria-describedby="photo-format photo-error"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        void choosePhoto(file);
                      }}
                    />
                    <p
                      id="photo-format"
                      className="mt-2 text-xs text-muted-foreground"
                    >
                      {t("report.photosHint")}
                    </p>
                    {photoError && (
                      <p
                        id="photo-error"
                        role="alert"
                        className="mt-2 flex items-start gap-2 text-sm text-foreground"
                      >
                        <TriangleAlert
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-status-dnt"
                        />
                        <span>{photoError}</span>
                      </p>
                    )}
                    {photoLoadError && (
                      <p
                        role="alert"
                        className="mt-2 flex items-start gap-2 text-sm text-foreground"
                      >
                        <TriangleAlert
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-status-dnt"
                        />
                        <span>{photoLoadError}</span>
                      </p>
                    )}

                    <div className="mt-6">
                      <h3 className="text-sm font-semibold">Sample examples</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Synthetic examples only; these are not attached to your
                        report.
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <figure className="overflow-hidden rounded-xl border border-border">
                          <img
                            src="/img/hero-road.png"
                            alt=""
                            className="h-28 w-full object-cover"
                          />
                          <figcaption className="p-2 text-xs text-muted-foreground">
                            Mountain road · example
                          </figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-xl border border-border">
                          <img
                            src="/img/hero-mountain.png"
                            alt=""
                            className="h-28 w-full object-cover"
                          />
                          <figcaption className="p-2 text-xs text-muted-foreground">
                            Mountain view · example
                          </figcaption>
                        </figure>
                      </div>
                    </div>
                  </div>

                  <aside className="glass rounded-xl border border-border p-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <ImagePlus aria-hidden className="size-4" /> Photo
                      information
                    </h3>
                    {draft.photo ? (
                      <div className="mt-3 space-y-3">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt={`Selected photo: ${draft.photo.name}`}
                            className="max-h-64 w-full rounded-lg object-contain"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                            Loading saved photo…
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t("report.photoLocal")}
                        </p>
                        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
                          <dt className="text-muted-foreground">File name</dt>
                          <dd className="break-all">{draft.photo.name}</dd>
                          <dt className="text-muted-foreground">File size</dt>
                          <dd>{formatBytes(draft.photo.size)}</dd>
                          <dt className="text-muted-foreground">Timestamp</dt>
                          <dd>
                            {new Date(draft.photo.timestamp).toLocaleString()}
                          </dd>
                          <dt className="text-muted-foreground">
                            Location tag
                          </dt>
                          <dd>{draft.photo.locationTag}</dd>
                        </dl>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={removePhoto}
                        >
                          <X aria-hidden /> Remove photo
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-3 rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                        No photo added
                      </p>
                    )}
                  </aside>
                </div>
                <p className="mt-5 rounded-xl border border-status-caution/50 bg-status-caution/10 p-3 text-sm">
                  {t("report.photoGpsInfo")}
                </p>
                <StepActions
                  back={() => void persistAndGo("/")}
                  continueLabel="Continue"
                  onContinue={async () => {
                    if (!draft.photo || photoLoadError) {
                      setPhotoError(
                        !draft.photo
                          ? "Add at least one photo to continue."
                          : "The saved photo is unavailable. Remove it or choose another photo.",
                      );
                      return;
                    }
                    const saved = await ensureDraftIsPersisted(draft);
                    if (!saved) return;
                    go("/report/location");
                  }}
                  onSave={saveDraft}
                />
              </section>
            )}

            {step === "location" && (
              <section
                aria-labelledby="location-heading"
                className="glass-strong rounded-2xl border border-border p-4 sm:p-7"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2
                      id="location-heading"
                      className="font-display text-xl font-semibold"
                    >
                      Confirm the location
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Check the map pin and road segment before continuing.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={locating}
                    onClick={useDeviceLocation}
                  >
                    <MapPin aria-hidden />{" "}
                    {locating ? "Finding location…" : "Use current location"}
                  </Button>
                </div>

                <div className="relative mt-5">
                  <label
                    htmlFor="report-location-search"
                    className="mb-2 block text-sm font-medium"
                  >
                    Search road or place
                  </label>
                  <div className="relative">
                    <Search
                      aria-hidden
                      className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
                    />
                    <Input
                      id="report-location-search"
                      value={locationSearch}
                      onChange={(event) => {
                        setLocationSearch(event.target.value);
                        if (loaded) {
                          setDraft((current) => ({
                            ...current,
                            location: current.location
                              ? {
                                  ...current.location,
                                  query: event.target.value,
                                  confirmed: false,
                                }
                              : {
                                  query: event.target.value,
                                  roadSegment: "",
                                  lat: null,
                                  lon: null,
                                  accuracyM: null,
                                  source: null,
                                  confirmed: false,
                                },
                          }));
                        }
                      }}
                      aria-describedby={`location-search-help${gpsError ? " location-error" : ""}${errors.location ? " location-validation-error" : ""}`}
                      aria-invalid={Boolean(errors.location)}
                      placeholder="Search a place or road code"
                      className="pl-10"
                    />
                  </div>
                  <p
                    id="location-search-help"
                    className="mt-1 text-xs text-muted-foreground"
                  >
                    Search is limited to this prototype’s synthetic location
                    list.
                  </p>
                  {matchingOptions.length > 1 && (
                    <p role="status" className="mt-2 text-sm font-medium">
                      {t("loc.multipleMatches")}
                    </p>
                  )}
                  {matchingOptions.length > 0 && (
                    <ul
                      role="listbox"
                      aria-label="Matching places and roads"
                      className="glass-strong absolute z-(--z-content) mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border p-1"
                    >
                      {matchingOptions.map((option) => (
                        <li
                          key={option.key}
                          role="option"
                          aria-selected={false}
                        >
                          <button
                            type="button"
                            className="min-h-11 w-full rounded-lg px-3 text-left text-sm hover:bg-accent"
                            onClick={() => chooseSearchOption(option)}
                          >
                            <span className="block font-medium">
                              {option.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {option.segment || t("loc.placeOption")}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {gpsError && (
                  <p
                    id="location-error"
                    role="status"
                    className="mt-3 rounded-xl border border-status-caution/50 bg-status-caution/10 p-3 text-sm"
                  >
                    {gpsError}
                  </p>
                )}

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)]">
                  <div>
                    <ReportLocationMap
                      lat={draft.location?.lat ?? null}
                      lon={draft.location?.lon ?? null}
                      onChange={setMapPoint}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAdjustingPin((value) => !value)}
                      >
                        <RotateCcw aria-hidden />{" "}
                        {adjustingPin ? "Finish adjusting" : "Adjust location"}
                      </Button>
                      {adjustingPin && (
                        <span className="self-center text-xs text-muted-foreground">
                          Click the map or focus it and use arrow keys.
                        </span>
                      )}
                    </div>
                  </div>
                  <aside className="glass rounded-xl border border-border p-4">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <MapPin
                        aria-hidden
                        className="size-4 text-brand-orange"
                      />{" "}
                      Location Details
                    </h3>
                    <dl className="mt-4 space-y-4 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Road / segment
                        </dt>
                        <dd className="mt-1 font-medium">
                          {draft.location?.roadSegment ||
                            t("loc.segmentNotChosen")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Coordinates
                        </dt>
                        <dd className="mt-1 font-mono text-xs">
                          {draft.location?.lat !== null &&
                          draft.location?.lat !== undefined &&
                          draft.location.lon !== null
                            ? `${formatCoordinates(
                                draft.location.lat,
                                draft.location.lon,
                              )}${
                                draft.location.accuracyM != null
                                  ? ` (${formatAccuracy(draft.location.accuracyM)})`
                                  : ""
                              }`
                            : "Not selected"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Location accuracy
                        </dt>
                        <dd className="mt-1">
                          {draft.location?.accuracyM !== null &&
                          draft.location?.accuracyM !== undefined
                            ? formatAccuracy(draft.location.accuracyM)
                            : draft.location?.lat !== null &&
                                draft.location?.lat !== undefined
                              ? t("loc.accuracyApprox")
                              : t("loc.accuracyUnknown")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          {t("loc.statusLabel")}
                        </dt>
                        <dd className="mt-1" aria-live="polite">
                          {draft.location?.confirmed
                            ? t("loc.statusConfirmed")
                            : t("loc.statusUnconfirmed")}
                        </dd>
                      </div>
                    </dl>
                    {nearbyChoices.length > 1 && (
                      <fieldset className="mt-4">
                        <legend className="mb-2 text-sm font-medium">
                          {t("loc.chooseSegment")}
                        </legend>
                        <RadioGroup
                          value={
                            nearbyChoices.some(
                              (c) => c.label === draft.location?.roadSegment,
                            )
                              ? draft.location?.roadSegment
                              : ""
                          }
                          onValueChange={chooseSegment}
                          className="gap-1"
                        >
                          {nearbyChoices.map((choice) => (
                            <div
                              key={choice.id}
                              className="flex min-h-11 items-center gap-2"
                            >
                              <RadioGroupItem
                                value={choice.label}
                                id={`segment-choice-${choice.id}`}
                              />
                              <Label
                                htmlFor={`segment-choice-${choice.id}`}
                                className="font-normal"
                              >
                                {choice.label}{" "}
                                <span className="text-xs text-muted-foreground">
                                  {t("loc.kmAway").replace(
                                    "{km}",
                                    choice.km.toFixed(1),
                                  )}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </fieldset>
                    )}
                    {adjustingPin && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <label
                          className="text-xs text-muted-foreground"
                          htmlFor="pin-latitude"
                        >
                          Latitude
                          <Input
                            id="pin-latitude"
                            type="number"
                            step="0.0001"
                            min="28.7"
                            max="31.5"
                            value={draft.location?.lat ?? ""}
                            onChange={(event) => {
                              const lat = Number(event.target.value);
                              if (
                                event.target.value &&
                                Number.isFinite(lat) &&
                                lat >= 28.7 &&
                                lat <= 31.5 &&
                                draft.location &&
                                draft.location.lon !== null
                              )
                                setMapPoint(lat, draft.location.lon);
                            }}
                            className="mt-1"
                          />
                        </label>
                        <label
                          className="text-xs text-muted-foreground"
                          htmlFor="pin-longitude"
                        >
                          Longitude
                          <Input
                            id="pin-longitude"
                            type="number"
                            step="0.0001"
                            min="77.5"
                            max="81.1"
                            value={draft.location?.lon ?? ""}
                            onChange={(event) => {
                              const lon = Number(event.target.value);
                              if (
                                event.target.value &&
                                Number.isFinite(lon) &&
                                lon >= 77.5 &&
                                lon <= 81.1 &&
                                draft.location?.lat !== null &&
                                draft.location?.lat !== undefined
                              )
                                setMapPoint(draft.location.lat, lon);
                            }}
                            className="mt-1"
                          />
                        </label>
                      </div>
                    )}
                  </aside>
                </div>
                {errors.location && (
                  <p
                    id="location-validation-error"
                    role="alert"
                    className="mt-3 flex items-start gap-2 text-sm text-foreground"
                  >
                    <TriangleAlert
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-status-dnt"
                    />
                    <span>{errors.location}</span>
                  </p>
                )}
                <p className="mt-5 rounded-xl border border-status-caution/50 bg-status-caution/10 p-3 text-sm">
                  Location access is optional. If permission is denied, search
                  manually or place the pin on the map.
                </p>
                <StepActions
                  back={() => void persistAndGo("/report/photo")}
                  continueLabel={t("loc.confirm")}
                  onContinue={confirmLocation}
                  onSave={saveDraft}
                />
              </section>
            )}

            {step === "review" && (
              <section
                aria-labelledby="review-heading"
                className="glass-strong rounded-2xl border border-border p-4 sm:p-7"
              >
                <h2
                  id="review-heading"
                  className="font-display text-xl font-semibold"
                >
                  Review your report
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check the details before saving this observation on your
                  device.
                </p>
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  <ReviewSection
                    title="Hazard details"
                    edit={() => go("/report")}
                  >
                    <p className="font-medium">
                      {HAZARDS.find(({ value }) => value === draft.hazardType)
                        ?.label ?? "Not selected"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                      {draft.description || "No description provided"}
                    </p>
                  </ReviewSection>
                  <ReviewSection
                    title="Photo evidence"
                    edit={() => go("/report/photo")}
                  >
                    {draft.photo ? (
                      <div className="flex items-center gap-3">
                        {photoPreview && (
                          <img
                            src={photoPreview}
                            alt=""
                            className="size-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate">{draft.photo.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(draft.photo.size)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No photo attached</p>
                    )}
                  </ReviewSection>
                  <ReviewSection
                    title="Location"
                    edit={() => go("/report/location")}
                  >
                    <p>{draft.location?.roadSegment ?? "Not selected"}</p>
                    {draft.location?.lat !== null &&
                      draft.location?.lat !== undefined &&
                      draft.location.lon !== null && (
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {formatCoordinates(
                            draft.location.lat,
                            draft.location.lon,
                          )}
                        </p>
                      )}
                  </ReviewSection>
                  <ReviewSection
                    title={t("obs.review.title")}
                    edit={() => go("/report")}
                  >
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                      <dt className="text-muted-foreground">
                        {t("obs.review.source")}
                      </dt>
                      <dd>{t(`obs.source.${draft.source}`)}</dd>
                      <dt className="text-muted-foreground">
                        {t("obs.review.lane")}
                      </dt>
                      <dd>{t(`obs.lane.${draft.laneDirection}`)}</dd>
                      <dt className="text-muted-foreground">
                        {t("obs.review.vehicle")}
                      </dt>
                      <dd>{t(`obs.vehicle.${draft.vehicleApplicability}`)}</dd>
                    </dl>
                  </ReviewSection>
                  <ReviewSection
                    title={t("segment.observationTime")}
                    edit={() => go("/report")}
                  >
                    <p>
                      {draft.observedAt
                        ? new Date(draft.observedAt).toLocaleString()
                        : "Not specified"}
                    </p>
                  </ReviewSection>
                </div>
                <p className="mt-4 rounded-xl border border-status-caution/50 bg-status-caution/10 p-4 text-sm font-medium">
                  Your report will be subject to review and is not an official
                  road closure.
                </p>
                {Object.keys(errors).length > 0 && (
                  <p
                    role="alert"
                    className="mt-3 flex items-start gap-2 text-sm text-foreground"
                  >
                    <TriangleAlert
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-status-dnt"
                    />
                    <span>
                      Review the observation and location details before
                      submitting.
                    </span>
                  </p>
                )}
                <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => go("/report/location")}
                  >
                    <ArrowLeft aria-hidden /> Back to location
                  </Button>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={saveDraft}
                    >
                      Save draft
                    </Button>
                    <Button
                      type="button"
                      onClick={submitReport}
                      disabled={submitting}
                    >
                      <Send aria-hidden />{" "}
                      {submitting ? "Submitting…" : "Submit report"}
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepActions({
  back,
  onContinue,
  onSave,
  continueLabel,
  backLabel = "Back",
}: {
  back: () => void;
  onContinue: () => void;
  onSave: () => void;
  continueLabel: string;
  backLabel?: string;
}) {
  return (
    <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row">
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button type="button" variant="ghost" onClick={back}>
          <ArrowLeft aria-hidden /> {backLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onSave}>
          Save draft
        </Button>
      </div>
      <Button type="button" onClick={onContinue}>
        {continueLabel}
        <ArrowRight aria-hidden />
      </Button>
    </div>
  );
}

/** Optional single-choice observation field; "unknown" is a real, explicit choice. */
function ObservationChoice<T extends string>({
  id,
  legend,
  value,
  options,
  labelKey,
  onChange,
}: {
  id: string;
  legend: string;
  value: T;
  options: readonly T[];
  labelKey: (value: T) => TranslationKey;
  onChange: (value: T) => void;
}) {
  const { t } = usePrefs();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as T)}
        className="grid gap-1 sm:grid-cols-2"
      >
        {options.map((option) => (
          <div key={option} className="flex min-h-11 items-center gap-2">
            <RadioGroupItem value={option} id={`${id}-${option}`} />
            <Label htmlFor={`${id}-${option}`} className="font-normal">
              {t(labelKey(option))}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

function ReviewSection({
  title,
  edit,
  children,
}: {
  title: string;
  edit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <Button type="button" variant="ghost" className="h-11" onClick={edit}>
          Edit
        </Button>
      </div>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
}

function ReceivedReport({
  report,
  hasReportId,
  navigate,
  storageError,
}: {
  report: SubmittedReport | null;
  hasReportId: boolean;
  navigate: (path: ReportPath) => void;
  storageError: string;
}) {
  const { t } = usePrefs();
  const receipt = report?.outbox.metadataReceipt;

  return (
    <div
      className="photo-surface relative flex min-h-[70svh] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-10"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--photo-scrim-a), var(--photo-scrim-b) 60%, var(--photo-scrim-c)), url('/img/hero-mountain.png')",
      }}
    >
      <section
        aria-labelledby="report-saved-heading"
        className="glass-strong w-full max-w-xl rounded-2xl border border-border p-5 sm:p-8"
      >
        <div className="mt-5 flex size-14 items-center justify-center rounded-full border border-brand-orange text-brand-orange">
          <Check aria-hidden className="size-7" />
        </div>
        <h1
          id="report-saved-heading"
          className="rp-page-title mt-4"
        >
          {t("sync.savedReportHeading")}
        </h1>
        <div className="mt-4">
          <DeliveryStatusBadge outbox={report?.outbox ?? null} />
        </div>
        <div className="mt-3">
          <SyncNowButton />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("sync.notOfficialClosure")}
        </p>
        {report ? (
          <div className="glass mt-5 rounded-xl border border-border p-4">
            <p className="break-all font-mono text-sm">{report.draft.id}</p>
            <div className="mt-3 grid gap-2 text-sm">
              <p>
                <span className="font-medium">{t("sync.observed")}: </span>
                {report.draft.eventTime
                  ? new Date(report.draft.eventTime).toLocaleString()
                  : t("sync.unknownTime")}
              </p>
              <p>
                {receipt ? (
                  <>
                    <span className="font-medium">
                      {t("sync.serverReceived")}:{" "}
                    </span>
                    {new Date(receipt.receivedAt).toLocaleString()}
                  </>
                ) : (
                  t("sync.notDeliveredYet")
                )}
              </p>
            </div>
            {report.attachments.length ? (
              <ul className="mt-4 space-y-3 border-t border-border pt-3">
                {report.attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="break-all text-sm font-medium">
                        {attachment.name}
                      </p>
                      <AttachmentDeliveryStatus attachment={attachment} />
                    </div>
                    {attachment.uploadState === "failed" ? (
                      <RetryAttachmentButton
                        reportId={report.draft.id}
                        attachmentId={attachment.id}
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : storageError ? (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 text-sm text-foreground"
          >
            <TriangleAlert
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-status-dnt"
            />
            <span>{storageError}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {hasReportId
              ? t("sync.loadingReport")
              : t("sync.noSubmittedReport")}
          </p>
        )}
        {report ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("sync.deliveryLimits")}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Back to home
          </Button>
        </div>
      </section>
    </div>
  );
}

function AttachmentDeliveryStatus({
  attachment,
}: {
  attachment: SubmittedReport["attachments"][number];
}) {
  const { t } = usePrefs();
  const status = attachment.uploadState;
  const label =
    status === "uploaded"
      ? t("sync.uploaded")
      : status === "uploading"
        ? t("sync.uploading")
        : status === "failed"
          ? t("sync.photoFailed")
          : t("sync.photoPending");

  return (
    <p className="text-xs text-muted-foreground" aria-live="polite">
      {label}
      {status === "failed" && attachment.uploadError
        ? `: ${attachment.uploadError}`
        : ""}
    </p>
  );
}

function RetryAttachmentButton({
  reportId,
  attachmentId,
}: {
  reportId: string;
  attachmentId: string;
}) {
  const { t } = usePrefs();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const retry = async () => {
    setBusy(true);
    try {
      const result = await retryAttachmentUpload(reportId, attachmentId);
      setError(!result.ok);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        className="min-h-10"
        disabled={busy}
        onClick={() => void retry()}
      >
        {busy ? t("sync.uploading") : t("sync.retryUpload")}
      </Button>
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 text-xs text-foreground"
        >
          <TriangleAlert
            aria-hidden
            className="mt-0.5 size-3.5 shrink-0 text-status-dnt"
          />
          <span>{t("sync.uploadFailedMessage")}</span>
        </p>
      ) : null}
    </div>
  );
}
