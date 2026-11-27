import { __toESM } from "../_runtime.mjs";
import { STORAGE_KEYS, cn, useLocalState, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { CircleCheck, CircleQuestionMark, Clock, TriangleAlert, UserRound } from "../_libs/lucide-react3.mjs";
import { CircleX, UserRoundCheck, UserRoundX } from "../_libs/lucide-react13.mjs";
import { Copy } from "../_libs/lucide-react16.mjs";
// node_modules/.nitro/vite/services/ssr/assets/use-review-claims-DnvxVkSa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var badge = "glass-pill inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap";
/** Review status: icon and label together, never colour alone. */
var STATUS_ICON = {
	under_review: {
		icon: Clock,
		className: "border-border text-foreground"
	},
	needs_info: {
		icon: CircleQuestionMark,
		className: "border-status-caution text-status-caution"
	},
	conflicting: {
		icon: TriangleAlert,
		className: "border-status-caution text-status-caution"
	},
	verified: {
		icon: CircleCheck,
		className: "border-status-clear text-status-clear"
	},
	duplicate: {
		icon: Copy,
		className: "border-border text-muted-foreground"
	},
	rejected: {
		icon: CircleX,
		className: "border-status-dnt text-status-dnt"
	}
};
function ReviewStatusBadge({ status }) {
	const { t } = usePrefs();
	const { icon: Icon, className } = STATUS_ICON[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-testid": "review-status",
		"data-status": status,
		className: cn(badge, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			"aria-hidden": true,
			className: "size-3.5"
		}), t(`status.${status}`)]
	});
}
var ASSIGNMENT_ICON = {
	unassigned: UserRound,
	mine: UserRoundCheck,
	other: UserRoundX
};
function AssignmentBadge({ assignment, assignee }) {
	const { t } = usePrefs();
	const Icon = ASSIGNMENT_ICON[assignment];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-testid": "review-assignment",
		"data-assignment": assignment,
		className: cn(badge, assignment === "mine" ? "border-link text-link" : "border-border text-muted-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			"aria-hidden": true,
			className: "size-3.5"
		}), t(`review.assignment.${assignment}`).replace("{name}", assignee ?? "")]
	});
}
function SeverityLabel({ severity }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "glass-pill inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
			"aria-hidden": true,
			className: "size-3.5"
		}), t("review.severityLabel").replace("{level}", t(`review.severity.${severity}`))]
	});
}
/** Shared styling for the native filter selects, matching the form fields. */
var selectClass = "rp-field min-h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";
/** Claims are kept in this browser only. Nothing is sent to a review service. */
function useReviewClaims() {
	const [claims, setClaims] = useLocalState(STORAGE_KEYS.reviewClaims, {});
	return {
		claims,
		claim: (0, import_react.useCallback)((ref) => setClaims((prev) => ({
			...prev,
			[ref]: true
		})), [setClaims]),
		release: (0, import_react.useCallback)((ref) => setClaims((prev) => {
			const next = { ...prev };
			delete next[ref];
			return next;
		}), [setClaims])
	};
}
export { AssignmentBadge, ReviewStatusBadge, SeverityLabel, selectClass, useReviewClaims };
