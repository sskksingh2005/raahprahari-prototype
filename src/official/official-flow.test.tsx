import { forwardRef } from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import { OfficialNoticeForm } from "./OfficialNoticeForm";
import type { PublishResult } from "./officialNotice.types";

// The status card links to segment pages; render plain anchors instead of a router.
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & { to?: string; params?: Record<string, string> }
  >(({ to = "#", params, ...rest }, ref) => {
    void params;
    return <a ref={ref} href={to} {...rest} />;
  });
  MockLink.displayName = "MockLink";
  return { ...actual, Link: MockLink };
});

// Each test decides when and how publishing finishes.
const publish = vi.hoisted(() => ({
  pending: null as ((result: PublishResult) => void) | null,
  calls: 0,
  resolve(result: PublishResult) {
    if (!this.pending) throw new Error("publishNotice was not called");
    this.pending(result);
  },
}));
vi.mock("./publishApi", () => ({
  publishNotice: vi.fn(() => {
    publish.calls += 1;
    return new Promise<PublishResult>((resolve) => {
      publish.pending = resolve;
    });
  }),
}));

/** axe without the rules jsdom cannot evaluate (it has no layout or colours). */
async function axeViolations(root: Element) {
  const results = await axe(root, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.nodes.length}`);
}

function renderForm() {
  return render(
    <PreferencesProvider>
      <OfficialNoticeForm />
    </PreferencesProvider>,
  );
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Source reference/), "Order 402/T");
  await user.type(
    screen.getByLabelText(/Publication time/),
    "2026-10-15T08:00",
  );
  await user.type(screen.getByLabelText(/Effective from/), "2026-10-15T09:00");
  await user.type(screen.getByLabelText(/Effective until/), "2026-10-15T18:00");
  await user.type(screen.getByLabelText(/Road segment/), "NH-58 test stretch");
  await user.type(
    screen.getByLabelText(/Jurisdiction or authority/),
    "Dehradun Traffic Police",
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Check draft" }));
  const review = screen.getByRole("button", { name: "Review and publish" });
  await user.click(review);
  return { review, dialog: await screen.findByRole("dialog") };
}

beforeEach(() => {
  publish.calls = 0;
  publish.pending = null;
});

describe("official notice form", () => {
  it("labels every field and marks required ones", () => {
    renderForm();
    for (const label of [
      /Source reference/,
      /Publication time/,
      /Effective from/,
      /Effective until/,
      /Road segment/,
      /Restriction/,
      /Jurisdiction or authority/,
    ]) {
      expect(screen.getByLabelText(label)).toBeRequired();
    }
    expect(
      screen.getByLabelText(/Source reference/),
    ).toHaveAccessibleDescription(/Letters, numbers/);
  });

  it("links each error to its field and moves focus to the first one", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Check draft" }));

    const source = screen.getByLabelText(/Source reference/);
    expect(source).toHaveFocus();
    expect(source).toHaveAttribute("aria-invalid", "true");
    expect(source).toHaveAccessibleDescription(/Enter the source reference\./);
    expect(
      screen.getByLabelText(/Jurisdiction or authority/),
    ).toHaveAccessibleDescription(/Enter the jurisdiction or authority\./);
    expect(screen.getAllByRole("alert").length).toBe(6);
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("checks the reference format and the time order", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/Source reference/), "Order <402>");
    await user.type(
      screen.getByLabelText(/Effective from/),
      "2026-10-15T18:00",
    );
    await user.type(
      screen.getByLabelText(/Effective until/),
      "2026-10-15T09:00",
    );
    await user.click(screen.getByRole("button", { name: "Check draft" }));

    expect(
      screen.getByText("Use only letters, numbers, /, # and -."),
    ).toBeVisible();
    expect(
      screen.getByLabelText(/Effective until/),
    ).toHaveAccessibleDescription(/The end must be after the start\./);
  });

  it("clears a field's error as soon as it is edited", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Check draft" }));
    const source = screen.getByLabelText(/Source reference/);
    await user.type(source, "A");
    expect(source).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("Enter the source reference.")).toBeNull();
  });

  it("moves focus to the ready step and drops the draft when the form changes", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Check draft" }));
    expect(
      screen.getByRole("heading", { name: "Ready to publish" }),
    ).toHaveFocus();

    await user.type(
      screen.getByLabelText(/Jurisdiction or authority/),
      " East",
    );
    expect(
      screen.queryByRole("button", { name: "Review and publish" }),
    ).toBeNull();
  });
});

describe("publish confirmation dialog", () => {
  it("is named, described and starts with focus inside", async () => {
    const user = userEvent.setup();
    renderForm();
    const { dialog } = await openDialog(user);

    expect(dialog).toHaveAccessibleName("Check before publishing");
    expect(dialog).toHaveAccessibleDescription(/Check each detail/);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(within(dialog).getByText("NH-58 test stretch")).toBeVisible();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("traps Tab and Shift+Tab inside the dialog", async () => {
    const user = userEvent.setup();
    renderForm();
    const { dialog } = await openDialog(user);

    for (let i = 0; i < 8; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 8; i += 1) {
      await user.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("keeps Publish disabled until the details are acknowledged, by keyboard", async () => {
    const user = userEvent.setup();
    renderForm();
    const { dialog } = await openDialog(user);
    const publishButton = within(dialog).getByRole("button", {
      name: "Publish notice",
    });
    expect(publishButton).toBeDisabled();

    const ack = within(dialog).getByRole("checkbox", {
      name: /I have checked these details/,
    });
    ack.focus();
    await user.keyboard(" ");
    expect(ack).toBeChecked();
    expect(publishButton).toBeEnabled();
  });

  it("closes on Escape and returns focus to the button that opened it", async () => {
    const user = userEvent.setup();
    renderForm();
    const { review } = await openDialog(user);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(review).toHaveFocus();
    expect(publish.calls).toBe(0);
  });

  it("starts unacknowledged each time it opens", async () => {
    const user = userEvent.setup();
    renderForm();
    const { review, dialog } = await openDialog(user);
    await user.click(within(dialog).getByRole("checkbox"));
    await user.click(within(dialog).getByRole("button", { name: "Go back" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(review).toHaveFocus();

    await user.click(review);
    const again = await screen.findByRole("dialog");
    expect(within(again).getByRole("checkbox")).not.toBeChecked();
  });

  it("cannot be dismissed while publishing, then announces and focuses success", async () => {
    const user = userEvent.setup();
    renderForm();
    const { dialog } = await openDialog(user);
    await user.click(within(dialog).getByRole("checkbox"));
    await user.click(
      within(dialog).getByRole("button", { name: "Publish notice" }),
    );

    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(
      within(dialog).getByRole("button", { name: "Publishing…" }),
    ).toBeDisabled();
    expect(
      within(dialog).getByRole("button", { name: "Go back" }),
    ).toBeDisabled();
    expect(within(dialog).queryByRole("button", { name: "Close" })).toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(publish.calls).toBe(1);

    await act(async () =>
      publish.resolve({ kind: "success", noticeId: "N-1" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Notice published. ID: N-1");
    await waitFor(() => expect(status).toHaveFocus());
    expect(
      screen.queryByRole("button", { name: "Review and publish" }),
    ).toBeNull();
  });

  it.each([
    [{ kind: "forbidden" } as PublishResult, /You do not have permission/],
    [
      { kind: "session-expired" } as PublishResult,
      /The notice was not published/,
    ],
    [{ kind: "error", reason: "network" } as PublishResult, /Network problem/],
    [
      { kind: "error", reason: "server", status: 503 } as PublishResult,
      /error \(503\)/,
    ],
  ])(
    "reports %o as an alert, keeps the draft and returns focus",
    async (result, text) => {
      const user = userEvent.setup();
      renderForm();
      const { review, dialog } = await openDialog(user);
      await user.click(within(dialog).getByRole("checkbox"));
      await user.click(
        within(dialog).getByRole("button", { name: "Publish notice" }),
      );
      await act(async () => publish.resolve(result));

      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(screen.getByRole("alert")).toHaveTextContent(text);
      expect(review).toHaveFocus();
      // There is no sign-in page in this build, so no button points at one.
      expect(
        screen.queryByRole("button", { name: "Sign in again" }),
      ).toBeNull();
      expect(screen.queryByRole("link", { name: /sign in/i })).toBeNull();
    },
  );
});
