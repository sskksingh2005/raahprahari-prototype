import { __toESM } from "../_runtime.mjs";
import { cn } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { CircleAlert } from "../_libs/lucide-react11.mjs";
import { Label as Label$1 } from "../_libs/radix-ui__react-label.mjs";
// node_modules/.nitro/vite/services/ssr/assets/field-Ds5sKygr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
		"data-slot": "label",
		className: cn("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
var FieldContext = import_react.createContext(null);
function Field({ id, label, description, error, required = false, className, children }) {
	const generatedId = import_react.useId();
	const controlId = id ?? generatedId;
	const context = {
		id: controlId,
		descriptionId: description ? `${controlId}-description` : void 0,
		errorId: error ? `${controlId}-error` : void 0,
		error,
		required
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid gap-2", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor: controlId,
				children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"aria-hidden": "true",
					className: "text-destructive",
					children: [" ", "*"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldContext.Provider, {
				value: context,
				children
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: context.descriptionId,
				className: "text-sm text-muted-foreground",
				children: description
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				id: context.errorId,
				role: "alert",
				className: "rp-slide-down flex items-start gap-1.5 text-sm text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					"aria-hidden": true,
					className: "rp-pop mt-0.5 size-4 shrink-0"
				}), error]
			})
		]
	});
}
function useFieldProps(props) {
	const context = import_react.useContext(FieldContext);
	if (!context) return props;
	const describedBy = [
		props["aria-describedby"],
		context.descriptionId,
		context.errorId
	].filter(Boolean).join(" ");
	return {
		...props,
		id: context.id,
		required: props.required ?? context.required,
		"aria-describedby": describedBy || void 0,
		"aria-invalid": context.error ? true : props["aria-invalid"]
	};
}
export { Field, Label, useFieldProps };
