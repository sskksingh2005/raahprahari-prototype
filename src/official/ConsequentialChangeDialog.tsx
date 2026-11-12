import { useId, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePrefs } from "@/i18n/preferences";
import type { OfficialNoticeFormData } from "./officialNotice.types";

interface Props {
  open: boolean;
  draft: OfficialNoticeFormData;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Receives focus when the dialog closes. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Confirmation step before an official notice is published.
 *
 * Radix Dialog supplies role="dialog", aria-modal, the focus trap, Escape and
 * focus return to the button that opened it. While the notice is being sent,
 * Escape, outside clicks and the close button are all ignored, so the request
 * cannot be abandoned half-way.
 */
export function ConsequentialChangeDialog({
  open,
  draft,
  submitting,
  onConfirm,
  onCancel,
  returnFocusRef,
}: Props) {
  const { t, stamp } = usePrefs();
  const [acknowledged, setAcknowledged] = useState(false);
  const ackId = useId();
  const when = (value: string) => {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? "–" : stamp(ms);
  };

  const close = (next: boolean) => {
    if (next || submitting) return;
    setAcknowledged(false);
    onCancel();
  };

  const rows: [string, string][] = [
    [t("official.field.sourceReference"), draft.sourceReference],
    [t("official.field.segment"), draft.segment],
    [
      t("official.field.restriction"),
      t(`official.restriction.${draft.restriction}`),
    ],
    [
      t("official.dialog.effective"),
      t("official.dialog.range")
        .replace("{start}", when(draft.effectiveStartTime))
        .replace("{end}", when(draft.effectiveEndTime)),
    ],
    [t("official.field.publicationTime"), when(draft.publicationTime)],
    [t("official.field.jurisdiction"), draft.jurisdiction],
  ];

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton={!submitting}
        aria-busy={submitting || undefined}
        onEscapeKeyDown={(event) => {
          if (submitting) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (submitting) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          // Radix only restores focus to a DialogTrigger; this dialog is opened
          // from state, so focus goes back to the button that opened it.
          const target = returnFocusRef?.current;
          if (target?.isConnected) {
            event.preventDefault();
            target.focus();
          }
        }}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {t("official.dialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("official.dialog.description")}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="font-semibold text-foreground">{label}</dt>
              <dd className="m-0 mb-2 break-words text-muted-foreground sm:mb-0">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex items-start gap-3">
          <Checkbox
            id={ackId}
            checked={acknowledged}
            onCheckedChange={(value) => setAcknowledged(value === true)}
            disabled={submitting}
            className="mt-0.5"
          />
          <label htmlFor={ackId} className="text-sm text-foreground">
            {t("official.dialog.ack")}
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => close(false)}
            disabled={submitting}
          >
            {t("official.dialog.back")}
          </Button>
          <Button
            type="button"
            className="min-h-11"
            onClick={onConfirm}
            disabled={!acknowledged || submitting}
          >
            {submitting
              ? t("official.dialog.publishing")
              : t("official.dialog.publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
