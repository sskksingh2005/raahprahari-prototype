// src/official/PublishFlow.tsx
import { useState } from "react";
import { ConsequentialChangeDialog } from "./ConsequentialChangeDialog";
import { publishNotice } from "./publishApi";
import type { OfficialNoticeFormData, PublishResult } from "./officialNotice.types";
import "./official.css";

type NoticeDraft = OfficialNoticeFormData;

type Phase = "idle" | "confirming" | "submitting";

interface Props {
  draft: NoticeDraft;
  onRequestSignIn?: () => void;
  onSuccess?: (noticeId: string) => void;
}

export function PublishFlow({ draft, onRequestSignIn, onSuccess }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<PublishResult | null>(null);

  async function handleConfirm() {
    setPhase("submitting");
    const r = await publishNotice(draft);
    setResult(r);
    if (r.kind === "success" && onSuccess) onSuccess(r.noticeId);
    setPhase("idle"); // dialog band, result banner dikhega
  }

  function signIn() {
    if (onRequestSignIn) onRequestSignIn();
    else window.location.assign("/login");
  }

  return (
    <section aria-live="polite">
      {result?.kind === "success" && (
        <p role="status" className="official-banner ok">
          Notice publish ho gaya. ID: {result.noticeId}
        </p>
      )}

      {result?.kind === "forbidden" && (
        <div role="alert" className="official-banner bad">
          <strong>Permission nahi hai.</strong> {result.message}
          <p>Tumhara draft safe hai. Sahi authority se contact karo.</p>
        </div>
      )}

      {result?.kind === "session-expired" && (
        <div role="alert" className="official-banner warn">
          <strong>Session expire ho gaya.</strong> Notice abhi publish nahi hua.
          <p>Tumhara draft safe hai. Dobara sign in karke phir publish karo.</p>
          <button type="button" onClick={signIn}>
            Sign in karo
          </button>
        </div>
      )}

      {result?.kind === "error" && (
        <p role="alert" className="official-banner bad">
          {result.message} Notice publish nahi hua.
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setResult(null);
          setPhase("confirming");
        }}
        disabled={phase !== "idle"}
      >
        Review &amp; publish
      </button>

      {phase !== "idle" && (
        <ConsequentialChangeDialog
          draft={draft}
          submitting={phase === "submitting"}
          onConfirm={handleConfirm}
          onCancel={() => setPhase("idle")}
        />
      )}
    </section>
  );
}