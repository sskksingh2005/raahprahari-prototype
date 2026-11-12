import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/i18n/preferences";
import { cn } from "@/lib/utils";
import { ConsequentialChangeDialog } from "./ConsequentialChangeDialog";
import { publishNotice } from "./publishApi";
import type {
  OfficialNoticeFormData,
  PublishResult,
} from "./officialNotice.types";

type Phase = "idle" | "confirming" | "submitting";

interface Props {
  draft: OfficialNoticeFormData;
  /** Shown only when supplied. There is no sign-in page in this build. */
  onRequestSignIn?: () => void;
  onSuccess?: (noticeId: string) => void;
}

const bannerClass =
  "rounded-lg border px-3 py-2.5 text-sm text-foreground [&_strong]:font-semibold";

export function PublishFlow({ draft, onRequestSignIn, onSuccess }: Props) {
  const { t } = usePrefs();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<PublishResult | null>(null);
  // A fresh dialog each time it opens, so the acknowledgement starts unchecked.
  const [openCount, setOpenCount] = useState(0);
  const inFlight = useRef(false);
  const reviewRef = useRef<HTMLButtonElement>(null);

  async function handleConfirm() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPhase("submitting");
    try {
      const outcome = await publishNotice(draft);
      setResult(outcome);
      setPhase("idle");
      if (outcome.kind === "success") onSuccess?.(outcome.noticeId);
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <div className="space-y-3">
      {/* Failures stay here; success is announced by the parent form. */}
      {result?.kind === "forbidden" && (
        <div
          role="alert"
          className={cn(bannerClass, "border-status-dnt bg-status-dnt/10")}
        >
          <strong>{t("official.result.forbiddenTitle")}</strong>{" "}
          {t("official.result.forbidden")}
        </div>
      )}
      {result?.kind === "session-expired" && (
        <div
          role="alert"
          className={cn(
            bannerClass,
            "border-status-caution bg-status-caution/10",
          )}
        >
          <strong>{t("official.result.expiredTitle")}</strong>{" "}
          {t("official.result.expired")}
          {onRequestSignIn && (
            <Button
              type="button"
              variant="outline"
              className="mt-2 min-h-11"
              onClick={onRequestSignIn}
            >
              {t("official.result.signIn")}
            </Button>
          )}
        </div>
      )}
      {result?.kind === "error" && (
        <p
          role="alert"
          className={cn(bannerClass, "border-status-dnt bg-status-dnt/10")}
        >
          {result.reason === "network"
            ? t("official.result.network")
            : t("official.result.server").replace(
                "{status}",
                String(result.status ?? ""),
              )}
        </p>
      )}

      <Button
        ref={reviewRef}
        type="button"
        className="min-h-11"
        onClick={() => {
          setResult(null);
          setOpenCount((n) => n + 1);
          setPhase("confirming");
        }}
        disabled={phase !== "idle"}
      >
        {t("official.review")}
      </Button>

      <ConsequentialChangeDialog
        key={openCount}
        open={phase !== "idle"}
        draft={draft}
        submitting={phase === "submitting"}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setPhase("idle")}
        returnFocusRef={reviewRef}
      />
    </div>
  );
}
