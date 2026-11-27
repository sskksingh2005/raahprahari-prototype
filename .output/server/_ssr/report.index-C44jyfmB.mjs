import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Route$9 } from "./router-ip9NLZv6.mjs";
import { ReportStepPage } from "./report-step-page-DxVRkcCI.mjs";
// node_modules/.nitro/vite/services/ssr/assets/report.index-C44jyfmB.js
var import_jsx_runtime = require_jsx_runtime();
function ReportObservationPage() {
	const navigate = useNavigate();
	const { segment } = Route$9.useSearch();
	const go = (path) => {
		if (path === "/") navigate({ to: path });
		else navigate({
			to: path,
			search: { segment: void 0 }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportStepPage, {
		step: "observation",
		navigate: go,
		prefillSegmentId: segment
	});
}
export { ReportObservationPage as component };
