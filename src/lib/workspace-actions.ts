import type { TranslationKey } from "@/i18n/dictionary";
import type { AccountSession } from "@/lib/account-session";
import type { TransportSource } from "@/lib/sync/sync-engine";
import type { OnlineStatus } from "@/lib/use-online-status";

/**
 * Reviewer audit of what each workspace screen can actually do in this build.
 *
 * Every rule below restates a runtime check that the feature code already
 * makes (the source is cited next to each rule), so the audit cannot claim an
 * action works when the feature would refuse it. Pure: no I/O, no probing.
 *
 * available: works now. It may use the browser or a public service, but needs
 *            no project backend.
 * device:    works, but the result stays in this browser. Nothing is sent.
 * simulated: returns a made-up result (development stub, mock or synthetic data).
 * blocked:   needs a backend that this build does not have.
 */
export type ActionAvailability =
  "available" | "device" | "simulated" | "blocked";

export type WorkspaceScreenId =
  | "roads"
  | "report"
  | "myReports"
  | "review"
  | "account"
  | "official"
  | "contributions"
  | "contact";

export type WorkspaceRoute =
  | "/traveller"
  | "/report"
  | "/reports"
  | "/review"
  | "/official"
  | "/contributions"
  | "/contact";

export interface WorkspaceAction {
  id: string;
  name: TranslationKey;
  availability: ActionAvailability;
  reason: TranslationKey;
}

export interface WorkspaceScreen {
  id: WorkspaceScreenId;
  name: TranslationKey;
  /** null when the screen is a dialog rather than a page (sign-in). */
  route: WorkspaceRoute | null;
  actions: WorkspaceAction[];
}

export interface WorkspaceActionsInput {
  /** From getTransportSource() in sync-engine.ts. */
  transport: TransportSource;
  /** From isSupabaseConfigured() in supabase.ts. */
  supabaseConfigured: boolean;
  session: AccountSession["status"];
  /** import.meta.env.DEV: enables the ?mock= switch in publishApi.ts. */
  devBuild: boolean;
  online: OnlineStatus;
}

const action = (
  id: string,
  availability: ActionAvailability,
  reason: TranslationKey,
): WorkspaceAction => ({
  id,
  name: `audit.action.${id}` as TranslationKey,
  availability,
  reason,
});

/**
 * Report delivery needs a transport AND an access token (syncNow and
 * retryAttachmentUpload in sync-engine.ts). The development stub supplies both
 * itself, so it counts as simulated.
 */
function delivery(input: WorkspaceActionsInput, id: string): WorkspaceAction {
  if (input.transport === "none")
    return action(id, "blocked", "audit.reason.noReportService");
  if (input.transport === "dev_stub" || input.transport === "injected")
    return action(id, "simulated", "audit.reason.devReceiptStub");
  // A real report service, but its token comes only from a signed-in session.
  if (input.session !== "authenticated" && !input.supabaseConfigured)
    return action(id, "blocked", "audit.reason.noSignInForDelivery");
  return action(id, "available", "audit.reason.reportService");
}

/** Sign-in works through Supabase, or through the dev stub's own helper. */
function canSignIn(input: WorkspaceActionsInput) {
  return input.supabaseConfigured || input.transport === "dev_stub";
}

export function deriveWorkspaceActions(
  input: WorkspaceActionsInput,
): WorkspaceScreen[] {
  const signedIn = input.session === "authenticated";
  return [
    {
      id: "roads",
      name: "audit.screen.roads",
      route: "/traveller",
      actions: [
        // findSeededRoutes in routing.ts; RoutingProvider mode is "seeded".
        action("searchRoutes", "simulated", "audit.reason.seededRoutes"),
        action("readAdvisories", "simulated", "audit.reason.seededAdvisories"),
        // geo.ts getCurrentPosition; manual entry remains when it fails.
        action("useLocation", "available", "audit.reason.browserLocation"),
        // OSM_TILE_URL in leaflet-segment-map.tsx.
        input.online === "offline"
          ? action("mapTiles", "blocked", "audit.reason.tilesOffline")
          : action("mapTiles", "available", "audit.reason.tilesOnline"),
        // check.tsx writes rp.savedRoads through the app store.
        action("saveRoad", "device", "audit.reason.savedRoads"),
      ],
    },
    {
      id: "report",
      name: "audit.screen.report",
      route: "/report",
      actions: [
        // saveDraftRecord / saveAttachment write IndexedDB (draft-repository.ts).
        action("saveDraft", "device", "audit.reason.indexedDb"),
        // submitReport only queues an outbox row (queueReportForSync).
        action("submitReport", "device", "audit.reason.submitQueuesOnly"),
        delivery(input, "sendReport"),
        delivery(input, "retryPhoto"),
      ],
    },
    {
      id: "myReports",
      name: "audit.screen.myReports",
      route: "/reports",
      actions: [
        // reports.index.tsx lists only for a non-anonymous account scope.
        signedIn
          ? action(
              "viewMyReports",
              "available",
              "audit.reason.myReportsSignedIn",
            )
          : canSignIn(input)
            ? action(
                "viewMyReports",
                "available",
                "audit.reason.myReportsAfterSignIn",
              )
            : action(
                "viewMyReports",
                "blocked",
                "audit.reason.myReportsNoSignIn",
              ),
      ],
    },
    {
      id: "review",
      name: "audit.screen.review",
      route: "/review",
      actions: [
        // review-queue.ts groups the synthetic REPORTS by their review status.
        action("viewQueues", "simulated", "audit.reason.syntheticReports"),
        // use-review-claims.ts writes rp.reviewClaims.
        action("claimReport", "device", "audit.reason.claimsLocal"),
        // The detail view has no decision control: nothing could store it.
        action("recordDecision", "blocked", "audit.reason.noReviewService"),
      ],
    },
    {
      id: "account",
      name: "audit.screen.account",
      route: null,
      actions: [
        // signInWithEmail in login-dialog.tsx throws SupabaseConfigError when unset.
        input.supabaseConfigured
          ? action("signIn", "available", "audit.reason.supabase")
          : input.transport === "dev_stub"
            ? action("signIn", "simulated", "audit.reason.devSignIn")
            : action("signIn", "blocked", "audit.reason.noSupabase"),
        // signUpWithEmail / requestPasswordReset in auth-flows.ts use Supabase only.
        input.supabaseConfigured
          ? action("signUp", "available", "audit.reason.supabaseEmail")
          : action("signUp", "blocked", "audit.reason.noSupabase"),
        input.supabaseConfigured
          ? action("resetPassword", "available", "audit.reason.supabaseEmail")
          : action("resetPassword", "blocked", "audit.reason.noSupabase"),
      ],
    },
    {
      id: "official",
      name: "audit.screen.official",
      route: "/official",
      actions: [
        // validateNotice in OfficialNoticeForm.tsx runs in the browser.
        action("checkNotice", "available", "audit.reason.checkNotice"),
        // publishApi.ts: ?mock= only in DEV; /api/official/notices has no route.
        input.devBuild
          ? action("publishNotice", "simulated", "audit.reason.publishMock")
          : action("publishNotice", "blocked", "audit.reason.noPublishService"),
      ],
    },
    {
      id: "contributions",
      name: "audit.screen.contributions",
      route: "/contributions",
      actions: [
        // data/contributors.ts and data/ledger.ts are synthetic.
        action(
          "viewPoints",
          "simulated",
          "audit.reason.syntheticContributions",
        ),
        // use-contribution-prefs.ts writes rp.contribSettings / rp.contribAppeals.
        action("privacySettings", "device", "audit.reason.contribSettings"),
        action("saveAppeal", "device", "audit.reason.appealsLocal"),
      ],
    },
    {
      id: "contact",
      name: "audit.screen.contact",
      route: "/contact",
      actions: [
        // contact-page.tsx validates, then only shows a notice. No request.
        action("sendMessage", "blocked", "audit.reason.noMessageService"),
      ],
    },
  ];
}

export function countByAvailability(
  screens: readonly WorkspaceScreen[],
): Record<ActionAvailability, number> {
  const counts: Record<ActionAvailability, number> = {
    available: 0,
    device: 0,
    simulated: 0,
    blocked: 0,
  };
  for (const screen of screens)
    for (const item of screen.actions) counts[item.availability] += 1;
  return counts;
}
