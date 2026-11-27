import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ReportStepPage } from "./report-step-page-DxVRkcCI.mjs";
// node_modules/.nitro/vite/services/ssr/assets/report.photo-DAYzxVvq.js
var import_jsx_runtime = require_jsx_runtime();
function ReportPhotoPage() {
	const navigate = useNavigate();
	const go = (path) => {
		if (path === "/") navigate({ to: path });
		else navigate({
			to: path,
			search: { segment: void 0 }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportStepPage, {
		step: "photo",
		navigate: go
	});
}
export { ReportPhotoPage as component };
