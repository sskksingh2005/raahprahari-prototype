import { __toESM } from "../_runtime.mjs";
import { require_react } from "./react.mjs";
import { require_jsx_runtime } from "./react2.mjs";
import { Primitive } from "./radix-ui__react-primitive.mjs";
// node_modules/.pnpm/@radix-ui+react-label@2.1.1_eb0a38c33d4564f6f3168e806730df70/node_modules/@radix-ui/react-label/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var Label = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function Label2(props, forwardedRef) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.label, {
		...props,
		ref: forwardedRef,
		onMouseDown: (event) => {
			if (event.target.closest("button, input, select, textarea")) return;
			props.onMouseDown?.(event);
			if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
		}
	});
}, "Label"));
export { Label };
