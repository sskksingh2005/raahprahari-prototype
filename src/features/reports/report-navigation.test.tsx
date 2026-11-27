import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { NotFoundPage } from "@/components/error-pages";
import { getActiveAccountScope } from "@/lib/account-scope";
import { newReportId, saveAttachment, saveDraft } from "@/lib/draft-repository";
import { localDb } from "@/lib/local-db";
import { createEmptyReportDraft, type ReportDraft } from "@/lib/report-store";

const readPhotoGps = vi.hoisted(() => vi.fn());

vi.mock("@/lib/photo-gps", () => ({ readPhotoGps }));

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

afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  readPhotoGps.mockReset();
  window.localStorage.clear();
  await localDb.drafts.clear();
  await localDb.attachments.clear();
  await localDb.outbox.clear();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

async function mountAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  });
  await router.load();
  const rendered = render(<RouterProvider router={router} />);
  return { router, ...rendered };
}

async function persistDraft(payload: ReportDraft, withPhoto = true) {
  const scope = getActiveAccountScope();
  const id = newReportId();
  const initial = await saveDraft({ id, accountScope: scope, payload });
  if (!initial.ok) throw new Error(initial.message);

  if (!withPhoto) return id;

  const file = new File(["local test photo"], "road.jpg", {
    type: "image/jpeg",
  });
  const attachment = await saveAttachment(id, scope, file);
  if (!attachment.ok) throw new Error(attachment.message);

  const saved = await saveDraft({
    id,
    accountScope: scope,
    payload: {
      ...payload,
      photo: {
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        timestamp: Date.now(),
        locationTag: "30.1° N, 79.3° E",
      },
    },
  });
  if (!saved.ok) throw new Error(saved.message);
  return id;
}

function validDraft(overrides: Partial<ReportDraft> = {}): ReportDraft {
  return {
    ...createEmptyReportDraft(),
    hazardType: "landslide",
    description: "Saved draft description.",
    location: {
      query: "Uttarakhand",
      roadSegment: "NH-7",
      lat: 30.1,
      lon: 79.3,
      accuracyM: null,
      source: "manual",
      confirmed: true,
    },
    ...overrides,
  };
}

describe("report navigation with the application router and local storage", () => {
  it("serializes concurrent saves so an older pending write cannot replace newer edits", async () => {
    const scope = getActiveAccountScope();
    const id = newReportId();
    const started = deferred<void>();
    const release = deferred<void>();
    const getDraft = localDb.drafts.get.bind(localDb.drafts);
    const getDescriptor = Object.getOwnPropertyDescriptor(
      localDb.drafts,
      "get",
    );
    let firstRead = true;
    Object.defineProperty(localDb.drafts, "get", {
      configurable: true,
      writable: true,
      value: async (key: string) => {
        if (key === id && firstRead) {
          firstRead = false;
          started.resolve();
          await release.promise;
        }
        return getDraft(key);
      },
    });

    try {
      const older = saveDraft({
        id,
        accountScope: scope,
        payload: validDraft({ description: "Older save." }),
      });
      await started.promise;
      const newer = saveDraft({
        id,
        accountScope: scope,
        payload: validDraft({ description: "Newer save." }),
      });

      release.resolve();
      const results = await Promise.all([older, newer]);
      expect(results.every((result) => result.ok)).toBe(true);
      expect((await localDb.drafts.get(id))?.payload.description).toBe(
        "Newer save.",
      );
      expect(
        JSON.parse(window.localStorage.getItem("rp.reportDraft") ?? "{}")
          .description,
      ).toBe("Newer save.");
    } finally {
      release.resolve();
      if (getDescriptor) {
        Object.defineProperty(localDb.drafts, "get", getDescriptor);
      } else {
        Reflect.deleteProperty(localDb.drafts, "get");
      }
    }
  });

  it("keeps a valid restored draft on Review while IndexedDB restoration is delayed", async () => {
    class PreviewURL extends URL {
      static createObjectURL = vi.fn(() => "blob:report-photo");
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal("URL", PreviewURL);

    const payload = validDraft();
    const id = await persistDraft(payload);
    const started = deferred<void>();
    const release = deferred<void>();
    const getDraft = localDb.drafts.get.bind(localDb.drafts);
    const getDescriptor = Object.getOwnPropertyDescriptor(
      localDb.drafts,
      "get",
    );
    Object.defineProperty(localDb.drafts, "get", {
      configurable: true,
      writable: true,
      value: async (key: string) => {
        if (key === id) {
          started.resolve();
          await release.promise;
        }
        return getDraft(key);
      },
    });

    const { router, unmount } = await mountAt("/report/review");
    try {
      await started.promise;
      expect(router.state.location.pathname).toBe("/report/review");
      expect(screen.getByRole("status")).toHaveTextContent(
        "Restoring your saved draft",
      );
      expect(
        screen.queryByRole("heading", {
          name: "Review your report",
          level: 1,
        }),
      ).toBeNull();
      release.resolve();
      expect(
        await screen.findByRole("heading", {
          name: "Review your report",
          level: 1,
        }),
      ).toBeVisible();
      expect(await screen.findByText("Saved draft description.")).toBeVisible();
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/report/review"),
      );
    } finally {
      release.resolve();
      unmount();
      if (getDescriptor) {
        Object.defineProperty(localDb.drafts, "get", getDescriptor);
      } else {
        Reflect.deleteProperty(localDb.drafts, "get");
      }
    }

    const refreshed = await mountAt("/report/review");
    try {
      expect(
        await screen.findByRole("heading", {
          name: "Review your report",
          level: 1,
        }),
      ).toBeVisible();
      expect(await screen.findByText("Saved draft description.")).toBeVisible();
      expect(refreshed.router.state.location.pathname).toBe("/report/review");
    } finally {
      refreshed.unmount();
    }
  });

  it("saves Describe changes, reaches Review, and preserves edits when returning", async () => {
    class PreviewURL extends URL {
      static createObjectURL = vi.fn(() => "blob:report-photo");
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal("URL", PreviewURL);

    await persistDraft(
      validDraft({
        hazardType: "",
        description: "",
      }),
    );
    const { router, unmount } = await mountAt("/report");

    try {
      fireEvent.click(await screen.findByRole("button", { name: "Landslide" }));
      fireEvent.change(screen.getByLabelText("Describe the condition"), {
        target: { value: "Initial description." },
      });
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

      expect(
        await screen.findByRole("heading", {
          name: "Review your report",
          level: 1,
        }),
      ).toBeVisible();
      expect(await screen.findByText("Initial description.")).toBeVisible();
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/report/review"),
      );

      fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/report"),
      );
      const description = await screen.findByLabelText(
        "Describe the condition",
      );
      expect(description).toHaveValue("Initial description.");
      fireEvent.change(description, {
        target: { value: "Edited description." },
      });

      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/report/location"),
      );
      fireEvent.click(
        await screen.findByRole("button", { name: "Confirm this location" }),
      );
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/report"),
      );
      expect(
        await screen.findByLabelText("Describe the condition"),
      ).toHaveValue("Edited description.");
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

      expect(
        await screen.findByRole("heading", {
          name: "Review your report",
          level: 1,
        }),
      ).toBeVisible();
      expect(await screen.findByText("Edited description.")).toBeVisible();
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/report/review"),
      );
    } finally {
      unmount();
    }
  });

  it("uses valid photo GPS as an unconfirmed suggestion when no location is confirmed", async () => {
    class PreviewURL extends URL {
      static createObjectURL = vi.fn(() => "blob:report-photo");
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal("URL", PreviewURL);
    readPhotoGps.mockResolvedValue({ lat: 30.555, lon: 79.5643 });
    const id = await persistDraft(
      validDraft({ location: null, hazardType: "" }),
      false,
    );
    const { router, unmount } = await mountAt("/report/photo");

    try {
      fireEvent.change(
        await screen.findByLabelText("Choose an existing JPG or PNG photo"),
        {
          target: {
            files: [
              new File(["local test photo"], "road.jpg", {
                type: "image/jpeg",
              }),
            ],
          },
        },
      );
      await waitFor(async () => {
        expect((await localDb.drafts.get(id))?.payload.location).toMatchObject({
          query: "Photo GPS location",
          lat: 30.555,
          lon: 79.5643,
          source: "device",
          confirmed: false,
        });
      });

      fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/report/location"),
      );
      expect(
        await screen.findByRole("heading", {
          name: "Confirm the location",
          level: 1,
        }),
      ).toBeVisible();
    } finally {
      unmount();
    }
  });

  it("never replaces a previously confirmed location with photo GPS", async () => {
    class PreviewURL extends URL {
      static createObjectURL = vi.fn(() => "blob:report-photo");
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal("URL", PreviewURL);
    readPhotoGps.mockResolvedValue({ lat: 30.555, lon: 79.5643 });
    const id = await persistDraft(validDraft(), false);
    const { unmount } = await mountAt("/report/photo");

    try {
      fireEvent.change(
        await screen.findByLabelText("Choose an existing JPG or PNG photo"),
        {
          target: {
            files: [
              new File(["local test photo"], "road.jpg", {
                type: "image/jpeg",
              }),
            ],
          },
        },
      );
      await waitFor(async () =>
        expect((await localDb.drafts.get(id))?.payload.photo?.name).toBe(
          "road.jpg",
        ),
      );
      expect((await localDb.drafts.get(id))?.payload.location).toMatchObject({
        query: "Uttarakhand",
        lat: 30.1,
        lon: 79.3,
        confirmed: true,
      });
    } finally {
      unmount();
    }
  });

  it.each([
    {
      name: "missing photo",
      payload: validDraft({ photo: null, location: null, hazardType: "" }),
      withPhoto: false,
      expectedPath: "/report/photo",
      expectedHeading: "Add photo evidence",
    },
    {
      name: "unconfirmed location",
      payload: validDraft({
        location: { ...validDraft().location!, confirmed: false },
      }),
      withPhoto: true,
      expectedPath: "/report/location",
      expectedHeading: "Confirm the location",
    },
    {
      name: "missing hazard",
      payload: validDraft({ hazardType: "" }),
      withPhoto: true,
      expectedPath: "/report",
      expectedHeading: "Describe the hazard",
    },
  ])(
    "redirects a review draft with $name to its prerequisite",
    async ({ payload, withPhoto, expectedPath, expectedHeading }) => {
      class PreviewURL extends URL {
        static createObjectURL = vi.fn(() => "blob:report-photo");
        static revokeObjectURL = vi.fn();
      }
      vi.stubGlobal("URL", PreviewURL);
      await persistDraft(payload, withPhoto);

      const { router, unmount } = await mountAt("/report/review");
      try {
        expect(
          await screen.findByRole("heading", {
            name: expectedHeading,
            level: 1,
          }),
        ).toBeVisible();
        await waitFor(() =>
          expect(router.state.location.pathname).toBe(expectedPath),
        );
      } finally {
        unmount();
      }
    },
  );
});
