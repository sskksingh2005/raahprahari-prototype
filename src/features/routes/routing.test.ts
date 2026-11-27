import { describe, expect, it } from "vitest";
import { findSeededRoutes, routeLabel } from "./routing";

describe("route labels", () => {
  it("labels direct routes without an unavailable intermediate place", () => {
    const route = findSeededRoutes("dehradun", "mussoorie")[0];
    expect(route).toBeDefined();
    expect(routeLabel(route!, "en")).toBe("Direct");
    expect(routeLabel(route!, "hi")).toBe("सीधा मार्ग");
  });

  it("keeps intermediate place names on routes that pass through them", () => {
    const route = findSeededRoutes("rishikesh", "badrinath")[0];
    expect(route).toBeDefined();
    expect(routeLabel(route!, "en")).not.toBe("Direct");
    expect(routeLabel(route!, "hi")).not.toBe("सीधा मार्ग");
  });
});
