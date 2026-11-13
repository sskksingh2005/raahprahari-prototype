import {
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  Copy,
  TriangleAlert,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import type { Assignment } from "@/lib/review-queue";
import type { ReportStatus, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

const badge =
  "inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-background/70 px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

/** Review status: icon and label together, never colour alone. */
const STATUS_ICON: Record<
  ReportStatus,
  { icon: LucideIcon; className: string }
> = {
  under_review: { icon: Clock, className: "border-border text-foreground" },
  needs_info: {
    icon: CircleHelp,
    className: "border-status-caution text-status-caution",
  },
  conflicting: {
    icon: TriangleAlert,
    className: "border-status-caution text-status-caution",
  },
  verified: {
    icon: CircleCheck,
    className: "border-status-clear text-status-clear",
  },
  duplicate: { icon: Copy, className: "border-border text-muted-foreground" },
  rejected: { icon: CircleX, className: "border-status-dnt text-status-dnt" },
};

export function ReviewStatusBadge({ status }: { status: ReportStatus }) {
  const { t } = usePrefs();
  const { icon: Icon, className } = STATUS_ICON[status];
  return (
    <span
      data-testid="review-status"
      data-status={status}
      className={cn(badge, className)}
    >
      <Icon aria-hidden className="size-3.5" />
      {t(`status.${status}` as TranslationKey)}
    </span>
  );
}

const ASSIGNMENT_ICON: Record<Assignment, LucideIcon> = {
  unassigned: UserRound,
  mine: UserRoundCheck,
  other: UserRoundX,
};

export function AssignmentBadge({
  assignment,
  assignee,
}: {
  assignment: Assignment;
  assignee?: string;
}) {
  const { t } = usePrefs();
  const Icon = ASSIGNMENT_ICON[assignment];
  return (
    <span
      data-testid="review-assignment"
      data-assignment={assignment}
      className={cn(
        badge,
        assignment === "mine"
          ? "border-link text-link"
          : "border-border text-muted-foreground",
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {t(`review.assignment.${assignment}` as TranslationKey).replace(
        "{name}",
        assignee ?? "",
      )}
    </span>
  );
}

export function SeverityLabel({ severity }: { severity: Severity }) {
  const { t } = usePrefs();
  return (
    <span className="text-xs font-medium text-foreground">
      {t("review.severityLabel").replace(
        "{level}",
        t(`review.severity.${severity}` as TranslationKey),
      )}
    </span>
  );
}

/** Shared styling for the native filter selects, matching the form fields. */
export const selectClass =
  "rp-field min-h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";
