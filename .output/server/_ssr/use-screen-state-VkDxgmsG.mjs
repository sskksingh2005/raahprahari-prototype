import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/use-screen-state-VkDxgmsG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Loading / error / ready state for screens fed by the local store.
*
* The data is synchronous, so the first render is never a skeleton (that would
* only hide server-rendered content). `probe` says whether the data can be
* shown; if it throws or returns false the screen is in the error state.
* `retry` shows the loading skeleton briefly and then checks the data again.
*/
function useScreenState(probe) {
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!loading) return;
		const timer = window.setTimeout(() => setLoading(false), 300);
		return () => window.clearTimeout(timer);
	}, [loading]);
	const retry = (0, import_react.useCallback)(() => setLoading(true), []);
	if (loading) return {
		status: "loading",
		retry
	};
	let ok = false;
	try {
		ok = probe();
	} catch (error) {
		console.error("Screen data check failed", error);
	}
	return {
		status: ok ? "ready" : "error",
		retry
	};
}
export { useScreenState };
