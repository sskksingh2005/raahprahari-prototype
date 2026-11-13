import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import {
  LANE_DIRECTIONS,
  OBSERVATION_SOURCES,
  VEHICLE_APPLICABILITY,
  type ReportDraft,
  type ReportHazard,
} from "@/lib/report-store";
import {
  useAiExtraction,
  type AiErrorKind,
  type AiSuggestions,
} from "@/lib/use-ai-extraction";

type Field = keyof AiSuggestions;
type Option = { value: string; label: string };

const ERROR_KEYS: Record<AiErrorKind, TranslationKey> = {
  network: "ai.errorNetwork",
  invalid_input: "ai.errorInvalid",
  timeout: "ai.errorTimeout",
  rate_limited: "ai.errorRateLimited",
  failed: "ai.errorFailed",
};

const selectClass =
  "h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function SuggestionPanel({
  suggestions,
  hazardOptions,
  onApply,
  onDone,
}: {
  suggestions: AiSuggestions;
  hazardOptions: { value: ReportHazard; label: string }[];
  onApply: (patch: Partial<ReportDraft>) => void;
  onDone: () => void;
}) {
  const { t } = usePrefs();
  const fields: { field: Field; label: string; options: Option[] }[] = [
    {
      field: "hazardType",
      label: t("ai.field.hazard"),
      options: hazardOptions,
    },
    {
      field: "source",
      label: t("obs.review.source"),
      options: OBSERVATION_SOURCES.map((v) => ({
        value: v,
        label: t(`obs.source.${v}`),
      })),
    },
    {
      field: "laneDirection",
      label: t("obs.review.lane"),
      options: LANE_DIRECTIONS.map((v) => ({
        value: v,
        label: t(`obs.lane.${v}`),
      })),
    },
    {
      field: "vehicleApplicability",
      label: t("obs.review.vehicle"),
      options: VEHICLE_APPLICABILITY.map((v) => ({
        value: v,
        label: t(`obs.vehicle.${v}`),
      })),
    },
  ];
  // Only fields the AI actually suggested; "unknown" is not offered as a suggestion.
  const suggested = fields.filter(
    ({ field }) => suggestions[field] !== "unknown",
  );
  const [values, setValues] = useState<Partial<Record<Field, string>>>(() =>
    Object.fromEntries(
      suggested.map(({ field }) => [field, suggestions[field]]),
    ),
  );
  const [open, setOpen] = useState<Field[]>(() =>
    suggested.map(({ field }) => field),
  );

  const close = (field: Field) => {
    const next = open.filter((f) => f !== field);
    setOpen(next);
    if (next.length === 0) onDone();
  };

  return (
    <section
      aria-labelledby="ai-suggestion-title"
      className="mt-3 space-y-3 rounded-xl border border-brand-blue/50 bg-brand-blue/5 p-4"
    >
      <h3
        id="ai-suggestion-title"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <Sparkles aria-hidden className="size-4" /> {t("ai.suggestionTitle")}
      </h3>
      <p className="text-xs text-muted-foreground">{t("ai.suggestionHelp")}</p>
      {suggested.length === 0 ? (
        <>
          <p role="status" className="text-sm">
            {t("ai.none")}
          </p>
          <Button type="button" variant="outline" onClick={onDone}>
            {t("ai.dismiss")}
          </Button>
        </>
      ) : (
        <ul className="space-y-3">
          {fields
            .filter(({ field }) => open.includes(field))
            .map(({ field, label, options }) => {
              const id = `ai-suggest-${field}`;
              return (
                <li key={field} className="space-y-1">
                  <label htmlFor={id} className="block text-sm font-medium">
                    {label}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      id={id}
                      className={selectClass}
                      value={values[field]}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                    >
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      aria-label={`${t("ai.accept")}: ${label}`}
                      onClick={() => {
                        onApply({
                          [field]: values[field],
                        } as Partial<ReportDraft>);
                        close(field);
                      }}
                    >
                      <Check aria-hidden /> {t("ai.accept")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={`${t("ai.reject")}: ${label}`}
                      onClick={() => close(field)}
                    >
                      <X aria-hidden /> {t("ai.reject")}
                    </Button>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </section>
  );
}

/**
 * Optional AI help for the observation step. Suggestions are shown for review
 * and only change the draft when the user accepts a field.
 */
export function AiSuggestionAssist({
  description,
  hazardOptions,
  onApply,
}: {
  description: string;
  hazardOptions: { value: ReportHazard; label: string }[];
  onApply: (patch: Partial<ReportDraft>) => void;
}) {
  const { t } = usePrefs();
  const { state, run, reset } = useAiExtraction();
  const [round, setRound] = useState(0);
  if (!description.trim() && state.status === "idle") return null;
  const loading = state.status === "loading";

  return (
    <div className="mt-3">
      {description.trim() && (
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            aria-busy={loading}
            onClick={() => {
              setRound((n) => n + 1);
              void run(description);
            }}
          >
            {loading ? (
              <Loader2
                aria-hidden
                className="animate-spin motion-reduce:animate-none"
              />
            ) : (
              <Sparkles aria-hidden />
            )}
            {t("ai.suggest")}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("ai.privacy")}
          </p>
        </>
      )}
      {loading && (
        <p role="status" className="mt-2 text-sm">
          {t("ai.loading")}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-status-dnt">
          {t(ERROR_KEYS[state.kind]).replace(
            "{seconds}",
            String(state.retryAfterSeconds ?? 60),
          )}{" "}
          {t("ai.manual")}
        </p>
      )}
      {state.status === "unavailable" && (
        <p role="status" className="mt-2 text-sm">
          {t("ai.unavailable")} {t("ai.manual")}
        </p>
      )}
      {state.status === "signin_required" && (
        <p role="status" className="mt-2 text-sm">
          {t("ai.signinRequired")} {t("ai.manual")}
        </p>
      )}
      {state.status === "success" && (
        <SuggestionPanel
          key={round}
          suggestions={state.suggestions}
          hazardOptions={hazardOptions}
          onApply={onApply}
          onDone={reset}
        />
      )}
    </div>
  );
}
