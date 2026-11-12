import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SEGMENTS } from "@/data/fixtures";
import { usePrefs } from "@/i18n/preferences";
import { OfficialSegmentStatus } from "./OfficialSegmentStatus";
import { PublishFlow } from "./PublishFlow";
import {
  RESTRICTION_TYPES,
  type OfficialNoticeField,
  type OfficialNoticeFormData,
  type OfficialNoticeFormErrors,
  type RestrictionType,
} from "./officialNotice.types";

const EMPTY: OfficialNoticeFormData = {
  sourceReference: "",
  publicationTime: "",
  effectiveStartTime: "",
  effectiveEndTime: "",
  segment: "",
  restriction: "Closed",
  jurisdiction: "",
};

/** Field order on screen, used to focus the first invalid field. */
const FIELD_ORDER: OfficialNoticeField[] = [
  "sourceReference",
  "publicationTime",
  "effectiveStartTime",
  "effectiveEndTime",
  "segment",
  "restriction",
  "jurisdiction",
];

export function validateNotice(
  data: OfficialNoticeFormData,
): OfficialNoticeFormErrors {
  const errors: OfficialNoticeFormErrors = {};
  const source = data.sourceReference.trim();
  if (!source) errors.sourceReference = "official.err.sourceRequired";
  else if (!/^[A-Za-z0-9/#\s-]+$/.test(source))
    errors.sourceReference = "official.err.sourceFormat";
  if (!data.publicationTime)
    errors.publicationTime = "official.err.publicationRequired";
  if (!data.effectiveStartTime)
    errors.effectiveStartTime = "official.err.startRequired";
  if (!data.effectiveEndTime)
    errors.effectiveEndTime = "official.err.endRequired";
  else if (
    data.effectiveStartTime &&
    data.effectiveEndTime <= data.effectiveStartTime
  )
    errors.effectiveEndTime = "official.err.endBeforeStart";
  if (!data.segment.trim()) errors.segment = "official.err.segmentRequired";
  if (!data.jurisdiction.trim())
    errors.jurisdiction = "official.err.jurisdictionRequired";
  return errors;
}

const fieldId = (name: OfficialNoticeField) => `official-${name}`;

export function OfficialNoticeForm() {
  const { t } = usePrefs();
  const [formData, setFormData] = useState<OfficialNoticeFormData>(EMPTY);
  const [errors, setErrors] = useState<OfficialNoticeFormErrors>({});
  const [draft, setDraft] = useState<OfficialNoticeFormData | null>(null);
  const [published, setPublished] = useState<{
    noticeId: string;
    segment: string;
  } | null>(null);
  const readyRef = useRef<HTMLHeadingElement>(null);
  const publishedRef = useRef<HTMLParagraphElement>(null);

  // Move focus to whatever the last action produced, so keyboard and screen
  // reader users land on the result instead of being left on a removed control.
  useEffect(() => {
    if (draft) readyRef.current?.focus();
  }, [draft]);
  useEffect(() => {
    if (published) publishedRef.current?.focus();
  }, [published]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const name = event.target.name as OfficialNoticeField;
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Any edit invalidates a checked draft, so a stale notice cannot be published.
    setDraft(null);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPublished(null);
    const found = validateNotice(formData);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      setDraft(null);
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    setDraft(formData);
  };

  const err = (name: OfficialNoticeField) =>
    errors[name] ? t(errors[name]) : undefined;

  const textField = (
    name: Exclude<OfficialNoticeField, "restriction">,
    label: Parameters<typeof t>[0],
    type: "text" | "datetime-local",
    extra: {
      description?: Parameters<typeof t>[0];
      list?: string;
      autoComplete?: string;
    } = {},
  ) => (
    <Field
      id={fieldId(name)}
      label={t(label)}
      description={extra.description ? t(extra.description) : undefined}
      error={err(name)}
      required
    >
      <Input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        list={extra.list}
        autoComplete={extra.autoComplete ?? "off"}
      />
    </Field>
  );

  return (
    <div className="space-y-4">
      <section aria-labelledby="official-form-title" className="rp-info-card">
        <h2 id="official-form-title">{t("official.formTitle")}</h2>
        <p>{t("official.requiredNote")}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-4">
          {textField(
            "sourceReference",
            "official.field.sourceReference",
            "text",
            {
              description: "official.help.sourceReference",
            },
          )}
          {textField(
            "publicationTime",
            "official.field.publicationTime",
            "datetime-local",
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {textField(
              "effectiveStartTime",
              "official.field.effectiveStart",
              "datetime-local",
            )}
            {textField(
              "effectiveEndTime",
              "official.field.effectiveEnd",
              "datetime-local",
            )}
          </div>
          {textField("segment", "official.field.segment", "text", {
            description: "official.help.segment",
            list: "official-segment-ids",
          })}
          <datalist id="official-segment-ids">
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · km {s.kmStart}–{s.kmEnd}
              </option>
            ))}
          </datalist>
          <OfficialSegmentStatus
            segmentText={formData.segment}
            heading={t("official.statusHeading")}
          />
          <Field
            id={fieldId("restriction")}
            label={t("official.field.restriction")}
            required
          >
            <select
              id={fieldId("restriction")}
              name="restriction"
              value={formData.restriction}
              onChange={handleChange}
              required
              className="rp-field min-h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            >
              {RESTRICTION_TYPES.map((type: RestrictionType) => (
                <option key={type} value={type}>
                  {t(`official.restriction.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          {textField("jurisdiction", "official.field.jurisdiction", "text", {
            description: "official.help.jurisdiction",
          })}
          <Button type="submit" className="min-h-11 w-full sm:w-fit">
            {t("official.submit")}
          </Button>
        </form>
      </section>

      {draft && (
        <section
          aria-labelledby="official-ready-title"
          className="rp-info-card"
        >
          <h2
            id="official-ready-title"
            ref={readyRef}
            tabIndex={-1}
            className="outline-none"
          >
            {t("official.readyTitle")}
          </h2>
          <p>{t("official.draftReady")}</p>
          <div className="mt-3">
            <PublishFlow
              draft={draft}
              onSuccess={(noticeId) => {
                setPublished({ noticeId, segment: draft.segment });
                setDraft(null);
              }}
            />
          </div>
        </section>
      )}

      {published && (
        <section className="rp-info-card">
          <p
            ref={publishedRef}
            role="status"
            tabIndex={-1}
            className="m-0! rounded-lg border border-status-clear bg-status-clear/10 px-3 py-2.5 text-sm font-medium text-foreground! outline-none"
          >
            {t("official.result.success").replace("{id}", published.noticeId)}
          </p>
          <OfficialSegmentStatus
            segmentText={published.segment}
            heading={t("official.publishedStatusHeading")}
            note={t("official.statusNote")}
          />
        </section>
      )}
    </div>
  );
}
