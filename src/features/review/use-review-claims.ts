import { useCallback } from "react";
import type { Claims } from "@/lib/review-queue";
import { STORAGE_KEYS, useLocalState } from "@/lib/storage";

/** Claims are kept in this browser only. Nothing is sent to a review service. */
export function useReviewClaims() {
  const [claims, setClaims] = useLocalState<Record<string, true>>(
    STORAGE_KEYS.reviewClaims,
    {},
  );
  const claim = useCallback(
    (ref: string) => setClaims((prev) => ({ ...prev, [ref]: true })),
    [setClaims],
  );
  const release = useCallback(
    (ref: string) =>
      setClaims((prev) => {
        const next = { ...prev };
        delete next[ref];
        return next;
      }),
    [setClaims],
  );
  return { claims: claims as Claims, claim, release };
}
