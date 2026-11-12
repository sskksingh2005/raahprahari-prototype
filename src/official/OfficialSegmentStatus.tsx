import { AdvisoryCard } from "@/components/advisory-card";
import { segmentById } from "@/data/fixtures";
import type { Segment } from "@/lib/types";

/** Resolves the free-text segment field to a known segment id, or undefined. */
export function resolveSegment(value: string): Segment | undefined {
  const needle = value.trim().toLowerCase();
  if (!needle) return undefined;
  return segmentById(needle);
}

/**
 * Shows the public advisory for a segment with the shared AdvisoryCard, so the
 * official workspace presents official/community status exactly as the public
 * pages do. Renders nothing when the text does not match a known segment id.
 */
export function OfficialSegmentStatus({
  segmentText,
  heading,
  note,
}: {
  segmentText: string;
  heading: string;
  note?: string;
}) {
  const segment = resolveSegment(segmentText);
  if (!segment) return null;
  return (
    <section aria-label={heading} className="mt-4">
      <h3 className="text-sm font-semibold mb-2">{heading}</h3>
      <AdvisoryCard segment={segment} showRestrictionDetail />
      {note && <p className="mt-2 text-xs text-gray-400">{note}</p>}
    </section>
  );
}
