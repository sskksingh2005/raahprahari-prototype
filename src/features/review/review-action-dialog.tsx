import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import type { CommunityReport } from "@/lib/types";
import {
  ReviewVersionConflictError,
  type ReviewAction,
  type ReviewDecisionAdapter,
  type ReviewDecisionInput,
} from "./review-decision";
import { selectClass } from "./review-ui";

interface Props {
  action: ReviewAction | null;
  report: CommunityReport;
  /** Reports this one may be merged into. */
  mergeTargets: CommunityReport[];
  onSubmit: ReviewDecisionAdapter;
  onClose: () => void;
  /** The control that opened the dialog; focus goes back to it on close. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
  onDone: (action: ReviewAction) => void;
  /** The review state version the decision is based on. Sent with every action. */
  version?: number;
  /** Refetches the current state after a version conflict. */
  onConflict?: () => Promise<void>;
}

export function ReviewActionDialog({ action, ...rest }: Props) {
  const busy = useRef(false);
  return (
    <Dialog
      open={action !== null}
      onOpenChange={(open) => {
        // Closing mid-request would hide the outcome.
        if (!open && !busy.current) rest.onClose();
      }}
    >
      <DialogContent
        aria-describedby="review-act-desc"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          rest.returnFocusRef.current?.focus();
        }}
      >
        {action && <DialogForm action={action} busy={busy} {...rest} />}
      </DialogContent>
    </Dialog>
  );
}

function DialogForm({
  action,
  report,
  mergeTargets,
  onSubmit,
  onClose,
  onDone,
  version,
  onConflict,
  busy,
}: Props & { action: ReviewAction; busy: React.MutableRefObject<boolean> }) {
  const { t } = usePrefs();
  const [rationale, setRationale] = useState("");
  const [targetRef, setTargetRef] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [refetchError, setRefetchError] = useState<string | null>(null);

  const rationaleMissing = !rationale.trim();
  const targetMissing = action === "merge" && !targetRef;
  const reasonMissing = action === "escalate" && !reason.trim();
  const showRationaleError = submitted && rationaleMissing;
  const showTargetError = submitted && targetMissing;
  const showReasonError = submitted && reasonMissing;

  const run = async () => {
    if (busy.current) return;
    setSubmitted(true);
    if (rationaleMissing || targetMissing || reasonMissing) return;
    // After a conflict the reviewer must explicitly confirm against the new version.
    if (conflict && !confirmed) return;
    const input: ReviewDecisionInput = {
      ref: report.ref,
      action,
      rationale: rationale.trim(),
      ...(action === "merge" ? { targetRef } : {}),
      ...(action === "escalate" ? { reason: reason.trim() } : {}),
      ...(version !== undefined ? { expectedVersion: version } : {}),
    };
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await onSubmit(input);
      busy.current = false;
      onDone(action);
    } catch (e) {
      if (e instanceof ReviewVersionConflictError) {
        // Never overwrite: load the current state, keep the typed text, ask again.
        setConflict(true);
        setConfirmed(false);
        setRefetchError(null);
        try {
          await onConflict?.();
        } catch (refetch) {
          setRefetchError(
            refetch instanceof Error && refetch.message
              ? refetch.message
              : t("review.act.errorGeneric"),
          );
        }
        busy.current = false;
        setPending(false);
        return;
      }
      busy.current = false;
      setPending(false);
      setError(
        e instanceof Error && e.message
          ? e.message
          : t("review.act.errorGeneric"),
      );
    }
  };

  const fieldError = "mt-1 text-sm font-medium text-destructive";

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void run();
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {t(`review.act.title.${action}` as TranslationKey)}
        </DialogTitle>
        <DialogDescription id="review-act-desc">
          {t(`review.act.desc.${action}` as TranslationKey)}{" "}
          {t("review.act.note")}
        </DialogDescription>
      </DialogHeader>

      {action === "merge" && (
        <div>
          <Label htmlFor="review-act-target">{t("review.act.target")}</Label>
          {mergeTargets.length ? (
            <select
              id="review-act-target"
              className={`${selectClass} mt-1`}
              value={targetRef}
              disabled={pending}
              aria-invalid={showTargetError}
              aria-describedby={
                showTargetError ? "review-act-target-error" : undefined
              }
              onChange={(e) => setTargetRef(e.target.value)}
            >
              <option value="">{t("review.act.targetNone")}</option>
              {mergeTargets.map((r) => (
                <option key={r.ref} value={r.ref}>
                  {r.ref}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("review.act.targetEmpty")}
            </p>
          )}
          {showTargetError && (
            <p id="review-act-target-error" className={fieldError}>
              {t("review.act.targetRequired")}
            </p>
          )}
        </div>
      )}

      {action === "escalate" && (
        <div>
          <Label htmlFor="review-act-reason">{t("review.act.reason")}</Label>
          <Input
            id="review-act-reason"
            className="mt-1"
            value={reason}
            disabled={pending}
            aria-invalid={showReasonError}
            aria-describedby={
              showReasonError ? "review-act-reason-error" : undefined
            }
            onChange={(e) => setReason(e.target.value)}
          />
          {showReasonError && (
            <p id="review-act-reason-error" className={fieldError}>
              {t("review.act.reasonRequired")}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="review-act-rationale">{t("review.act.rationale")}</Label>
        <Textarea
          id="review-act-rationale"
          className="mt-1"
          rows={4}
          value={rationale}
          readOnly={pending}
          aria-invalid={showRationaleError}
          aria-describedby={
            showRationaleError ? "review-act-rationale-error" : undefined
          }
          onChange={(e) => setRationale(e.target.value)}
        />
        {showRationaleError && (
          <p id="review-act-rationale-error" className={fieldError}>
            {t("review.act.rationaleRequired")}
          </p>
        )}
      </div>

      {conflict && (
        <div
          role="alert"
          data-testid="review-conflict"
          className="grid gap-3 rounded-md border border-status-caution p-3 text-sm text-foreground"
        >
          <p className="m-0 font-semibold">{t("review.conflict.notice")}</p>
          {refetchError !== null && (
            <p className="m-0">
              {t("review.conflict.refetchFailed").replace(
                "{message}",
                refetchError,
              )}
            </p>
          )}
          <div className="flex items-start gap-2">
            <Checkbox
              id="review-act-confirm"
              checked={confirmed}
              disabled={pending || refetchError !== null}
              aria-invalid={submitted && !confirmed}
              aria-describedby={
                submitted && !confirmed ? "review-act-confirm-error" : undefined
              }
              onCheckedChange={(v) => setConfirmed(v === true)}
            />
            <Label htmlFor="review-act-confirm">
              {t("review.conflict.confirm")}
            </Label>
          </div>
          {submitted && !confirmed && (
            <p id="review-act-confirm-error" className={fieldError}>
              {t("review.conflict.confirmRequired")}
            </p>
          )}
        </div>
      )}

      {error !== null && (
        <div
          role="alert"
          data-testid="review-act-error"
          className="grid gap-2 rounded-md border border-destructive p-3 text-sm text-foreground"
        >
          <p className="m-0">
            {t("review.act.error").replace("{message}", error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            disabled={pending}
            onClick={() => void run()}
          >
            {t("review.act.retry")}
          </Button>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
        >
          {t("review.act.cancel")}
        </Button>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending && (
            <Loader2
              aria-hidden
              data-testid="review-act-spinner"
              className="animate-spin motion-reduce:animate-none"
            />
          )}
          {pending ? t("review.act.submitting") : t("review.act.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}
