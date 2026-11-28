import { describe, expect, it } from "vitest";
import {
  DEMO_NOW,
  PLACES,
  REPORTS,
  RESTRICTIONS,
  SEGMENTS,
} from "@/data/fixtures";
import { computeSegmentAdvisory } from "@/lib/advisory";
import {
  processVoiceCommand,
  voiceSampleCommands,
  type VoiceCopilotLanguage,
} from "./voice-copilot";

const advisories = new Map(
  SEGMENTS.map((segment) => [
    segment.id,
    computeSegmentAdvisory(segment.id, REPORTS, RESTRICTIONS, DEMO_NOW),
  ]),
);

function command(text: string, lang: VoiceCopilotLanguage = "en-IN") {
  return processVoiceCommand(text, lang, {
    places: PLACES,
    segments: SEGMENTS,
    advisories,
  });
}

describe("processVoiceCommand", () => {
  it("plans English, Hindi, and Garhwali/Kumaoni route queries from seeded roads", () => {
    const english = command("Safe route from Rishikesh to Joshimath", "en-IN");
    const hindi = command("ऋषिकेश से जोशीमठ सुरक्षित रास्ता बताओ", "hi-IN");
    const pahadi = command(
      "Rishikesh bi Joshimath ku safe baat batao",
      "pahadi",
    );

    for (const result of [english, hindi, pahadi]) {
      expect(result.intent).toBe("route_query");
      expect(result.routePair).toEqual({
        fromId: "rishikesh",
        toId: "joshimath",
      });
      expect(result.routeOptions.length).toBeGreaterThan(0);
    }
    expect(english.speechSynthesisLang).toBe("en-IN");
    expect(hindi.speechSynthesisLang).toBe("hi-IN");
    expect(pahadi.speechSynthesisLang).toBe("hi-IN");
    expect(pahadi.spokenResponse).toContain(" बाट");
  });

  it("recognizes the requested Pahadi route and help phrases", () => {
    expect(command("baat kash chha", "pahadi").intent).toBe("unknown");
    const namedRoute = command("Almora bi Nainital rasta kash chha", "pahadi");
    expect(namedRoute.routePair).toEqual({
      fromId: "almora",
      toId: "nainital",
    });
    expect(command("madad chahindi", "pahadi").intent).toBe("emergency");
    expect(command("hospital kakh chha", "pahadi").intent).toBe("emergency");
  });

  it("returns corridor hazard, restriction, and weakest network status", () => {
    const result = command("Check road status and signal at Joshimath");
    expect(result.intent).toBe("status_query");
    expect(result.matchedPlaceIds).toContain("joshimath");
    expect(result.corridorStatus).toMatchObject({
      segmentIds: expect.arrayContaining(["nh7-06", "nh7-07"]),
      restrictionCount: expect.any(Number),
      hazardCount: expect.any(Number),
      networkQuality: "dead_zone",
    });
    expect(result.corridorStatus?.restrictionCount).toBeGreaterThan(0);
    expect(result.focusSegmentIds).toHaveLength(1);
    expect(result.spokenResponse).toContain("not a safety clearance");
  });

  it.each([
    ["Chamoli ma dhansan hwe ge", "landslide"],
    ["pahar tuti ge", "landslide"],
    ["baat band chha", "road_block"],
    ["paani bhari ge", "flooding"],
    ["pala chha", "snow_ice"],
  ] as const)("extracts Pahadi hazard phrase %s", (text, hazardType) => {
    const result = command(text, "pahadi");
    expect(result.intent).toBe("hazard_draft");
    expect(result.draftReport?.hazardType).toBe(hazardType);
    expect(result.draftReport?.severity).toBe("unknown");
  });

  it("extracts severity and nearest adjacent segment without confirming location", () => {
    const result = command("Severe landslide near Chamoli");
    expect(result.draftReport).toMatchObject({
      hazardType: "landslide",
      severity: "high",
      nearestPlaceId: "chamoli",
      segmentId: expect.any(String),
    });
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("gives 112 guidance but does not invent an SOS facility or location", () => {
    const withoutLocation = command("bachao", "pahadi");
    expect(withoutLocation.intent).toBe("emergency");
    expect(withoutLocation.spokenResponse).toContain("112");
    expect(withoutLocation.nearestPlaceId).toBeUndefined();
    expect(withoutLocation.focusSegmentIds).toEqual([]);

    const named = command("hospital kakh chha in Rishikesh", "pahadi");
    expect(named.nearestPlaceId).toBe("rishikesh");
    expect(named.spokenResponse).toContain("SOS");
    expect(named.spokenResponse).toContain("पुष्टि");
  });

  it("asks for a location on a network query and supplies language-specific samples", () => {
    const result = command("Dead zone kakh chha?", "pahadi");
    expect(result.intent).toBe("status_query");
    expect(result.confidence).toBeLessThan(0.6);
    for (const lang of ["en-IN", "hi-IN", "pahadi"] as const) {
      expect(voiceSampleCommands(lang)).toHaveLength(4);
    }
    expect(voiceSampleCommands("pahadi")).toContain(
      "Rishikesh bi Joshimath safe baat",
    );
  });
});
