import "../_runtime.mjs";
import { cn } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { LoaderCircle } from "../_libs/lucide-react24.mjs";
import { cva } from "../_libs/class-variance-authority.mjs";
import { Slot } from "../_libs/@radix-ui/react-arrow+[...].mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
/**
* Motion comes from the `rp-interactive` class in `src/styles.css`: hover lift,
* press scale, shadow and the not-allowed cursor. Hover colours are tokens
* (`primary-hover`, `secondary-hover`, `report-hover`). The focus ring classes
* below must stay on every variant.
*/
var buttonVariants = cva("rp-interactive relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary-hover",
			report: "glass-btn-accent",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
			outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
			ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-4 py-2 has-[>svg]:px-3",
			xs: "h-11 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-11 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
			lg: "h-11 rounded-md px-6 has-[>svg]:px-4",
			icon: "size-11",
			"icon-xs": "size-11 rounded-md [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-11",
			"icon-lg": "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant = "default", size = "default", asChild = false, loading = false, disabled, children, ...props }) {
	const Comp = asChild ? Slot : "button";
	const loadingProps = loading ? {
		"aria-busy": true,
		"data-loading": "true"
	} : {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		"data-slot": "button",
		"data-variant": variant,
		"data-size": size,
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		disabled: asChild ? disabled : disabled || loading,
		...loadingProps,
		...props,
		children: loading && !asChild ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "absolute inset-0 grid place-items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 motion-safe:animate-spin" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-flex items-center justify-center gap-[inherit] opacity-0",
			children
		})] }) : children
	});
}
export { Button };
