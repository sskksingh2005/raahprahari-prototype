import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/account-session-Cz43bjtr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var listeners = /* @__PURE__ */ new Set();
var session = {
	status: "signed_out",
	userId: null
};
var accessTokenProvider = null;
function emitChange() {
	for (const listener of listeners) listener();
}
function getAccountSession() {
	return session;
}
function setAccountSession(next) {
	if (next.status === "authenticated" && typeof next.expiresAt === "number" && next.expiresAt <= Date.now()) session = {
		status: "signed_out",
		userId: null
	};
	else session = next;
	emitChange();
}
function subscribeAccountSession(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function useAccountSession() {
	return (0, import_react.useSyncExternalStore)(subscribeAccountSession, getAccountSession, getAccountSession);
}
function setAccessTokenProvider(provider) {
	accessTokenProvider = provider;
}
var signOutHandler = null;
/** Mirrors a provider session into the account session (null signs out). */
function applyAuthSession(authSession) {
	if (!authSession?.user?.id || !authSession.access_token) {
		setAccountSession({
			status: "signed_out",
			userId: null
		});
		return;
	}
	const role = authSession.user.app_metadata?.role;
	setAccountSession({
		status: "authenticated",
		userId: authSession.user.id,
		expiresAt: typeof authSession.expires_at === "number" ? authSession.expires_at * 1e3 : null,
		email: authSession.user.email ?? null,
		role: typeof role === "string" && role.trim() ? role.trim() : null
	});
}
/**
* Connects the account session to Supabase auth. The session is only marked
* authenticated when Supabase returns a session with a user and access token.
* Returns a disconnect function.
*/
function connectSupabaseSession(auth) {
	let active = true;
	let receivedAuthEvent = false;
	setAccountSession({
		status: "loading",
		userId: null
	});
	const { data } = auth.onAuthStateChange((_event, authSession) => {
		receivedAuthEvent = true;
		if (active) applyAuthSession(authSession);
	});
	auth.getSession().then(({ data: restored, error }) => {
		if (!active || receivedAuthEvent) return;
		applyAuthSession(error ? null : restored.session);
	}).catch(() => {
		if (active && !receivedAuthEvent) applyAuthSession(null);
	});
	setAccessTokenProvider(async () => {
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
		data.subscription.unsubscribe();
		setAccessTokenProvider(null);
		signOutHandler = null;
	};
}
/** Signs out of the connected provider; the local session clears either way. */
async function signOutAccount() {
	try {
		if (signOutHandler) await signOutHandler();
	} finally {
		setAccountSession({
			status: "signed_out",
			userId: null
		});
	}
}
async function getAccessToken() {
	const current = getAccountSession();
	if (current.status !== "authenticated") return null;
	if (typeof current.expiresAt === "number" && current.expiresAt <= Date.now() && !accessTokenProvider) {
		setAccountSession({
			status: "signed_out",
			userId: null
		});
		return null;
	}
	return accessTokenProvider ? accessTokenProvider() : null;
}
export { applyAuthSession, connectSupabaseSession, getAccessToken, getAccountSession, setAccessTokenProvider, setAccountSession, signOutAccount, subscribeAccountSession, useAccountSession };
