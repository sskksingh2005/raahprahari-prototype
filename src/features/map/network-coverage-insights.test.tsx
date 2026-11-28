import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import { getNetworkCoverage } from "@/data/network-coverage";
import { NetworkCoverageInsights } from "./network-coverage-insights";

describe("NetworkCoverageInsights", () => {
  it("shows the selected segment safety information and captures a local device reading", () => {
    render(
      <PreferencesProvider>
        <NetworkCoverageInsights
          coverage={getNetworkCoverage("nh7-07")!}
          carrier="all"
        />
      </PreferencesProvider>,
    );

    expect(
      screen.getByText("14 km low/no signal stretch ahead"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nearest call-capable stop before the dead zone (estimate)",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Reports are queued on this device and sync when coverage returns.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No GPS, account details, or device ID/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log Signal Here" }));
    expect(screen.getByText(/Device reports online/)).toBeInTheDocument();
    expect(
      screen.getByText(/detailed network info unavailable/),
    ).toBeInTheDocument();
  });
});
