import { __toESM } from "../_runtime.mjs";
import { require_react } from "./react.mjs";
import { require_jsx_runtime } from "./react2.mjs";
import { useComposedRefs } from "./@radix-ui/react-arrow+[...].mjs";
import { composeEventHandlers } from "./radix-ui__primitive.mjs";
import { Presence, createContextScope, useControllableState, useSize } from "./@radix-ui/react-checkbox+[...].mjs";
import { Primitive } from "./radix-ui__react-primitive.mjs";
import { RovingFocusGroup, RovingFocusGroupItem, createRovingFocusGroupScope } from "./@radix-ui/react-dropdown-menu+[...].mjs";
import { useDirection } from "./radix-ui__react-direction.mjs";
// node_modules/.pnpm/@radix-ui+react-radio-group_ae0ff636ebae498d6158983d1b2a7fd8/node_modules/@radix-ui/react-radio-group/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var RADIO_NAME = "Radio";
var [createRadioContext, createRadioScope] = createContextScope(RADIO_NAME);
var [RadioProviderImpl, useRadioContext] = createRadioContext(RADIO_NAME);
function RadioProvider(props) {
	const { __scopeRadio, checked = false, children, disabled, form, name, onCheck, required, value = "on", internal_do_not_use_render } = props;
	const [control, setControl] = import_react.useState(null);
	const [bubbleInput, setBubbleInput] = import_react.useState(null);
	const [userClick, setUserClick] = import_react.useState(null);
	const context = {
		checked,
		disabled,
		required,
		name,
		form,
		value,
		control,
		setControl,
		userClick,
		onUserClick: setUserClick,
		isFormControl: control ? !!form || !!control.closest("form") : true,
		bubbleInput,
		setBubbleInput,
		onCheck: /* @__PURE__ */ __name(() => onCheck?.(), "onCheck")
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioProviderImpl, {
		scope: __scopeRadio,
		...context,
		children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
	});
}
__name(RadioProvider, "RadioProvider");
var TRIGGER_NAME = "RadioTrigger";
var RadioTrigger = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioTrigger2({ __scopeRadio, onClick, ...radioProps }, forwardedRef) {
	const { checked, disabled, value, setControl, onCheck, onUserClick, isFormControl, bubbleInput } = useRadioContext(TRIGGER_NAME, __scopeRadio);
	const composedRefs = useComposedRefs(forwardedRef, setControl);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.button, {
		type: "button",
		role: "radio",
		"aria-checked": checked,
		"data-state": getState(checked),
		"data-disabled": disabled ? "" : void 0,
		disabled,
		value,
		...radioProps,
		ref: composedRefs,
		onClick: composeEventHandlers(onClick, (event) => {
			const hasConsumerStoppedPropagation = event.isPropagationStopped();
			if (!checked) {
				onUserClick({ hasConsumerStoppedPropagation });
				onCheck();
			}
			if (bubbleInput && isFormControl) {
				if (!hasConsumerStoppedPropagation) event.stopPropagation();
			}
		})
	});
}, "RadioTrigger"));
var INDICATOR_NAME = "RadioIndicator";
var RadioIndicator = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioIndicator2(props, forwardedRef) {
	const { __scopeRadio, forceMount, ...indicatorProps } = props;
	const context = useRadioContext(INDICATOR_NAME, __scopeRadio);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || context.checked,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
			"data-state": getState(context.checked),
			"data-disabled": context.disabled ? "" : void 0,
			...indicatorProps,
			ref: forwardedRef
		})
	});
}, "RadioIndicator"));
var BUBBLE_INPUT_NAME = "RadioBubbleInput";
var RadioBubbleInput = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioBubbleInput2({ __scopeRadio, onClick, ...props }, forwardedRef) {
	const { control, checked, required, disabled, name, value, form, bubbleInput, setBubbleInput, userClick } = useRadioContext(BUBBLE_INPUT_NAME, __scopeRadio);
	const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
	const controlSize = useSize(control);
	const shouldStopClickPropagationRef = import_react.useRef(false);
	const prevCheckedRef = import_react.useRef(checked);
	const handledUserClickRef = import_react.useRef(userClick);
	const pendingUserClickRef = import_react.useRef(null);
	import_react.useEffect(() => {
		const input = bubbleInput;
		if (!input) return;
		const inputProto = window.HTMLInputElement.prototype;
		const setChecked = Object.getOwnPropertyDescriptor(inputProto, "checked").set;
		if (!setChecked) return;
		const checkedChanged = prevCheckedRef.current !== checked;
		prevCheckedRef.current = checked;
		const isNewUserClick = userClick !== null && userClick !== handledUserClickRef.current;
		handledUserClickRef.current = userClick;
		if (isNewUserClick) {
			pendingUserClickRef.current = checkedChanged ? null : userClick;
			if (checkedChanged) setChecked.call(input, checked);
			input.dispatchEvent(new Event("click", { bubbles: !userClick.hasConsumerStoppedPropagation }));
		} else if (checkedChanged) {
			const pendingUserClick = pendingUserClickRef.current;
			pendingUserClickRef.current = null;
			const isPendingUserChange = checked && pendingUserClick !== null;
			shouldStopClickPropagationRef.current = true;
			setChecked.call(input, checked);
			input.dispatchEvent(new Event("click", { bubbles: !(isPendingUserChange && pendingUserClick.hasConsumerStoppedPropagation) }));
			shouldStopClickPropagationRef.current = false;
		}
	}, [
		bubbleInput,
		checked,
		userClick
	]);
	const defaultCheckedRef = import_react.useRef(checked);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.input, {
		type: "radio",
		"aria-hidden": true,
		defaultChecked: defaultCheckedRef.current,
		required,
		disabled,
		name,
		value,
		form,
		...props,
		tabIndex: -1,
		ref: composedRefs,
		onClick: composeEventHandlers(onClick, (event) => {
			if (shouldStopClickPropagationRef.current) event.stopPropagation();
		}),
		style: {
			...props.style,
			...controlSize,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
}, "RadioBubbleInput"));
function isFunction(value) {
	return typeof value === "function";
}
__name(isFunction, "isFunction");
function getState(checked) {
	return checked ? "checked" : "unchecked";
}
__name(getState, "getState");
var ARROW_KEYS = [
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
];
var RADIO_GROUP_NAME = "RadioGroup";
var [createRadioGroupContext, createRadioGroupScope] = createContextScope(RADIO_GROUP_NAME, [createRovingFocusGroupScope, createRadioScope]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var useRadioScope = createRadioScope();
var [RadioGroupProvider, useRadioGroupContext] = createRadioGroupContext(RADIO_GROUP_NAME);
var RadioGroup = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioGroup2(props, forwardedRef) {
	const { __scopeRadioGroup, name, form, defaultValue, value: valueProp, required = false, disabled = false, orientation, dir, loop = true, onValueChange, ...groupProps } = props;
	const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
	const direction = useDirection(dir);
	const [value, setValue] = useControllableState({
		prop: valueProp,
		defaultProp: defaultValue ?? null,
		onChange: onValueChange,
		caller: RADIO_GROUP_NAME
	});
	const [control, setControl] = import_react.useState(null);
	const composedRefs = useComposedRefs(forwardedRef, setControl);
	const initialValueRef = import_react.useRef(value);
	import_react.useEffect(() => {
		const associatedForm = form ? control?.ownerDocument.getElementById(form) : control?.closest("form");
		if (associatedForm instanceof HTMLFormElement) {
			const reset = /* @__PURE__ */ __name(() => setValue(initialValueRef.current), "reset");
			associatedForm.addEventListener("reset", reset);
			return () => associatedForm.removeEventListener("reset", reset);
		}
	}, [
		control,
		form,
		setValue
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupProvider, {
		scope: __scopeRadioGroup,
		name,
		form,
		required,
		disabled,
		value,
		onValueChange: setValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RovingFocusGroup, {
			asChild: true,
			...rovingFocusGroupScope,
			orientation,
			dir: direction,
			loop,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
				role: "radiogroup",
				"aria-required": required,
				"aria-orientation": orientation,
				"data-disabled": disabled ? "" : void 0,
				dir: direction,
				...groupProps,
				ref: composedRefs
			})
		})
	});
}, "RadioGroup"));
var ITEM_PROVIDER_NAME = "RadioGroupItemProvider";
var ITEM_TRIGGER_NAME = "RadioGroupItemTrigger";
function RadioGroupItemProvider(props) {
	const { __scopeRadioGroup, value, disabled, children, internal_do_not_use_render } = props;
	const context = useRadioGroupContext(ITEM_PROVIDER_NAME, __scopeRadioGroup);
	const radioScope = useRadioScope(__scopeRadioGroup);
	const isDisabled = context.disabled || disabled;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioProvider, {
		...radioScope,
		checked: context.value === value,
		disabled: isDisabled,
		required: context.required,
		name: context.name,
		form: context.form,
		value,
		onCheck: () => context.onValueChange(value),
		internal_do_not_use_render,
		children
	});
}
__name(RadioGroupItemProvider, "RadioGroupItemProvider");
var RadioGroupItemTrigger = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioGroupItemTrigger2(props, forwardedRef) {
	const { __scopeRadioGroup, ...triggerProps } = props;
	const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
	const radioScope = useRadioScope(__scopeRadioGroup);
	const { checked, disabled } = useRadioContext(ITEM_TRIGGER_NAME, radioScope.__scopeRadio);
	const ref = import_react.useRef(null);
	const composedRefs = useComposedRefs(forwardedRef, ref);
	const isArrowKeyPressedRef = import_react.useRef(false);
	import_react.useEffect(() => {
		const handleKeyDown = /* @__PURE__ */ __name((event) => {
			if (ARROW_KEYS.includes(event.key)) isArrowKeyPressedRef.current = true;
		}, "handleKeyDown");
		const handleKeyUp = /* @__PURE__ */ __name(() => isArrowKeyPressedRef.current = false, "handleKeyUp");
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RovingFocusGroupItem, {
		asChild: true,
		...rovingFocusGroupScope,
		focusable: !disabled,
		active: checked,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioTrigger, {
			...radioScope,
			...triggerProps,
			ref: composedRefs,
			onKeyDown: composeEventHandlers(triggerProps.onKeyDown, (event) => {
				if (event.key === "Enter") event.preventDefault();
			}),
			onFocus: composeEventHandlers(triggerProps.onFocus, () => {
				if (isArrowKeyPressedRef.current) ref.current?.click();
			})
		})
	});
}, "RadioGroupItemTrigger"));
var RadioGroupItem = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioGroupItem2(props, forwardedRef) {
	const { __scopeRadioGroup, value, disabled, ...itemProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItemProvider, {
		__scopeRadioGroup,
		value,
		disabled,
		internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItemTrigger, {
			...itemProps,
			ref: forwardedRef,
			__scopeRadioGroup
		}), isFormControl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItemBubbleInput, { __scopeRadioGroup })] })
	});
}, "RadioGroupItem"));
var RadioGroupItemBubbleInput = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioGroupItemBubbleInput2(props, forwardedRef) {
	const { __scopeRadioGroup, ...bubbleProps } = props;
	const radioScope = useRadioScope(__scopeRadioGroup);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioBubbleInput, {
		...radioScope,
		...bubbleProps,
		ref: forwardedRef
	});
}, "RadioGroupItemBubbleInput"));
var RadioGroupIndicator = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function RadioGroupIndicator2(props, forwardedRef) {
	const { __scopeRadioGroup, ...indicatorProps } = props;
	const radioScope = useRadioScope(__scopeRadioGroup);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioIndicator, {
		...radioScope,
		...indicatorProps,
		ref: forwardedRef
	});
}, "RadioGroupIndicator"));
export { RadioGroup, RadioGroupIndicator, RadioGroupItem };
