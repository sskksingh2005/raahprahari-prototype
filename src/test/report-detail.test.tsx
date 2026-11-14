import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotFoundPage } from "@/components/error-pages";
import { setAccountSession } from "@/lib/account-session";
import {
  localDb,
  type AttachmentRecord,
  type DraftRecord,
  type OutboxRecord,
} from "@/lib/local-db";
import { createEmptyReportDraft } from "@/lib/report-store";
import { routeTree } from "@/routeTree.gen";

// Keep the root session bridge from connecting to a real Supabase project
// (vitest loads .env.local), which would replace the test session.
vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return {
    ...actual,
    isSupabaseConfigured: () => false,
    getSupabaseClient: () => {
      throw new actual.SupabaseConfigError(["VITE_SUPABASE_URL"]);
    },
  };
});

const SCOPE = "user:u1";
const ID = "11111111-1111-4111-8111-111111111111";

function draft(scope = SCOPE): DraftRecord {
  return {
    id: ID,
    accountScope: scope,
    ownerUserId: "u1",
    status: "ready_to_send",
    eventTime: "2026-10-25T04:30:00.000Z",
    observedAtLocal: "2026-10-25T10:00",
    payload: {
      ...createEmptyReportDraft(),
      hazardType: "landslide",
      description: "Rocks",
    },
    attachments: [],
    localReference: null,
    createdAt: 1,
    updatedAt: 1,
    savedAt: 1,
    schemaVersion: 1,
  };
}

function outbox(state: OutboxRecord["state"], received: boolean): OutboxRecord {
  return {
    id: ID,
    reportId: ID,
    accountScope: SCOPE,
    ownerUserId: "u1",
    state,
    attempts: 0,
    nextAttemptAt: 0,
    lastErrorCode: null,
    lastErrorMessage: null,
    retryAfterAt: null,
    metadataReceipt: received
      ? {
          receiptId: "rcpt-123",
          receivedAt: "2026-10-25T05:00:00.000Z",
          duplicate: false,
        }
      : null,
    deliveredAt: received ? 2 : null,
    authBlocked: false,
    createdAt: 1,
    updatedAt: 1,
  };
}

function photo(
  uploadState: AttachmentRecord["uploadState"],
  n = 1,
): AttachmentRecord {
  return {
    id: `att-${n}`,
    draftId: ID,
    accountScope: SCOPE,
    blob: new Blob(["x"], { type: "image/jpeg" }),
    name: `road-${n}.jpg`,
    type: "image/jpeg",
    size: 1,
    createdAt: 1,
    uploadState,
    uploadError: null,
    uploadedAt: uploadState === "uploaded" ? 3 : null,
    uploadAttempts: 0,
  };
}

async function mount() {
  setAccountSession({ status: "authenticated", userId: "u1" });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [`/reports/${ID}`] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  });
  await router.load();
  render(<RouterProvider router={router} />, {
    container: document as unknown as HTMLElement,
  });
}

/** The delivery stage card with the given title. */
async function stage(title: string) {
  const stages = await screen.findByRole("list", { name: "Delivery stages" });
  const item = within(stages)
    .getAllByRole("listitem")
    .find((li) => li.textContent?.startsWith(title));
  if (!item) throw new Error(`No stage ${title}`);
  return item;
}

afterEach(async () => {
  cleanup();
  setAccountSession({ status: "signed_out", userId: null });
  await localDb.drafts.clear();
  await localDb.outbox.clear();
  await localDb.attachments.clear();
});

describe("report detail: separate report and photo delivery", () => {
  it("shows the report undelivered and the photo pending, not 'not applicable'", async () => {
    await localDb.drafts.put(draft());
    await localDb.outbox.put(outbox("pending", false));
    await localDb.attachments.put(photo("not_started"));
    await mount();
    expect(await stage("Server received")).toHaveTextContent(
      "Not delivered yet",
    );
    expect(await stage("Photos")).toHaveTextContent("Photo upload pending");
  });

  it("keeps a received report distinct from a photo still pending", async () => {
    await localDb.drafts.put(draft());
    await localDb.outbox.put(outbox("received", true));
    await localDb.attachments.bulkPut([
      photo("uploaded", 1),
      photo("not_started", 2),
    ]);
    await mount();
    expect(await stage("Server received")).toHaveTextContent(
      "Receipt rcpt-123",
    );
    // One of two photos uploaded is not "uploaded".
    expect(await stage("Photos")).toHaveTextContent("Photo upload pending");
  });

  it("shows uploaded only when every photo is uploaded", async () => {
    await localDb.drafts.put(draft());
    await localDb.outbox.put(outbox("received", true));
    await localDb.attachments.put(photo("uploaded"));
    await mount();
    expect(await stage("Photos")).toHaveTextContent("Photo uploaded");
  });

  it("flags a failed photo upload as an alert while the report stays received", async () => {
    await localDb.drafts.put(draft());
    await localDb.outbox.put(outbox("received", true));
    await localDb.attachments.put(photo("failed"));
    await mount();
    const photos = await stage("Photos");
    expect(within(photos).getByRole("alert")).toHaveTextContent(
      "Photo upload failed",
    );
    expect(await stage("Server received")).toHaveTextContent(
      "Receipt rcpt-123",
    );
  });

  it("says no photos for a report without attachments", async () => {
    await localDb.drafts.put(draft());
    await mount();
    expect(await stage("Photos")).toHaveTextContent("No photos");
  });

  it("updates live when the photo finishes uploading", async () => {
    await localDb.drafts.put(draft());
    await localDb.outbox.put(outbox("received", true));
    await localDb.attachments.put(photo("uploading"));
    await mount();
    expect(await stage("Photos")).toHaveTextContent("Uploading photo");
    await localDb.attachments.put(photo("uploaded"));
    await waitFor(async () =>
      expect(await stage("Photos")).toHaveTextContent("Photo uploaded"),
    );
  });

  it("does not show another account's report", async () => {
    await localDb.drafts.put(draft("user:someone-else"));
    await mount();
    expect(
      await screen.findByText("This page could not be found"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Delivery stages" })).toBeNull();
  });
});
