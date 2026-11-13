import { useState } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { en, hi } from "@/i18n/dictionary";
import { PreferencesProvider } from "@/i18n/preferences";
import { setAccountSession } from "@/lib/account-session";
import {
  FEATURES,
  SUGGESTED_COUNT,
  categoryKey,
  featureDescriptionKey,
  featureTitleKey,
  searchFeatures,
} from "@/lib/feature-search";
import { FeatureSearchModal } from "./feature-search-modal";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useNavigate: () => navigate };
});

/** Renders the palette closed, with a button outside it, as the header does. */
function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Outside button
      </button>
      <FeatureSearchModal open={open} onOpenChange={setOpen} />
    </>
  );
}

const renderPalette = () =>
  render(
    <PreferencesProvider>
      <Harness />
    </PreferencesProvider>,
  );

const pressShortcut = (
  key = "k",
  init: KeyboardEventInit = { ctrlKey: true },
) =>
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, ...init }),
    );
  });

const options = () =>
  within(screen.getByRole("listbox")).getAllByRole("option");
const optionTitles = () =>
  options().map(
    (option) => option.querySelector("span span")?.firstChild?.textContent,
  );

beforeEach(() => navigate.mockReset());
afterEach(() => setAccountSession({ status: "signed_out", userId: null }));

describe("feature search data", () => {
  const t = (key: keyof typeof en) => en[key];

  it("suggests the five named features when the query is empty", () => {
    const ids = searchFeatures("", t, t, { signedIn: false }).map((f) => f.id);
    expect(ids).toEqual(["home", "map", "review", "official", "contributions"]);
    expect(ids).toHaveLength(SUGGESTED_COUNT);
  });

  it("matches title, description and category, ignoring case", () => {
    const ids = (q: string) =>
      searchFeatures(q, t, t, { signedIn: false }).map((f) => f.id);
    expect(ids("HIMALAYAN")).toEqual(["map"]); // title
    expect(ids("photo")).toContain("report"); // description
    expect(ids("community")).toContain("contributions"); // category
    expect(ids("review queue")).toEqual(["review"]); // every word must match
    expect(ids("zzzz")).toEqual([]);
  });

  it("finds English words while the interface is in Hindi", () => {
    const hiT = (key: keyof typeof en) => hi[key];
    expect(
      searchFeatures("map", hiT, t, { signedIn: false }).map((f) => f.id),
    ).toContain("map");
  });

  it("offers My Reports only to a signed-in account, like the navigation", () => {
    expect(
      searchFeatures("reports", t, t, { signedIn: false }).map((f) => f.id),
    ).not.toContain("myReports");
    expect(
      searchFeatures("reports", t, t, { signedIn: true }).map((f) => f.id),
    ).toContain("myReports");
  });

  it("has English and Hindi text for every feature and category", () => {
    const missing = FEATURES.flatMap((f) =>
      [
        featureTitleKey(f.id),
        featureDescriptionKey(f.id),
        categoryKey(f.category),
      ].filter((key) => !en[key] || !hi[key]),
    );
    expect(missing).toEqual([]);
  });
});

describe("feature search palette", () => {
  it("opens with Ctrl+K and Cmd+K, and closes with the same shortcut", async () => {
    renderPalette();
    expect(screen.queryByRole("dialog")).toBeNull();

    pressShortcut();
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Search features");
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());

    pressShortcut("K", { ctrlKey: true });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    pressShortcut("k", { metaKey: true });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("ignores K without a modifier, and Ctrl+Alt+K", () => {
    renderPalette();
    pressShortcut("k", {});
    pressShortcut("k", { ctrlKey: true, altKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the five suggestions first, then filters as you type", async () => {
    const user = userEvent.setup();
    renderPalette();
    pressShortcut();
    await screen.findByRole("dialog");
    expect(optionTitles()).toEqual([
      "Home",
      "Live Himalayan Map",
      "Review queue",
      "Official portal",
      "Community contributions",
    ]);

    // "advis" also matches descriptions that mention an advisory.
    await user.type(screen.getByRole("combobox"), "advis");
    expect(optionTitles()).toContain("Road advisories");
    expect(optionTitles()).toContain("Home");
    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "advisories");
    // Title match, plus Help, whose description explains how advisories work.
    expect(optionTitles()).toEqual(["Road advisories", "Help"]);
    expect(screen.getByText("2 result(s)")).toBeInTheDocument();

    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "nothing-like-this");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(
      "No features match “nothing-like-this”.",
    );
  });

  it("moves through results with the arrow keys and opens one with Enter", async () => {
    const user = userEvent.setup();
    renderPalette();
    pressShortcut();
    const input = await screen.findByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());

    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", options()[0].id);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(options()[2]).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", options()[2].id);
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}"); // wraps to the last
    expect(options()[4]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Enter}");
    expect(navigate).toHaveBeenCalledWith({ to: "/contributions" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("navigates on click and passes the search param the report route expects", async () => {
    const user = userEvent.setup();
    renderPalette();
    pressShortcut();
    await screen.findByRole("dialog");
    await user.type(screen.getByRole("combobox"), "hazard");
    await user.click(screen.getByTestId("feature-report"));
    expect(navigate).toHaveBeenCalledWith({
      to: "/report",
      search: { segment: undefined },
    });
  });

  it("starts empty again after closing with Escape, and returns focus", async () => {
    const user = userEvent.setup();
    renderPalette();
    const outside = screen.getByRole("button", { name: "Outside button" });
    outside.focus();
    pressShortcut();
    await screen.findByRole("dialog");
    await user.type(screen.getByRole("combobox"), "map");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(outside).toHaveFocus();

    pressShortcut();
    expect(await screen.findByRole("combobox")).toHaveValue("");
    expect(options()).toHaveLength(5);
  });

  it("traps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    renderPalette();
    pressShortcut();
    const dialog = await screen.findByRole("dialog");
    for (let i = 0; i < 4; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("has no detectable accessibility problems", async () => {
    renderPalette();
    pressShortcut();
    await screen.findByRole("dialog");
    const results = await axe(document.body, {
      rules: {
        "color-contrast": { enabled: false },
        region: { enabled: false },
      },
    });
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  it("lists My Reports once signed in", async () => {
    setAccountSession({ status: "authenticated", userId: "u1" });
    renderPalette();
    pressShortcut();
    await screen.findByRole("dialog");
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "my reports" },
    });
    expect(optionTitles()).toEqual(["My Reports"]);
  });
});
