import { useSyncExternalStore } from "react";

export type AccountSession =
  | { status: "loading"; userId: null; expiresAt?: null }
  | { status: "signed_out"; userId: null; expiresAt?: null }
  | {
      status: "authenticated";
      userId: string;
      expiresAt?: number | null;
      /** Display only; never used for access decisions. */
      email?: string | null;
      /** Role loaded from the user's protected profile row; UI-only convenience. */
      role?: string | null;
    };

type AccessTokenProvider = () => Promise<string | null>;

const listeners = new Set<() => void>();
let session: AccountSession = { status: "signed_out", userId: null };
let accessTokenProvider: AccessTokenProvider | null = null;

function emitChange() {
  for (const listener of listeners) listener();
}

export function getAccountSession() {
  return session;
}

export function setAccountSession(next: AccountSession) {
  if (
    next.status === "authenticated" &&
    typeof next.expiresAt === "number" &&
    next.expiresAt <= Date.now()
  ) {
    session = { status: "signed_out", userId: null };
  } else {
    session = next;
  }
  emitChange();
}

export function subscribeAccountSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAccountSession() {
  return useSyncExternalStore(
    subscribeAccountSession,
    getAccountSession,
    getAccountSession,
  );
}

export function setAccessTokenProvider(provider: AccessTokenProvider | null) {
  accessTokenProvider = provider;
}

/** Minimal slice of the Supabase auth client used by the session bridge. */
type AuthSessionLike = {
  access_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string | null;
    app_metadata?: Record<string, unknown> | null;
    user_metadata?: Record<string, unknown> | null;
  };
};

export type SupabaseAuthLike = {
  getSession(): Promise<{
    data: { session: AuthSessionLike | null };
    error: unknown;
  }>;
  onAuthStateChange(
    callback: (event: string, session: AuthSessionLike | null) => void,
  ): { data: { subscription: { unsubscribe(): void } } };
  signOut(): Promise<{ error: unknown }>;
};

export type ProfileRoleLoader = (userId: string) => Promise<string | null>;

let signOutHandler: (() => Promise<void>) | null = null;

/** Mirrors a provider session into the account session (null signs out). */
export function applyAuthSession(authSession: AuthSessionLike | null) {
  if (!authSession?.user?.id || !authSession.access_token) {
    setAccountSession({ status: "signed_out", userId: null });
    return;
  }
  const previous = getAccountSession();
  const role =
    previous.status === "authenticated" &&
    previous.userId === authSession.user.id
      ? (previous.role ?? null)
      : null;
  setAccountSession({
    status: "authenticated",
    userId: authSession.user.id,
    // Supabase reports expiry in seconds since the epoch.
    expiresAt:
      typeof authSession.expires_at === "number"
        ? authSession.expires_at * 1000
        : null,
    email: authSession.user.email ?? null,
    role: typeof role === "string" && role.trim() ? role.trim() : null,
  });
}

/**
 * Connects the account session to Supabase auth. The session is only marked
 * authenticated when Supabase returns a session with a user and access token.
 * Returns a disconnect function.
 */
export function connectSupabaseSession(
  auth: SupabaseAuthLike,
  loadProfileRole?: ProfileRoleLoader,
) {
  let active = true;
  let receivedAuthEvent = false;
  let profileRoleRequest = 0;
  setAccountSession({ status: "loading", userId: null });

  const applyConnectedSession = (authSession: AuthSessionLike | null) => {
    const request = ++profileRoleRequest;
    applyAuthSession(authSession);
    if (!loadProfileRole) return;

    const current = getAccountSession();
    if (current.status !== "authenticated") return;
    const userId = current.userId;
    setAccountSession({ ...current, role: null });

    void Promise.resolve()
      .then(() => loadProfileRole(userId))
      .then((role) => {
        const latest = getAccountSession();
        if (
          !active ||
          request !== profileRoleRequest ||
          latest.status !== "authenticated" ||
          latest.userId !== userId
        ) {
          return;
        }
        setAccountSession({
          ...latest,
          role: typeof role === "string" && role.trim() ? role.trim() : null,
        });
      })
      .catch((error: unknown) => {
        const latest = getAccountSession();
        if (
          active &&
          request === profileRoleRequest &&
          latest.status === "authenticated" &&
          latest.userId === userId
        ) {
          console.error("[auth] profile role lookup failed", error);
        }
      });
  };

  const { data } = auth.onAuthStateChange((_event, authSession) => {
    receivedAuthEvent = true;
    if (active) applyConnectedSession(authSession);
  });

  void auth
    .getSession()
    .then(({ data: restored, error }) => {
      if (!active || receivedAuthEvent) return;
      applyConnectedSession(error ? null : restored.session);
    })
    .catch(() => {
      if (active && !receivedAuthEvent) applyAuthSession(null);
    });

  setAccessTokenProvider(async () => {
    // getSession refreshes an expired token when a refresh token is available.
    const { data: current, error } = await auth.getSession();
    if (error || !current.session) {
      applyAuthSession(null);
      return null;
    }
    applyAuthSession(current.session);
    return current.session.access_token;
  });

  signOutHandler = async () => {
    const { error } = await auth.signOut();
    if (error) throw error;
  };

  return () => {
    active = false;
    profileRoleRequest++;
    data.subscription.unsubscribe();
    setAccessTokenProvider(null);
    signOutHandler = null;
  };
}

/** Signs out of the connected provider; the local session clears either way. */
export async function signOutAccount() {
  try {
    if (signOutHandler) await signOutHandler();
  } finally {
    setAccountSession({ status: "signed_out", userId: null });
  }
}

export async function getAccessToken() {
  const current = getAccountSession();
  if (current.status !== "authenticated") return null;
  if (
    typeof current.expiresAt === "number" &&
    current.expiresAt <= Date.now() &&
    !accessTokenProvider
  ) {
    setAccountSession({ status: "signed_out", userId: null });
    return null;
  }
  // A connected provider may refresh an expired token or report sign-out.
  return accessTokenProvider ? accessTokenProvider() : null;
}
