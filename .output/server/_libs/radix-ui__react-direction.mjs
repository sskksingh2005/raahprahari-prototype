import { __toESM } from "../_runtime.mjs";
import { require_react } from "./react.mjs";
import { require_jsx_runtime } from "./react2.mjs";
// node_modules/.pnpm/@radix-ui+react-direction@1_527de58341a1b41b1117c799ae82b79a/node_modules/@radix-ui/react-direction/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
require_jsx_runtime();
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var Direction = {
	LTR: "ltr",
	RTL: "rtl"
};
var DirectionContext = import_react.createContext(void 0);
function useDirection(localDir) {
	const globalDir = import_react.useContext(DirectionContext);
	return localDir || globalDir || Direction.LTR;
}
__name(useDirection, "useDirection");
export { useDirection };
