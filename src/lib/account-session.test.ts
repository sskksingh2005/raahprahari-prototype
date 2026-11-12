import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connectSupabaseSession,
  getAccessToken,
  getAccountSession,
  setAccountSession,
  signOutAccount,
  type SupabaseAuthLike,
} from "@/lib/account-session";

type Listener = Parameters<SupabaseAuthLike["onAuthStateChange"]>[0];
type FakeSession = {
  access_token: string;
  expires_at?: number;
  user: { id: string };
};

function fakeAuth(initial: FakeSession | null) {
  let current = initial;
  let listener: Listener | null = null;
  const unsubscribe = vi.fn();
  const auth: SupabaseAuthLike = {
    getSession: vi.fn(async () => ({
      data: { session: current },
      error: null,
    })),
    onAuthStateChange: vi.fn((cb: Listener) => {
      listener = cb;
      return { data: { subscription: { unsubscribe } } };
    }),
    signOut: vi.fn(async () => {
      current = null;
      listener?.("SIGNED_OUT", null);
      return { error: null };
    }),
  };
  return {
    auth,
    unsubscribe,
    emit: (event: string, next: FakeSession | null) => {
      current = next;
      listener?.(event, next);
    },
  };
}

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;
let disconnect: (() => void) | undefined;

afterEach(() => {
  disconnect?.();
  disconnect = undefined;
  setAccountSession({ status: "signed_out", userId: null });
});

describe("Supabase account session bridge", () => {
  it("starts loading, then restores a persisted session", async () => {
    const fake = fakeAuth({
      access_token: "a",
      expires_at: inOneHour(),
      user: { id: "u1" },
    });
    disconnect = connectSupabaseSession(fake.auth);
    expect(getAccountSession().status).toBe("loading");
    await vi.waitFor(() =>
      expect(getAccountSession()).toMatchObject({
        status: "authenticated",
        userId: "u1",
      }),
    );
    expect(await getAccessToken()).toBe("a");
  });

  it("stays signed out when there is no persisted session", async () => {
    const fake = fakeAuth(null);
    disconnect = connectSupabaseSession(fake.auth);
    await vi.waitFor(() =>
      expect(getAccountSession().status).toBe("signed_out"),
    );
  });

  it("follows auth state changes and treats an expired session as signed out", async () => {
    const fake = fakeAuth(null);
    disconnect = connectSupabaseSession(fake.auth);
    await vi.waitFor(() =>
      expect(getAccountSession().status).toBe("signed_out"),
    );
    fake.emit("SIGNED_IN", {
      access_token: "b",
      expires_at: inOneHour(),
      user: { id: "u2" },
    });
    expect(getAccountSession()).toMatchObject({
      status: "authenticated",
      userId: "u2",
    });
    fake.emit("TOKEN_REFRESHED", {
      access_token: "c",
      expires_at: Math.floor(Date.now() / 1000) - 10,
      user: { id: "u2" },
    });
    expect(getAccountSession().status).toBe("signed_out");
  });

  it("signs out through the provider and unsubscribes on disconnect", async () => {
    const fake = fakeAuth({
      access_token: "a",
      expires_at: inOneHour(),
      user: { id: "u1" },
    });
    disconnect = connectSupabaseSession(fake.auth);
    await vi.waitFor(() =>
      expect(getAccountSession().status).toBe("authenticated"),
    );
    await signOutAccount();
    expect(fake.auth.signOut).toHaveBeenCalled();
    expect(getAccountSession().status).toBe("signed_out");
    disconnect();
    disconnect = undefined;
    expect(fake.unsubscribe).toHaveBeenCalled();
  });
});
