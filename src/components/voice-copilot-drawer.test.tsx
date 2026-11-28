import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import {
  processVoiceCommand,
  type VoiceCopilotLanguage,
} from "@/lib/voice-copilot";
import { VoiceCopilotDrawer } from "./voice-copilot-drawer";

describe("VoiceCopilotDrawer", () => {
  it("keeps typed and one-tap commands available when microphone support is missing", async () => {
    const onCommand = vi.fn((command: string, lang: VoiceCopilotLanguage) =>
      processVoiceCommand(command, lang),
    );
    const onResult = vi.fn();
    render(
      <PreferencesProvider>
        <VoiceCopilotDrawer
          onClose={vi.fn()}
          onCommand={onCommand}
          onResult={onResult}
        />
      </PreferencesProvider>,
    );

    expect(await screen.findByText(/Voice input is unavailable/)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Start voice command" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: "Type a command" }),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Safe route from Rishikesh to Joshimath",
      }),
    );
    expect(onCommand).toHaveBeenLastCalledWith(
      "Safe route from Rishikesh to Joshimath",
      "en-IN",
    );
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ intent: "route_query" }),
    );
    expect(screen.getByText(/I found/)).toBeVisible();
  });

  it("switches to Pahadi samples and submits typed text", async () => {
    const onCommand = vi.fn((command: string, lang: VoiceCopilotLanguage) =>
      processVoiceCommand(command, lang),
    );
    render(
      <PreferencesProvider>
        <VoiceCopilotDrawer
          onClose={vi.fn()}
          onCommand={onCommand}
          onResult={vi.fn()}
        />
      </PreferencesProvider>,
    );
    const drawer = screen.getByRole("complementary", {
      name: "Ask RaahPrahari",
    });
    fireEvent.click(
      within(drawer).getByRole("button", { name: "गढ़वाली / कुमाऊँनी" }),
    );
    fireEvent.click(
      within(drawer).getByRole("button", {
        name: "Rishikesh bi Joshimath safe baat",
      }),
    );
    expect(onCommand).toHaveBeenLastCalledWith(
      "Rishikesh bi Joshimath safe baat",
      "pahadi",
    );

    fireEvent.change(
      within(drawer).getByRole("textbox", { name: "Type a command" }),
      { target: { value: "Chamoli ma dhansan hwe ge" } },
    );
    fireEvent.click(within(drawer).getByRole("button", { name: "Ask" }));
    await waitFor(() =>
      expect(onCommand).toHaveBeenLastCalledWith(
        "Chamoli ma dhansan hwe ge",
        "pahadi",
      ),
    );
    expect(screen.getByText(/रिपोर्ट/)).toBeVisible();
  });
});
