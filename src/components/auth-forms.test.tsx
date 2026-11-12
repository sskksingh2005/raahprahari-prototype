import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginDialog } from "@/components/login-dialog";
import {
  AuthCallbackPage,
  ResetPasswordPage,
} from "@/features/auth/auth-pages";
import { PreferencesProvider } from "@/i18n/preferences";
import { getAccountSession, setAccountSession } from "@/lib/account-session";

const auth = vi.hoisted(() => ({
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...rest
    }: {
      to: string;
      children: React.ReactNode;
    }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return { ...actual, getSupabaseClient: () => ({ auth }) };
});

const wrap = (ui: React.ReactNode) =>
  render(<PreferencesProvider>{ui}</PreferencesProvider>);

function openDialog() {
  const onOpenChange = vi.fn();
  wrap(
    <LoginDialog
      open
      onOpenChange={onOpenChange}
      returnFocusRef={createRef()}
    />,
  );
  return onOpenChange;
}

afterEach(() => {
  for (const fn of Object.values(auth)) fn.mockReset();
  setAccountSession({ status: "signed_out", userId: null });
});

describe("signup in the login dialog", () => {
  it("validates matching passwords before calling Supabase", async () => {
    const user = userEvent.setup();
    openDialog();
    await user.click(
      screen.getByRole("button", { name: "New here? Create an account" }),
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Create an account",
    );
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "longpassword");
    await user.type(screen.getByLabelText("Confirm password"), "different1");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      await screen.findByText("The passwords do not match."),
    ).toBeInTheDocument();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("shows the email-confirmation message only when Supabase returns no session", async () => {
    auth.signUp.mockResolvedValue({
      data: { session: null, user: { id: "u1" } },
      error: null,
    });
    const user = userEvent.setup();
    const onOpenChange = openDialog();
    await user.click(
      screen.getByRole("button", { name: "New here? Create an account" }),
    );
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "longpassword");
    await user.type(screen.getByLabelText("Confirm password"), "longpassword");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Check your email",
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(getAccountSession().status).toBe("signed_out");
  });

  it("shows a translated provider error and clears the passwords", async () => {
    auth.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { name: "AuthApiError", status: 422, code: "user_already_exists" },
    });
    const user = userEvent.setup();
    openDialog();
    await user.click(
      screen.getByRole("button", { name: "New here? Create an account" }),
    );
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "longpassword");
    await user.type(screen.getByLabelText("Confirm password"), "longpassword");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists.",
    );
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });
});

describe("forgot password in the login dialog", () => {
  it("sends a reset link and returns to sign-in", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    openDialog();
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Reset your password",
    );
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "reset link is on its way",
    );
    await user.click(screen.getByRole("button", { name: "Back to sign in" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Community login");
  });

  it("reports a rate-limit error instead of success", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { status: 429, code: "over_email_send_rate_limit" },
    });
    const user = userEvent.setup();
    openDialog();
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("auth pages", () => {
  it("callback continues only after a successful exchange", async () => {
    const onContinue = vi.fn();
    wrap(
      <AuthCallbackPage
        onContinue={onContinue}
        run={async () => ({ ok: true, next: "/auth/reset-password" })}
      />,
    );
    await waitFor(() =>
      expect(onContinue).toHaveBeenCalledWith("/auth/reset-password"),
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Confirming your link",
    );
  });

  it("callback shows the real failure and a way home", async () => {
    const onContinue = vi.fn();
    wrap(
      <AuthCallbackPage
        onContinue={onContinue}
        run={async () => ({ ok: false, kind: "link_invalid" })}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "invalid or has expired",
    );
    expect(screen.getByRole("link", { name: "Go to home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("reset page asks for the email link without a recovery session", () => {
    wrap(<ResetPasswordPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Open the reset link from your email",
    );
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("reset page updates the password and reports Supabase errors", async () => {
    setAccountSession({ status: "authenticated", userId: "u1" });
    auth.updateUser
      .mockResolvedValueOnce({
        data: { user: null },
        error: { name: "AuthApiError", status: 422, code: "same_password" },
      })
      .mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
    const user = userEvent.setup();
    wrap(<ResetPasswordPage />);
    const fill = async () => {
      await user.type(screen.getByLabelText("New password"), "newpassword");
      await user.type(screen.getByLabelText("Confirm password"), "newpassword");
      await user.click(screen.getByRole("button", { name: "Update password" }));
    };
    await fill();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "different from your current one",
    );
    await fill();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your password has been updated.",
    );
    expect(auth.updateUser).toHaveBeenLastCalledWith({
      password: "newpassword",
    });
  });
});
