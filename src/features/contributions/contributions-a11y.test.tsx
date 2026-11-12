import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import { ContributionsTabs } from "./contributions-tabs";

function renderTabs() {
  return render(
    <PreferencesProvider>
      <ContributionsTabs />
    </PreferencesProvider>,
  );
}

async function axeViolations(root: Element) {
  const results = await axe(root, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.nodes.length}`);
}

beforeEach(() => window.localStorage.clear());

describe("contribution tabs keyboard support", () => {
  it("moves between tabs with the arrow keys and wraps around", async () => {
    const user = userEvent.setup();
    renderTabs();
    const tabs = within(screen.getByRole("tablist")).getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      "Points",
      "Reputation",
      "Leaderboard",
      "Ledger",
      "Privacy",
    ]);
    tabs[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Reputation");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(tabs[4]).toHaveFocus();
  });

  it("has no detectable accessibility problems on any tab", async () => {
    const user = userEvent.setup();
    renderTabs();
    for (const name of [
      "Points",
      "Reputation",
      "Leaderboard",
      "Ledger",
      "Privacy",
    ]) {
      await user.click(screen.getByRole("tab", { name }));
      expect(await axeViolations(document.body)).toEqual([]);
    }
  });

  it("labels the privacy switches, which start off", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByRole("tab", { name: "Privacy" }));
    const board = screen.getByRole("switch", {
      name: "Show my pseudonym on the leaderboard",
    });
    expect(board).toHaveAttribute("aria-checked", "false");
    expect(board).toHaveAccessibleDescription(/random pseudonym/);
    board.focus();
    await user.keyboard(" ");
    expect(board).toHaveAttribute("aria-checked", "true");
  });
});

describe("appeal form focus handling", () => {
  async function openLedger(user: ReturnType<typeof userEvent.setup>) {
    renderTabs();
    await user.click(screen.getByRole("tab", { name: "Ledger" }));
    return screen.getByRole("button", { name: "Appeal" });
  }

  it("focuses the note on open and returns to Appeal on Escape", async () => {
    const user = userEvent.setup();
    await openLedger(user);
    await user.click(screen.getByRole("button", { name: "Appeal" }));
    const note = screen.getByLabelText(
      "Why do you think this reversal is wrong?",
    );
    await waitFor(() => expect(note).toHaveFocus());

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Appeal" })).toHaveFocus(),
    );
  });

  it("keeps focus on the note and explains a refused phone number", async () => {
    const user = userEvent.setup();
    await openLedger(user);
    await user.click(screen.getByRole("button", { name: "Appeal" }));
    const note = screen.getByLabelText(
      "Why do you think this reversal is wrong?",
    );
    await user.type(note, "Call +91 98765 43210");
    await user.click(screen.getByRole("button", { name: "Save appeal" }));

    expect(note).toHaveAttribute("aria-invalid", "true");
    expect(note).toHaveAccessibleDescription(/looks like a phone number/);
    await waitFor(() => expect(note).toHaveFocus());
  });

  it("focuses the saved message, then the Appeal button after withdrawing", async () => {
    const user = userEvent.setup();
    await openLedger(user);
    await user.click(screen.getByRole("button", { name: "Appeal" }));
    await user.type(
      screen.getByLabelText("Why do you think this reversal is wrong?"),
      "The road was open in a newer photo",
    );
    await user.click(screen.getByRole("button", { name: "Save appeal" }));

    const saved = await screen.findByText(/Appeal saved on this device/);
    expect(saved).toHaveAttribute("role", "status");
    await waitFor(() => expect(saved).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Withdraw appeal" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Appeal" })).toHaveFocus(),
    );
  });
});
