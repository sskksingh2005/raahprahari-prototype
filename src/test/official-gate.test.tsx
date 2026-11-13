import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotFoundPage } from "@/components/error-pages";
import { setAccountSession, type AccountSession } from "@/lib/account-session";
import { routeTree } from "@/routeTree.gen";

// Keep the root session bridge away from a real Supabase project.
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

async function mountAs(session: AccountSession) {
  setAccountSession(session);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/official"] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  });
  await router.load();
  render(<RouterProvider router={router} />, {
    container: document as unknown as HTMLElement,
  });
}

afterEach(() => {
  cleanup();
  setAccountSession({ status: "signed_out", userId: null });
});

describe("/official gate", () => {
  it.each<[string, AccountSession]>([
    ["signed out", { status: "signed_out", userId: null }],
    ["signed in without the official role", { status: "authenticated", userId: "u1", role: null }],
    ["signed in as a reviewer", { status: "authenticated", userId: "u1", role: "reviewer" }],
  ])("shows the restricted view when %s", async (_label, session) => {
    await mountAs(session);
    expect(
      await screen.findByRole("heading", { name: "Restricted Official Portal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in with Official Credentials" })).toBeEnabled();
    expect(screen.queryByRole("heading", { name: "Road restriction notice" })).toBeNull();
  });

  it("shows the notice form only for a server-assigned official role", async () => {
    await mountAs({ status: "authenticated", userId: "u1", role: "official" });
    expect(
      await screen.findByRole("heading", { name: "Road restriction notice" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Restricted Official Portal" })).toBeNull();
  });
});
