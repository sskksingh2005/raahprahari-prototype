import type { TranslationKey } from "@/i18n/dictionary";

export type RestrictionType = "Closed" | "One-lane" | "Vehicles banned";

export const RESTRICTION_TYPES: readonly RestrictionType[] = [
  "Closed",
  "One-lane",
  "Vehicles banned",
];

export interface OfficialNoticeFormData {
  sourceReference: string;
  publicationTime: string;
  effectiveStartTime: string;
  effectiveEndTime: string;
  segment: string;
  restriction: RestrictionType;
  jurisdiction: string;
}

export type OfficialNoticeField = keyof OfficialNoticeFormData;

/** Each error is a dictionary key, so it is shown in the reader's language. */
export type OfficialNoticeFormErrors = Partial<
  Record<OfficialNoticeField, TranslationKey>
>;

/** Results carry codes, not prose; the UI turns them into translated text. */
export type PublishResult =
  | { kind: "success"; noticeId: string }
  | { kind: "forbidden" }
  | { kind: "session-expired" }
  | { kind: "error"; reason: "network" | "server"; status?: number };
