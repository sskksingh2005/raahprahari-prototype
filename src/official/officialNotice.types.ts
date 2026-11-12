export type RestrictionType = 'Closed' | 'One-lane' | 'Vehicles banned';

export interface OfficialNoticeFormData {
  sourceReference: string;       // 1. Source reference (text)
  publicationTime: string;       // 2. Publication time (date + time)
  effectiveStartTime: string;    // 3. Effective start time
  effectiveEndTime: string;      // 3. Effective end time
  segment: string;               // 4. Segment (road ka hissa)
  restriction: RestrictionType;  // 5. Restriction (dropdown)
  jurisdiction: string;          // 6. Jurisdiction (area / authority)
}

export interface OfficialNoticeFormErrors {
  sourceReference?: string;
  publicationTime?: string;
  effectiveStartTime?: string;
  effectiveEndTime?: string;
  segment?: string;
  restriction?: string;
  jurisdiction?: string;
}
export type PublishResult =
  | { kind: "success"; noticeId: string }
  | { kind: "forbidden"; message: string }
  | { kind: "session-expired" }
  | { kind: "error"; message: string };