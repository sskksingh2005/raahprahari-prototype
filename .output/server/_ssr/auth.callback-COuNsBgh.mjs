import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/react.mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { AuthCallbackPage } from "./auth-pages-DidoaSgX.mjs";
// node_modules/.nitro/vite/services/ssr/assets/auth.callback-COuNsBgh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthCallbackRoute() {
	const navigate = useNavigate();
	const onContinue = (0, import_react.useCallback)((next) => void navigate({
		to: next,
		replace: true
	}), [navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthCallbackPage, { onContinue });
}
export { AuthCallbackRoute as component };
