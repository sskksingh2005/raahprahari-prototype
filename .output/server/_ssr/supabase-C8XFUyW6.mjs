import { createClient } from "../_libs/supabase__supabase-js.mjs";
// node_modules/.nitro/vite/services/ssr/assets/supabase-C8XFUyW6.js
var APP_ENVS = [
	"development",
	"demo",
	"pilot"
];
function jwtRole(token) {
	const parts = token.split(".");
	if (parts.length !== 3) return null;
	try {
		const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, "=");
		const payload = JSON.parse(atob(padded));
		return typeof payload.role === "string" ? payload.role : null;
	} catch {
		return null;
	}
}
function isSecretKey(value) {
	if (value.startsWith("sb_secret_")) return true;
	return jwtRole(value) === "service_role";
}
function loadEnv() {
	const errors = [];
	const appEnv = "development";
	const url = "https://dknochhvtmqfrkxzlttl.supabase.co";
	const anonKey = "sb_publishable_6rto9vEC_fbKrFYvJSpPKg_NTD_k2mi";
	if (!APP_ENVS.includes(appEnv)) errors.push(`VITE_APP_ENV galat ya missing. Allowed: ${APP_ENVS.join(" | ")}`);
	try {
		new URL(url);
	} catch {
		errors.push("VITE_SUPABASE_URL valid URL nahi hai.");
	}
	if (isSecretKey(anonKey)) errors.push("VITE_SUPABASE_ANON_KEY me SECRET (service_role) key mili. Browser me secret key kabhi nahi jati. Use turant hatao aur Supabase dashboard se rotate karo.");
	for (const name of Object.keys({
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_APP_ENV": "development",
		"VITE_SUPABASE_ANON_KEY": "sb_publishable_6rto9vEC_fbKrFYvJSpPKg_NTD_k2mi",
		"VITE_SUPABASE_URL": "https://dknochhvtmqfrkxzlttl.supabase.co"
	})) if (name.startsWith("VITE_") && /SECRET|SERVICE_ROLE|PRIVATE|PASSWORD/i.test(name)) errors.push(`${name} ka naam secret jaisa hai. VITE_ variables browser me public hote hain.`);
	if (errors.length > 0) throw new Error("Environment config galat hai:\n- " + errors.join("\n- "));
	return {
		appEnv,
		supabaseUrl: url,
		supabaseAnonKey: anonKey,
		isSynthetic: true
	};
}
var env = loadEnv();
/** Thrown when the browser build lacks public Supabase configuration. */
var SupabaseConfigError = class extends Error {
	constructor(missing) {
		super(`Supabase is not configured. Missing environment variable(s): ${missing.join(", ")}. Set them in .env.local and restart the dev server.`);
		this.name = "SupabaseConfigError";
	}
};
var client = null;
/** True when public Supabase configuration is present. */
function isSupabaseConfigured() {
	return Boolean(env.supabaseUrl.trim() && env.supabaseAnonKey.trim());
}
/**
* Returns the browser Supabase client.
* Only the public URL and anon key are used.
* Role checks must still be enforced by the backend (RLS).
*/
function getSupabaseClient() {
	if (client) return client;
	if (typeof window === "undefined") throw new Error("The Supabase browser client is unavailable during SSR.");
	const url = env.supabaseUrl.trim();
	const anonKey = env.supabaseAnonKey.trim();
	const missing = [!url && "VITE_SUPABASE_URL", !anonKey && "VITE_SUPABASE_ANON_KEY"].filter((name) => Boolean(name));
	if (!url || !anonKey) throw new SupabaseConfigError(missing);
	client = createClient(url, anonKey, { auth: {
		persistSession: true,
		autoRefreshToken: true,
		flowType: "pkce",
		detectSessionInUrl: false
	} });
	return client;
}
export { SupabaseConfigError, env, getSupabaseClient, isSupabaseConfigured };
