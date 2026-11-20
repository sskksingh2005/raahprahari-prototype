import { useId, useState } from "react";
import { CircleHelp, Info, Loader2, ShieldAlert } from "lucide-react";
import { AdvisoryCard } from "@/components/advisory-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import type { Segment } from "@/lib/types";
import { selectClass } from "./review-ui";

export const CLEARANCE_LANES = [
  "unknown",
  "left",
  "right",
  "all",
  "single",
] as const;
export const CLEARANCE_DIRECTIONS = [
  "unknown",
  "forward",
  "reverse",
  "both",
] as const;
export const CLEARANCE_VEHICLES = [
  "unknown",
  "two_wheeler",
  "car",
  "light_goods",
  "bus",
  "heavy_goods",
  "on_foot",
] as const;

export type ClearanceLane = (typeof CLEARANCE_LANES)[number];
export type ClearanceDirection = (typeof CLEARANCE_DIRECTIONS)[number];
export type ClearanceVehicle = (typeof CLEARANCE_VEHICLES)[number];

export interface ClearanceObservationInput {
  segmentId: string;
  /** Epoch milliseconds. Never later than the moment of submission. */
  observedAt: number;
  lane: ClearanceLane;
  direction: ClearanceDirection;
  vehicleType: ClearanceVehicle;
  notes: string;
}

/**
 * Stores the observation for verification. It rejects (throws) when the server
 * does not accept it. Storing one never changes an official closure.
 */
export type ClearanceObservationAdapter = (
  input: ClearanceObservationInput,
) => Promise<void>;

/** `datetime-local` value, in the browser's time zone, for a given instant. */
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Shared clearance observation form. The report flow links to this component
 * instead of copying it. The official closure stays on screen, unchanged,
 * before and after submit: only the approved official process can lift it.
 */
export function ClearanceObservationForm({
  segment,
  onSubmit,
  now = Date.now,
}: {
  segment: Segment;
  onSubmit: ClearanceObservationAdapter;
  /** Clock for the "not in the future" rule. */
  now?: () => number;
}) {
  const { t, place } = usePrefs();
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const [observed, setObserved] = useState("");
  const [lane, setLane] = useState<ClearanceLane>("unknown");
  const [direction, setDirection] = useState<ClearanceDirection>("unknown");
  const [vehicle, setVehicle] = useState<ClearanceVehicle>("unknown");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observedAt = observed ? new Date(observed).getTime() : NaN;
  const timeError: TranslationKey | null = Number.isNaN(observedAt)
    ? "clearance.timeRequired"
    : observedAt > now()
      ? "clearance.timeFuture"
      : null;
  const showTimeError = submitted && timeError !== null;

  const run = async () => {
    if (pending) return;
    setSubmitted(true);
    if (timeError !== null) return;
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      await onSubmit({
        segmentId: segment.id,
        observedAt,
        lane,
        direction,
        vehicleType: vehicle,
        notes: notes.trim(),
      });
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : t("review.act.errorGeneric"),
      );
    } finally {
      setPending(false);
    }
  };

  const directionLabel = (value: ClearanceDirection) =>
    value === "unknown"
      ? t("clearance.unknown")
      : value === "both"
        ? t("clearance.dir.both")
        : t(`clearance.dir.${value}` as TranslationKey)
            .replace("{from}", place(segment.from))
            .replace("{to}", place(segment.to));

  const fieldError = "mt-1 text-sm font-medium text-destructive";

  return (
    <section
      aria-labelledby={id("title")}
      className="rp-info-card glass grid gap-4"
      data-testid="clearance-observation"
    >
      <h2 id={id("title")} className="m-0!">
        {t("clearance.title")}
      </h2>
      <p className="m-0 flex items-start gap-2">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>{t("clearance.intro")}</span>
      </p>

      <AdvisoryCard segment={segment} showRestrictionDetail />

      <p
        data-testid="clearance-status"
        className="m-0 flex items-start gap-2 font-semibold text-foreground"
      >
        <CircleHelp aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>{t("clearance.status")}</span>
      </p>
      <p className="m-0 flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>{t("clearance.closureNote")}</span>
      </p>

      <form
        noValidate
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <div>
          <Label htmlFor={id("time")}>{t("clearance.time")}</Label>
          <Input
            id={id("time")}
            type="datetime-local"
            className="mt-1"
            value={observed}
            max={toLocalInput(now())}
            disabled={pending}
            aria-invalid={showTimeError}
            aria-describedby={showTimeError ? id("time-error") : undefined}
            onChange={(e) => setObserved(e.target.value)}
          />
          {showTimeError && timeError && (
            <p id={id("time-error")} className={fieldError}>
              {t(timeError)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor={id("lane")}>{t("clearance.lane")}</Label>
          <select
            id={id("lane")}
            className={`${selectClass} mt-1`}
            value={lane}
            disabled={pending}
            onChange={(e) => setLane(e.target.value as ClearanceLane)}
          >
            {CLEARANCE_LANES.map((value) => (
              <option key={value} value={value}>
                {value === "unknown"
                  ? t("clearance.unknown")
                  : t(`clearance.lane.${value}` as TranslationKey)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor={id("direction")}>{t("clearance.direction")}</Label>
          <select
            id={id("direction")}
            className={`${selectClass} mt-1`}
            value={direction}
            disabled={pending}
            onChange={(e) =>
              setDirection(e.target.value as ClearanceDirection)
            }
          >
            {CLEARANCE_DIRECTIONS.map((value) => (
              <option key={value} value={value}>
                {directionLabel(value)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor={id("vehicle")}>{t("clearance.vehicle")}</Label>
          <select
            id={id("vehicle")}
            className={`${selectClass} mt-1`}
            value={vehicle}
            disabled={pending}
            onChange={(e) => setVehicle(e.target.value as ClearanceVehicle)}
          >
            {CLEARANCE_VEHICLES.map((value) => (
              <option key={value} value={value}>
                {value === "unknown"
                  ? t("clearance.unknown")
                  : t(`clearance.vehicle.${value}` as TranslationKey)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor={id("notes")}>{t("clearance.notes")}</Label>
          <Textarea
            id={id("notes")}
            className="mt-1"
            rows={3}
            value={notes}
            readOnly={pending}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error !== null && (
          <p
            role="alert"
            data-testid="clearance-error"
            className="m-0 rounded-md border border-destructive p-3 text-sm text-foreground"
          >
            {t("clearance.error").replace("{message}", error)}
          </p>
        )}
        {saved && (
          <p
            role="status"
            data-testid="clearance-saved"
            className="m-0 rounded-md border border-border p-3 text-sm font-medium text-foreground"
          >
            {t("clearance.saved")}
          </p>
        )}

        <Button
          type="submit"
          className="min-h-11 w-full sm:w-fit"
          disabled={pending}
          aria-busy={pending}
        >
          {pending && (
            <Loader2
              aria-hidden
              className="animate-spin motion-reduce:animate-none"
            />
          )}
          {pending ? t("clearance.submitting") : t("clearance.submit")}
        </Button>
      </form>
    </section>
  );
}
