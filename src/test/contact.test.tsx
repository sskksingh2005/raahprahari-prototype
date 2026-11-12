import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import { ContactPage } from "@/features/contact/contact-page";

function renderContact() {
  return render(
    <PreferencesProvider>
      <ContactPage />
    </PreferencesProvider>,
  );
}

describe("contact form validation", () => {
  it("does not show field errors before submit or blur", () => {
    renderContact();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("shows one email error on blur and connects it accessibly", async () => {
    const user = userEvent.setup();
    renderContact();
    const email = screen.getByLabelText("Email");

    await user.click(email);
    await user.tab();

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email.getAttribute("aria-describedby")?.split(" ")).toContain(
      "contact-email-error",
    );
  });

  it("shows validation errors after submit", async () => {
    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole("button", { name: "Submit message" }));

    expect(screen.getByText("Enter your name.")).toBeVisible();
    expect(screen.getAllByText("Enter a valid email address.")).toHaveLength(1);
    expect(screen.getByText("Enter a message.")).toBeVisible();
  });

  it("shows the honest not-sent notice only for valid input", async () => {
    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole("button", { name: "Submit message" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Asha");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Submit message" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Not connected in this prototype. Your message was not sent.",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
