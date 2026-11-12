import {
  CheckCircle2,
  CircleDashed,
  CloudUpload,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useMemo } from "react";
import { usePrefs } from "@/i18n/preferences";
import type {
  AttachmentRecord,
  DraftRecord,
  OutboxRecord,
} from "@/lib/local-db";
import { deriveDeliveryStatus } from "@/lib/sync/delivery-status";

export function DeliveryStepper({
  draft,
  outbox,
  attachments = [],
  reviewOutcome,
}: {
  draft: DraftRecord | null;
  outbox: OutboxRecord | null;
  attachments?: AttachmentRecord[];
  reviewOutcome?: string | null;
}) {
  const { t } = usePrefs();
  const deliveryStatus = deriveDeliveryStatus(outbox);

  const attachmentSummary = useMemo(() => {
    if (!attachments.length) {
      return { state: "not_applicable", label: "Not applicable", failed: false };
    }
    const failed = attachments.some(
      (attachment) => attachment.uploadState === "failed",
    );
    const uploading = attachments.some(
      (attachment) => attachment.uploadState === "uploading",
    );
    const uploaded = attachments.some(
      (attachment) => attachment.uploadState === "uploaded",
    );
    if (failed) return { state: "failed", label: "Photo upload failed", failed: true };
    if (uploading) return { state: "uploading", label: "Uploading media", failed: false };
    if (uploaded) return { state: "uploaded", label: "Media uploaded", failed: false };
    return { state: "pending", label: "Media pending", failed: false };
  }, [attachments]);

  const stages = [
    {
      key: "saved",
      title: "Saved locally",
      status: draft?.savedAt ? new Date(draft.savedAt).toLocaleString() : "Saved locally",
      active: !outbox || deliveryStatus === "saved_not_delivered",
      done: Boolean(draft?.savedAt),
      icon: Save,
      failed: false,
    },
    {
      key: "sending",
      title: "Sending",
      status:
        deliveryStatus === "waiting_for_sign_in"
          ? "Waiting for sign-in"
          : deliveryStatus === "rejected"
            ? `Rejected: ${outbox?.lastErrorMessage ?? "Report rejected"}`
            : deliveryStatus === "retrying"
              ? `Retrying at ${outbox?.nextAttemptAt ? new Date(outbox.nextAttemptAt).toLocaleString() : "soon"}`
              : deliveryStatus === "sending"
                ? "Sending…"
                : "Not delivered",
      active: [
        "sending",
        "retrying",
        "waiting_for_sign_in",
        "rejected",
        "saved_not_delivered",
      ].includes(deliveryStatus),
      done: ["server_received"].includes(deliveryStatus),
      icon: CircleDashed,
      failed: deliveryStatus === "rejected",
    },
    {
      key: "received",
      title: "Server received",
      status: outbox?.metadataReceipt?.receiptId
        ? `Receipt ${outbox.metadataReceipt.receiptId}`
        : "Not delivered yet",
      active:
        deliveryStatus === "server_received" ||
        (!outbox?.metadataReceipt && deliveryStatus !== "saved_not_delivered"),
      done: deliveryStatus === "server_received",
      icon: CheckCircle2,
      failed: false,
    },
    {
      key: "media",
      title: "Media",
      status: attachmentSummary.label,
      active: attachmentSummary.state !== "not_applicable",
      done: attachmentSummary.state === "uploaded",
      icon: CloudUpload,
      failed: attachmentSummary.failed,
    },
  ] as const;

  const reviewStage = reviewOutcome
    ? {
        key: "review",
        title: "Review",
        status: reviewOutcome,
        active: false,
        done: true,
        icon: ShieldAlert,
        failed: false,
      }
    : null;

  const finalStages = reviewStage ? [...stages, reviewStage] : stages;
  const activeIndex = finalStages.findIndex((stage) => stage.active);

  return (
    <div className="space-y-4">
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" aria-label="Delivery stages">
        {finalStages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === activeIndex;
          const isFailed = stage.failed;
          return (
            <li key={stage.key} className="relative">
              <div
                className={[
                  "flex h-full min-h-32 flex-col gap-2 rounded-xl border p-3",
                  isActive ? "border-action-info bg-action-info/5" : "border-border bg-card/40",
                  isFailed ? "border-destructive/60 bg-destructive/5" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon aria-hidden className="size-4" />
                    <span className="text-sm font-medium">{stage.title}</span>
                  </div>
                  {isActive ? (
                    <span aria-hidden className="text-xs uppercase tracking-wide text-muted-foreground">
                      Current
                    </span>
                  ) : null}
                </div>
                <div className="text-sm" role={isFailed ? "alert" : undefined}>
                  <span aria-current={isActive ? "step" : undefined}>{stage.status}</span>
                </div>
                {stage.key === "received" && !outbox?.metadataReceipt ? (
                  <p className="text-xs text-muted-foreground">{t("sync.notDeliveredYet")}</p>
                ) : null}
                {reviewStage && stage.key === "review" ? (
                  <p className="text-xs text-muted-foreground">
                    Received and reviewed do not mean the hazard is verified or confirmed, and neither creates an official road closure.
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      <div aria-live="polite" className="sr-only">
        {finalStages[activeIndex]?.status ?? "Delivery status updated"}
      </div>
    </div>
  );
}
