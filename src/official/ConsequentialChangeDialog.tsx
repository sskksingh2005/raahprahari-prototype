// src/official/ConsequentialChangeDialog.tsx
import { useEffect, useRef, useState } from "react";
import type { OfficialNoticeFormData } from "./officialNotice.types";

type NoticeDraft = OfficialNoticeFormData;

interface Props {
  draft: NoticeDraft;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RESTRICTION_LABEL: Record<string, string> = {
  closed: "Road closed",
  Closed: "Road closed",
  "one-lane": "One-lane only",
  "One-lane": "One-lane only",
  "vehicles-banned": "Vehicles banned",
  "Vehicles banned": "Vehicles banned",
};

const fmt = (v: string) => (v ? new Date(v).toLocaleString("en-IN") : "-");

export function ConsequentialChangeDialog({ draft, submitting, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const dlg = ref.current;
    if (dlg && !dlg.open) dlg.showModal();
    return () => dlg?.close();
  }, []);

  // Safe property fallbacks for both naming conventions
  const dAny = draft as any;
  const startTime = draft.effectiveStartTime || dAny.effectiveStart;
  const endTime = draft.effectiveEndTime || dAny.effectiveEnd;

  return (
    <dialog
      ref={ref}
      className="official-dialog"
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!submitting) onCancel();
      }}
    >
      <h2 id="confirm-title">Publish se pehle check karo</h2>
      <p>Neeche ka notice publish hone wala hai. Ek baar dekh lo.</p>

      <dl className="official-summary">
        <dt>Source reference</dt>
        <dd>{draft.sourceReference}</dd>
        <dt>Segment</dt>
        <dd>{draft.segment}</dd>
        <dt>Restriction</dt>
        <dd>{RESTRICTION_LABEL[draft.restriction] || draft.restriction}</dd>
        <dt>Effective</dt>
        <dd>
          {fmt(startTime)} se {fmt(endTime)} tak
        </dd>
        <dt>Publication time</dt>
        <dd>{fmt(draft.publicationTime)}</dd>
        <dt>Jurisdiction</dt>
        <dd>{draft.jurisdiction}</dd>
      </dl>

      <label className="official-ack">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          disabled={submitting}
        />
        Maine details check kar li hain aur main is notice ko publish karna chahta/chahti hu.
      </label>

      <div className="official-actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          Wapas jao
        </button>
        <button type="button" onClick={onConfirm} disabled={!acknowledged || submitting}>
          {submitting ? "Publishing..." : "Publish karo"}
        </button>
      </div>
    </dialog>
  );
}