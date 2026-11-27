import { __toESM } from "../_runtime.mjs";
import { usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { PageBanner } from "./page-banner-CQjN88G-.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contact-BMjq9sOW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContactPage() {
	const { t } = usePrefs();
	const [errors, setErrors] = (0, import_react.useState)({});
	const [notice, setNotice] = (0, import_react.useState)(false);
	function validateField(field, value) {
		const trimmedValue = value.trim();
		if (field === "name" && !trimmedValue) return "contactPage.nameError";
		if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return "contactPage.emailError";
		if (field === "message" && !trimmedValue) return "contactPage.messageError";
	}
	function handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const message = String(formData.get("message") ?? "").trim();
		const nextErrors = {};
		const nameError = validateField("name", name);
		const emailError = validateField("email", email);
		const messageError = validateField("message", message);
		if (nameError) nextErrors.name = nameError;
		if (emailError) nextErrors.email = emailError;
		if (messageError) nextErrors.message = messageError;
		setErrors(nextErrors);
		setNotice(Object.keys(nextErrors).length === 0);
		const firstInvalid = [
			"name",
			"email",
			"message"
		].find((field) => nextErrors[field]);
		if (firstInvalid) document.getElementById(`contact-${firstInvalid}`)?.focus();
	}
	function validateOnBlur(field, value) {
		const error = validateField(field, value);
		setErrors((previous) => {
			if (previous[field] === error) return previous;
			const next = { ...previous };
			if (error) next[field] = error;
			else delete next[field];
			return next;
		});
		setNotice(false);
	}
	function clearFieldError(field) {
		setErrors((previous) => {
			if (!previous[field]) return previous;
			const next = { ...previous };
			delete next[field];
			return next;
		});
		setNotice(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-info-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBanner, {
			eyebrow: t("contactPage.eyebrow"),
			title: t("contact.title"),
			description: t("contactPage.description")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rp-info-container rp-info-content",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rp-info-card glass-strong mx-auto max-w-2xl",
				"aria-labelledby": "contact-form-title",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "contact-form-title",
						children: t("contactPage.formTitle")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-5",
						children: t("contactPage.formIntro")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "rp-contact-form",
						onSubmit: handleSubmit,
						noValidate: true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rp-contact-field",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "contact-name",
										children: t("contactPage.name")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "contact-name-help",
										className: "rp-contact-help",
										children: t("contactPage.nameHelp")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "contact-name",
										name: "name",
										type: "text",
										autoComplete: "name",
										maxLength: 100,
										required: true,
										"aria-invalid": Boolean(errors.name),
										"aria-describedby": `contact-name-help${errors.name ? " contact-name-error" : ""}`,
										className: "rp-contact-control glass",
										onChange: () => clearFieldError("name"),
										onBlur: (event) => validateOnBlur("name", event.currentTarget.value)
									}),
									errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "contact-name-error",
										className: "rp-contact-error",
										role: "alert",
										children: t(errors.name)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rp-contact-field",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "contact-email",
										children: t("contactPage.email")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "contact-email-help",
										className: "rp-contact-help",
										children: t("contactPage.emailHelp")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "contact-email",
										name: "email",
										type: "email",
										autoComplete: "email",
										maxLength: 254,
										required: true,
										"aria-invalid": Boolean(errors.email),
										"aria-describedby": `contact-email-help${errors.email ? " contact-email-error" : ""}`,
										className: "rp-contact-control glass",
										onChange: () => clearFieldError("email"),
										onBlur: (event) => validateOnBlur("email", event.currentTarget.value)
									}),
									errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "contact-email-error",
										className: "rp-contact-error",
										role: "alert",
										children: t(errors.email)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rp-contact-field",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "contact-message",
										children: t("contactPage.message")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "contact-message-help",
										className: "rp-contact-help",
										children: t("contactPage.messageHelp")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "contact-message",
										name: "message",
										maxLength: 2e3,
										required: true,
										"aria-invalid": Boolean(errors.message),
										"aria-describedby": `contact-message-help${errors.message ? " contact-message-error" : ""}`,
										className: "rp-contact-control glass rp-contact-message",
										onChange: () => clearFieldError("message"),
										onBlur: (event) => validateOnBlur("message", event.currentTarget.value)
									}),
									errors.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "contact-message-error",
										className: "rp-contact-error",
										role: "alert",
										children: t(errors.message)
									})
								]
							}),
							notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rp-contact-notice",
								role: "status",
								"aria-live": "polite",
								children: t("contactPage.notice")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "min-h-11 w-fit rounded-xl",
								children: t("contactPage.submit")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rp-contact-emergency",
						children: t("contactPage.emergency")
					})
				]
			})
		})]
	});
}
var SplitComponent = ContactPage;
export { SplitComponent as component };
