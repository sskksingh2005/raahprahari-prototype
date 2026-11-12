import { useState, type FormEvent } from "react";
import { PageBanner } from "@/components/page-banner";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/i18n/preferences";

type ContactField = "name" | "email" | "message";
type ErrorKey =
  | "contactPage.nameError"
  | "contactPage.emailError"
  | "contactPage.messageError";
type ContactErrors = Partial<Record<ContactField, ErrorKey>>;

export function ContactPage() {
  const { t } = usePrefs();
  const [errors, setErrors] = useState<ContactErrors>({});
  const [notice, setNotice] = useState(false);

  function validateField(
    field: ContactField,
    value: string,
  ): ErrorKey | undefined {
    const trimmedValue = value.trim();
    if (field === "name" && !trimmedValue) return "contactPage.nameError";
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      return "contactPage.emailError";
    }
    if (field === "message" && !trimmedValue) return "contactPage.messageError";
    return undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const nextErrors: ContactErrors = {};

    const nameError = validateField("name", name);
    const emailError = validateField("email", email);
    const messageError = validateField("message", message);
    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (messageError) nextErrors.message = messageError;

    setErrors(nextErrors);
    setNotice(Object.keys(nextErrors).length === 0);
    // Take keyboard and screen reader users straight to the first problem.
    const firstInvalid = (["name", "email", "message"] as const).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid)
      document.getElementById(`contact-${firstInvalid}`)?.focus();
  }

  function validateOnBlur(field: ContactField, value: string) {
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

  function clearFieldError(field: ContactField) {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setNotice(false);
  }

  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t("contactPage.eyebrow")}
        title={t("contact.title")}
        description={t("contactPage.description")}
      />
      <div className="rp-info-container rp-info-content">
        <section
          className="rp-info-card mx-auto max-w-2xl"
          aria-labelledby="contact-form-title"
        >
          <h2 id="contact-form-title">{t("contactPage.formTitle")}</h2>
          <p className="mb-5">{t("contactPage.formIntro")}</p>
          <form className="rp-contact-form" onSubmit={handleSubmit} noValidate>
            <div className="rp-contact-field">
              <label htmlFor="contact-name">{t("contactPage.name")}</label>
              <p id="contact-name-help" className="rp-contact-help">
                {t("contactPage.nameHelp")}
              </p>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={100}
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={`contact-name-help${errors.name ? " contact-name-error" : ""}`}
                className="rp-contact-control"
                onChange={() => clearFieldError("name")}
                onBlur={(event) =>
                  validateOnBlur("name", event.currentTarget.value)
                }
              />
              {errors.name && (
                <p
                  id="contact-name-error"
                  className="rp-contact-error"
                  role="alert"
                >
                  {t(errors.name)}
                </p>
              )}
            </div>

            <div className="rp-contact-field">
              <label htmlFor="contact-email">{t("contactPage.email")}</label>
              <p id="contact-email-help" className="rp-contact-help">
                {t("contactPage.emailHelp")}
              </p>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={`contact-email-help${errors.email ? " contact-email-error" : ""}`}
                className="rp-contact-control"
                onChange={() => clearFieldError("email")}
                onBlur={(event) =>
                  validateOnBlur("email", event.currentTarget.value)
                }
              />
              {errors.email && (
                <p
                  id="contact-email-error"
                  className="rp-contact-error"
                  role="alert"
                >
                  {t(errors.email)}
                </p>
              )}
            </div>

            <div className="rp-contact-field">
              <label htmlFor="contact-message">
                {t("contactPage.message")}
              </label>
              <p id="contact-message-help" className="rp-contact-help">
                {t("contactPage.messageHelp")}
              </p>
              <textarea
                id="contact-message"
                name="message"
                maxLength={2000}
                required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={`contact-message-help${errors.message ? " contact-message-error" : ""}`}
                className="rp-contact-control rp-contact-message"
                onChange={() => clearFieldError("message")}
                onBlur={(event) =>
                  validateOnBlur("message", event.currentTarget.value)
                }
              />
              {errors.message && (
                <p
                  id="contact-message-error"
                  className="rp-contact-error"
                  role="alert"
                >
                  {t(errors.message)}
                </p>
              )}
            </div>

            {notice && (
              <p className="rp-contact-notice" role="status" aria-live="polite">
                {t("contactPage.notice")}
              </p>
            )}
            <Button type="submit" className="min-h-11 w-fit rounded-xl">
              {t("contactPage.submit")}
            </Button>
          </form>
          <p className="rp-contact-emergency">{t("contactPage.emergency")}</p>
        </section>
      </div>
    </div>
  );
}
