import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginDialog, classifyLoginError } from "@/components/login-dialog";
import { PreferencesProvider } from "@/i18n/preferences";
import { getAccountSession, setAccountSession } from "@/lib/account-session";
import { SupabaseConfigError } from "@/lib/supabase";

const signInWithPassword = vi.hoisted(() => vi.fn());
const getClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return { ...actual, getSupabaseClient: getClient };
});

// The signed-in panel links to /profile; render links without a router.
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

function mount(onOpenChange = vi.fn()) {
  render(
    <PreferencesProvider>
      <LoginDialog
        open
        onOpenChange={onOpenChange}
        returnFocusRef={createRef()}
      />
    </PreferencesProvider>,
  );
  return onOpenChange;
}

async function submit(email = "traveller@example.com", password = "secret") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

afterEach(() => {
  signInWithPassword.mockReset();
  getClient.mockReset();
  setAccountSession({ status: "signed_out", userId: null });
});

describe("login dialog", () => {
  it("shows an inline error for invalid credentials and stays signed out", async () => {
    getClient.mockReturnValue({ auth: { signInWithPassword } });
    signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { name: "AuthApiError", status: 400, code: "invalid_credentials" },
    });
    const onOpenChange = mount();
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email or password is incorrect.",
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(getAccountSession().status).toBe("signed_out");
  });

  it("reports a network failure", async () => {
    getClient.mockReturnValue({ auth: { signInWithPassword } });
    signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { name: "AuthRetryableFetchError", status: 0 },
    });
    mount();
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the sign-in service.",
    );
  });

  it("does not report success when Supabase returns no session", async () => {
    getClient.mockReturnValue({ auth: { signInWithPassword } });
    signInWithPassword.mockResolvedValue({
      data: { session: null, user: { id: "u1" } },
      error: null,
    });
    const onOpenChange = mount();
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sign-in did not return a session.",
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(getAccountSession().status).toBe("signed_out");
  });

  it("explains when sign-in is not configured", async () => {
    getClient.mockImplementation(() => {
      throw new SupabaseConfigError(["VITE_SUPABASE_URL"]);
    });
    mount();
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sign-in is not configured",
    );
  });

  it("closes and authenticates only after Supabase returns a session", async () => {
    getClient.mockReturnValue({ auth: { signInWithPassword } });
    signInWithPassword.mockResolvedValue({
      data: {
        session: {
          access_token: "token",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: "u1" },
        },
        user: { id: "u1" },
      },
      error: null,
    });
    const onOpenChange = mount();
    await submit();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "traveller@example.com",
      password: "secret",
    });
    expect(getAccountSession()).toMatchObject({
      status: "authenticated",
      userId: "u1",
    });
  });

  it("validates fields before calling Supabase", async () => {
    getClient.mockReturnValue({ auth: { signInWithPassword } });
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});

describe("classifyLoginError", () => {
  it("maps provider errors to safe categories", () => {
    expect(classifyLoginError({ code: "invalid_credentials" })).toBe(
      "invalid_credentials",
    );
    expect(classifyLoginError(new TypeError("Failed to fetch"))).toBe(
      "network",
    );
    expect(classifyLoginError({ name: "AuthApiError", status: 500 })).toBe(
      "generic",
    );
  });
});
