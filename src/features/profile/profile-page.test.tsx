import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfilePage } from "@/features/profile/profile-page";
import { PreferencesProvider } from "@/i18n/preferences";
import { getAccountSession, setAccountSession } from "@/lib/account-session";
import * as repository from "@/lib/draft-repository";
import { localDb, type DraftRecord, type OutboxRecord } from "@/lib/local-db";

const SCOPE = "user:u1";

function draft(id: string, scope = SCOPE): DraftRecord {
  return {
    id,
    accountScope: scope,
    ownerUserId: "u1",
    status: "draft",
    eventTime: "",
    observedAtLocal: "",
    payload: {
      hazardType: "",
      description: "",
      observedAt: "",
      photo: null,
      location: null,
    },
    attachments: [],
    localReference: null,
    createdAt: 1,
    updatedAt: 1,
    savedAt: 1,
    schemaVersion: 1,
  };
}

function outbox(reportId: string, state: OutboxRecord["state"]): OutboxRecord {
  return {
    id: reportId,
    reportId,
    accountScope: SCOPE,
    ownerUserId: "u1",
    state,
    attempts: 0,
    nextAttemptAt: 0,
    lastErrorCode: null,
    lastErrorMessage: null,
    retryAfterAt: null,
    metadataReceipt: null,
    deliveredAt: null,
    authBlocked: false,
    createdAt: 1,
    updatedAt: 1,
  };
}

const mount = () =>
  render(
    <PreferencesProvider>
      <ProfilePage />
    </PreferencesProvider>,
  );

const signIn = (extra: { email?: string | null; role?: string | null } = {}) =>
  setAccountSession({
    status: "authenticated",
    userId: "u1",
    email: "a@example.com",
    ...extra,
  });

afterEach(async () => {
  vi.restoreAllMocks();
  setAccountSession({ status: "signed_out", userId: null });
  window.localStorage.clear();
  await localDb.drafts.clear();
  await localDb.outbox.clear();
});

describe("countUnsyncedDrafts", () => {
  it("counts this account's drafts and queued reports not yet received", async () => {
    await localDb.drafts.bulkPut([
      draft("a"),
      draft("b"),
      draft("c"),
      draft("d"),
      draft("other", "user:u2"),
    ]);
    await localDb.outbox.bulkPut([
      outbox("b", "failed"),
      outbox("c", "received"),
      outbox("d", "rejected"),
    ]);
    await expect(repository.countUnsyncedDrafts(SCOPE)).resolves.toBe(2);
    await expect(repository.countUnsyncedDrafts("anonymous")).resolves.toBe(0);
  });
});

describe("profile page", () => {
  it("shows preferences and a sign-in action when signed out", () => {
    mount();
    expect(
      screen.getByRole("heading", { level: 1, name: "Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/You are not signed in/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });

  it("shows the session email and role read-only, with no way to change the role", () => {
    signIn({ role: "reviewer" });
    mount();
    expect(screen.getByText("a@example.com")).toBeInTheDocument();
    expect(screen.getByText("reviewer")).toBeInTheDocument();
    expect(screen.getByText(/cannot be changed here/)).toBeInTheDocument();
    // Only the language and theme groups are editable.
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("says no role is assigned when the session has none", () => {
    signIn({ role: null });
    mount();
    expect(screen.getByText("No role assigned")).toBeInTheDocument();
  });

  it("changes language and theme preferences", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("radio", { name: "हिन्दी" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "प्रोफ़ाइल" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "हल्की" }));
    await waitFor(() =>
      expect(document.documentElement).not.toHaveClass("dark"),
    );
    expect(screen.getByRole("radio", { name: "हल्की" })).toBeChecked();
  });
});

describe("sign-out confirmation", () => {
  it("signs out straight away when nothing is unsynced", async () => {
    signIn();
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(getAccountSession().status).toBe("signed_out"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("warns about unsynced drafts, keeps them, and lets the user cancel or confirm", async () => {
    signIn();
    await localDb.drafts.bulkPut([draft("a"), draft("b")]);
    const user = userEvent.setup();
    mount();

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Sign out with unsynced drafts?");
    expect(dialog).toHaveAccessibleDescription(
      "You have 2 unsynced drafts. They will remain on this device but won't sync until you sign in again.",
    );
    expect(dialog).toHaveTextContent("does not delete drafts");

    await user.click(
      within(dialog).getByRole("button", { name: "Stay signed in" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(getAccountSession().status).toBe("authenticated");

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Sign out anyway",
      }),
    );
    await waitFor(() => expect(getAccountSession().status).toBe("signed_out"));
    // Drafts are kept for this account; nothing is deleted.
    expect(
      await localDb.drafts.where("accountScope").equals(SCOPE).count(),
    ).toBe(2);
  });

  it("uses singular wording for one draft", async () => {
    signIn();
    await localDb.drafts.put(draft("a"));
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleDescription(
      "You have 1 unsynced draft. It will remain on this device but won't sync until you sign in again.",
    );
  });

  it("shows an explicit unknown warning when the draft check fails", async () => {
    signIn();
    vi.spyOn(repository, "countUnsyncedDrafts").mockRejectedValue(
      new Error("db closed"),
    );
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleDescription(
      /could not check for unsynced drafts/,
    );
    expect(getAccountSession().status).toBe("authenticated");
  });
});
