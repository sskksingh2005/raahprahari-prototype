import { __toESM } from "../_runtime.mjs";
import { require_react } from "./react.mjs";
import { require_jsx_runtime } from "./react2.mjs";
import { Primitive } from "./radix-ui__react-primitive.mjs";
// node_modules/.pnpm/@radix-ui+react-arrow@1.1.1_42c166494782f9339172e39dfcc4494e/node_modules/@radix-ui/react-arrow/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var Arrow = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function Arrow2(props, forwardedRef) {
	const { children, width = 10, height = 5, ...arrowProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.svg, {
		...arrowProps,
		ref: forwardedRef,
		width,
		height,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: props.asChild ? children : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: "0,0 30,0 15,10" })
	});
}, "Arrow"));
export { Arrow };
