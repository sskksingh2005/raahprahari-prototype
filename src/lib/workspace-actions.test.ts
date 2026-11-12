import { describe, expect, it } from "vitest";
import { en, hi } from "@/i18n/dictionary";
import type { AccountSession } from "@/lib/account-session";
import type { TransportSource } from "@/lib/sync/sync-engine";
import type { OnlineStatus } from "@/lib/use-online-status";
import {
  countByAvailability,
  deriveWorkspaceActions,
  type WorkspaceActionsInput,
} from "./workspace-actions";

/** This repository's own build: no .env, so nothing is configured. */
const DEFAULT_BUILD: WorkspaceActionsInput = {
  transport: "none",
  supabaseConfigured: false,
  session: "signed_out",
  devBuild: false,
  online: "online",
};

function find(input: WorkspaceActionsInput, id: string) {
  const all = deriveWorkspaceActions(input).flatMap((screen) => screen.actions);
  const found = all.find((item) => item.id === id);
  if (!found) throw new Error(`No action ${id}`);
  return found;
}

describe("workspace action audit: default build", () => {
  it("blocks everything that needs a backend and says why", () => {
    expect(find(DEFAULT_BUILD, "sendReport")).toMatchObject({
      availability: "blocked",
      reason: "audit.reason.noReportService",
    });
    expect(find(DEFAULT_BUILD, "retryPhoto").availability).toBe("blocked");
    for (const id of ["signIn", "signUp", "resetPassword"])
      expect(find(DEFAULT_BUILD, id)).toMatchObject({
        availability: "blocked",
        reason: "audit.reason.noSupabase",
      });
    expect(find(DEFAULT_BUILD, "viewMyReports").reason).toBe(
      "audit.reason.myReportsNoSignIn",
    );
    expect(find(DEFAULT_BUILD, "publishNotice").reason).toBe(
      "audit.reason.noPublishService",
    );
    expect(find(DEFAULT_BUILD, "sendMessage").availability).toBe("blocked");
  });

  it("never calls a locally queued report delivered", () => {
    expect(find(DEFAULT_BUILD, "submitReport")).toMatchObject({
      availability: "device",
      reason: "audit.reason.submitQueuesOnly",
    });
    expect(find(DEFAULT_BUILD, "saveDraft").availability).toBe("device");
  });

  it("marks sample-data features as simulated, not available", () => {
    for (const id of ["searchRoutes", "readAdvisories", "viewPoints"])
      expect(find(DEFAULT_BUILD, id).availability).toBe("simulated");
  });

  it("totals the 19 audited actions", () => {
    expect(countByAvailability(deriveWorkspaceActions(DEFAULT_BUILD))).toEqual({
      available: 3,
      device: 5,
      simulated: 3,
      blocked: 8,
    });
  });
});

describe("workspace action audit follows the configuration", () => {
  it("shows the dev ?mock= publish as simulated in a development build", () => {
    expect(
      find({ ...DEFAULT_BUILD, devBuild: true }, "publishNotice"),
    ).toMatchObject({
      availability: "simulated",
      reason: "audit.reason.publishMock",
    });
  });

  it("treats the development receipt stub as simulated delivery and sign-in", () => {
    const stub = { ...DEFAULT_BUILD, transport: "dev_stub" as const };
    expect(find(stub, "sendReport").availability).toBe("simulated");
    expect(find(stub, "signIn").reason).toBe("audit.reason.devSignIn");
    // The stub can sign in, so My Reports becomes reachable after signing in.
    expect(find(stub, "viewMyReports").reason).toBe(
      "audit.reason.myReportsAfterSignIn",
    );
    // Sign-up still needs Supabase; the stub only signs in.
    expect(find(stub, "signUp").availability).toBe("blocked");
  });

  it("blocks delivery when a report service exists but nobody can sign in", () => {
    expect(
      find({ ...DEFAULT_BUILD, transport: "http" }, "sendReport"),
    ).toMatchObject({
      availability: "blocked",
      reason: "audit.reason.noSignInForDelivery",
    });
  });

  it("makes delivery and sign-in available once both services are configured", () => {
    const live = {
      ...DEFAULT_BUILD,
      transport: "http" as const,
      supabaseConfigured: true,
    };
    expect(find(live, "sendReport").availability).toBe("available");
    expect(find(live, "signIn").availability).toBe("available");
    expect(find(live, "signUp").availability).toBe("available");
    expect(
      find({ ...live, session: "authenticated" }, "viewMyReports").reason,
    ).toBe("audit.reason.myReportsSignedIn");
  });

  it("blocks map tiles while the device is offline", () => {
    expect(
      find({ ...DEFAULT_BUILD, online: "offline" }, "mapTiles"),
    ).toMatchObject({
      availability: "blocked",
      reason: "audit.reason.tilesOffline",
    });
  });
});

describe("workspace action audit text", () => {
  const transports: TransportSource[] = [
    "none",
    "http",
    "dev_stub",
    "injected",
  ];
  const sessions: AccountSession["status"][] = [
    "signed_out",
    "loading",
    "authenticated",
  ];
  const onlines: OnlineStatus[] = ["online", "offline", "unknown"];
  const combos = transports.flatMap((transport) =>
    sessions.flatMap((session) =>
      onlines.flatMap((online) =>
        [true, false].flatMap((supabaseConfigured) =>
          [true, false].map((devBuild) => ({
            transport,
            session,
            online,
            supabaseConfigured,
            devBuild,
          })),
        ),
      ),
    ),
  );

  it("has an English and Hindi string for every key any configuration can produce", () => {
    const missing = new Set<string>();
    for (const input of combos)
      for (const screen of deriveWorkspaceActions(input)) {
        for (const key of [
          screen.name,
          ...screen.actions.flatMap((a) => [a.name, a.reason]),
        ]) {
          if (!(key in en)) missing.add(`en:${key}`);
          if (!hi[key]) missing.add(`hi:${key}`);
        }
      }
    expect([...missing]).toEqual([]);
  });

  it("uses unique action ids", () => {
    const ids = deriveWorkspaceActions(DEFAULT_BUILD).flatMap((s) =>
      s.actions.map((a) => a.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});
