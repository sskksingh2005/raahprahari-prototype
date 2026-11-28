import {
  CORRIDORS,
  DEMO_NOW,
  PLACES,
  REPORTS,
  RESTRICTIONS,
  SEGMENTS,
  placeById,
} from "@/data/fixtures";
import { getNetworkCoverage } from "@/data/network-coverage";
import { computeSegmentAdvisory, type SegmentAdvisory } from "@/lib/advisory";
import { planRoutes, type PlannedRoute } from "@/lib/route-planner";
import type {
  HazardType,
  Corridor,
  NetworkCoverage,
  Place,
  Segment,
  Severity,
} from "@/lib/types";

export type VoiceCopilotLanguage = "en-IN" | "hi-IN" | "pahadi";
export type VoiceSynthesisLanguage = "en-IN" | "hi-IN";
export type VoiceCopilotIntent =
  | "route_query"
  | "status_query"
  | "hazard_draft"
  | "emergency"
  | "help"
  | "unknown";

export interface VoiceHazardDraft {
  hazardType: HazardType;
  severity: Severity | "unknown";
  segmentId?: string;
  nearestPlaceId?: string;
  description: string;
}

export interface VoiceCorridorStatus {
  segmentIds: string[];
  hazardCount: number;
  restrictionCount: number;
  networkQuality?: NetworkCoverage["quality"];
  advisoryLevel: SegmentAdvisory["level"];
}

export interface VoiceCopilotResult {
  intent: VoiceCopilotIntent;
  spokenResponse: string;
  lang: VoiceCopilotLanguage;
  speechSynthesisLang: VoiceSynthesisLanguage;
  matchedPlaceIds: string[];
  routePair?: { fromId: string; toId: string };
  draftReport?: VoiceHazardDraft;
  confidence: number;
  focusSegmentIds: string[];
  routeOptions: PlannedRoute[];
  corridorStatus?: VoiceCorridorStatus;
  nearestPlaceId?: string;
}

export interface VoiceCopilotContext {
  places?: readonly Place[];
  corridors?: readonly Corridor[];
  segments?: readonly Segment[];
  advisories?: ReadonlyMap<string, SegmentAdvisory>;
  networkCoverage?: readonly NetworkCoverage[];
  selectedSegmentId?: string;
}

const PLACE_ALIASES: Record<string, readonly string[]> = {
  dehradun: ["dehradun", "देहरादून"],
  mussoorie: ["mussoorie", "masuri", "मसूरी"],
  doiwala: ["doiwala", "डोईवाला"],
  rishikesh: ["rishikesh", "rishikesh", "ऋषिकेश"],
  haridwar: ["haridwar", "हरिद्वार"],
  devprayag: ["devprayag", "dev prayag", "देवप्रयाग"],
  srinagar: ["srinagar", "srinagar garhwal", "श्रीनगर", "श्रीनगर गढ़वाल"],
  rudraprayag: ["rudraprayag", "rudra prayag", "रुद्रप्रयाग"],
  karnaprayag: ["karnaprayag", "karna prayag", "कर्णप्रयाग"],
  chamoli: ["chamoli", "चमोली"],
  joshimath: ["joshimath", "jyotirmath", "जोशीमठ", "ज्योतिर्मठ"],
  badrinath: ["badrinath", "बद्रीनाथ", "बदरीनाथ"],
  agastyamuni: ["agastyamuni", "अगस्त्यमुनि"],
  guptkashi: ["guptkashi", "गुप्तकाशी"],
  sonprayag: ["sonprayag", "सोनप्रयाग"],
  gaurikund: ["gaurikund", "गौरीकुंड"],
  chamba: ["chamba", "चंबा"],
  uttarkashi: ["uttarkashi", "उत्तरकाशी"],
  harsil: ["harsil", "harshil", "हर्षिल"],
  gangotri: ["gangotri", "गंगोत्री"],
  rudrapur: ["rudrapur", "रुद्रपुर"],
  haldwani: ["haldwani", "हल्द्वानी"],
  kathgodam: ["kathgodam", "काठगोदाम"],
  bhowali: ["bhowali", "भवाली"],
  nainital: ["nainital", "नैनीताल"],
  khairna: ["khairna", "खैरना"],
  almora: ["almora", "अल्मोड़ा", "अल्मोडा"],
  takula: ["takula", "ताकुला"],
  bageshwar: ["bageshwar", "बागेश्वर"],
  seraghat: ["seraghat", "सेराघाट"],
  gangolihat: ["gangolihat", "गंगोलीहाट"],
  pithoragarh: ["pithoragarh", "पिथौरागढ़"],
  tanakpur: ["tanakpur", "टनकपुर"],
  champawat: ["champawat", "चंपावत"],
  lohaghat: ["lohaghat", "लोहाघाट"],
  kotdwar: ["kotdwar", "कोटद्वार"],
  satpuli: ["satpuli", "सतपुली"],
  pauri: ["pauri", "पौड़ी", "पौडी"],
};

const normalize = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize("NFC")
    .replace(/[’']/g, "")
    .replace(/[?!.,;:।]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function findPlaces(text: string, places: readonly Place[]) {
  const found: { id: string; index: number; length: number }[] = [];
  for (const place of places) {
    const aliases = [
      place.name,
      place.nameHi,
      ...(PLACE_ALIASES[place.id] ?? []),
    ];
    let best: { id: string; index: number; length: number } | undefined;
    for (const alias of new Set(aliases)) {
      const normalizedAlias = normalize(alias);
      if (!normalizedAlias) continue;
      const index = text.indexOf(normalizedAlias);
      if (index >= 0 && (!best || normalizedAlias.length > best.length)) {
        best = { id: place.id, index, length: normalizedAlias.length };
      }
    }
    if (best) found.push(best);
  }
  return found
    .sort((a, b) => a.index - b.index || b.length - a.length)
    .filter(
      (match, index, matches) =>
        !matches
          .slice(0, index)
          .some(
            (previous) =>
              match.index < previous.index + previous.length &&
              match.id !== previous.id,
          ),
    )
    .map((match) => match.id);
}

function detectHazard(text: string): HazardType | undefined {
  if (
    /dhansan|pahar tut|landslide|land slip|भूस्खलन|पहाड़ टूट|पहाड टूट/.test(
      text,
    )
  )
    return "landslide";
  if (
    /baat band|rasta band|roadblock|road block|road closed|सड़क बंद|रास्ता बंद|मार्ग बंद/.test(
      text,
    )
  )
    return "road_block";
  if (/paani bhari|pani bhari|flood|waterlog|पानी भर|बाढ़|जलभराव/.test(text))
    return "flooding";
  if (/pala|barf|snow|ice|black ice|पाला|बर्फ|हिमपात/.test(text))
    return "snow_ice";
  if (/rockfall|पत्थर गिर|चट्टान गिर/.test(text)) return "rockfall";
  if (/fallen tree|tree fallen|पेड़ गिर|पेड़ गिर/.test(text))
    return "fallen_tree";
  if (/accident|दुर्घटना|हादसा/.test(text)) return "accident";
  if (/fog|visibility|धुंध|कोहरा|कम दृश्यता/.test(text))
    return "poor_visibility";
  return undefined;
}

function detectSeverity(text: string): Severity | "unknown" {
  if (/severe|major|serious|heavy|urgent|बहुत गंभीर|गंभीर|भारी/.test(text))
    return "high";
  if (/minor|slight|small|low|हल्का|कम गंभीर/.test(text)) return "low";
  if (/moderate|medium|मध्यम/.test(text)) return "moderate";
  return "unknown";
}

function baseResult(
  intent: VoiceCopilotIntent,
  lang: VoiceCopilotLanguage,
  matchedPlaceIds: string[],
  spokenResponse: string,
  confidence: number,
  extras: Partial<VoiceCopilotResult> = {},
): VoiceCopilotResult {
  return {
    intent,
    spokenResponse,
    lang,
    speechSynthesisLang: lang === "en-IN" ? "en-IN" : "hi-IN",
    matchedPlaceIds,
    confidence,
    focusSegmentIds: [],
    routeOptions: [],
    ...extras,
  };
}

function languageResponse(
  lang: VoiceCopilotLanguage,
  enText: string,
  hiText: string,
  pahadiText: string,
) {
  return lang === "en-IN" ? enText : lang === "hi-IN" ? hiText : pahadiText;
}

function derivedAdvisories(
  segments: readonly Segment[],
): ReadonlyMap<string, SegmentAdvisory> {
  return new Map(
    segments.map((segment) => [
      segment.id,
      computeSegmentAdvisory(segment.id, REPORTS, RESTRICTIONS, DEMO_NOW),
    ]),
  );
}

function routeIntent(text: string) {
  return /route|directions?|safest|safe route|plan.*trip|how.*get|रास्ता|मार्ग|कैसे जाए|कैसे जाएं|सुरक्षित मार्ग|baat kash|rasta kash|kakh jaan|safe baat/.test(
    text,
  );
}

function emergencyIntent(text: string) {
  return /emergency|sos|help me|rescue|hospital|police station|police thana|madad chah|bachao|मदद|बचाओ|अस्पताल|पुलिस थाना|आपातकाल/.test(
    text,
  );
}

export function processVoiceCommand(
  command: string,
  lang: VoiceCopilotLanguage = "en-IN",
  context: VoiceCopilotContext = {},
): VoiceCopilotResult {
  const normalized = normalize(command);
  const places = context.places ?? PLACES;
  const corridors = context.corridors ?? CORRIDORS;
  const segments = context.segments ?? SEGMENTS;
  const advisories = context.advisories ?? derivedAdvisories(segments);
  const networkCoverage = context.networkCoverage;
  const matchedPlaceIds = findPlaces(normalized, places);
  const matchedCorridor = corridors.find((corridor) =>
    [corridor.id, corridor.code, corridor.name].some((alias) => {
      const normalizedAlias = normalize(alias);
      return (
        normalized.includes(normalizedAlias) ||
        normalized
          .replace(/\s+/g, "")
          .includes(normalizedAlias.replace(/\s+/g, ""))
      );
    }),
  );
  const hazard = detectHazard(normalized);

  if (emergencyIntent(normalized)) {
    const requestedPlaceId = matchedPlaceIds[0];
    const nearestPlaceId = requestedPlaceId;
    const focusSegmentIds = nearestPlaceId
      ? segments
          .filter(
            (segment) =>
              segment.from === nearestPlaceId || segment.to === nearestPlaceId,
          )
          .slice(0, 1)
          .map((segment) => segment.id)
      : [];
    const nearestName = nearestPlaceId
      ? placeById(nearestPlaceId)?.name
      : undefined;
    const spokenResponse = languageResponse(
      lang,
      nearestName
        ? `For an emergency, call 112. ${nearestName} is a mapped town reference, not a verified SOS or hospital facility.`
        : "For an emergency, call 112 now. I do not have your location or verified SOS facility data.",
      nearestName
        ? "आपातकाल में 112 पर कॉल करें। मानचित्र पर निकटतम संदर्भ स्थान " +
            `${nearestName} है; यहाँ SOS या अस्पताल सुविधा सत्यापित नहीं है।`
        : "आपातकाल में अभी 112 पर कॉल करें। मेरे पास आपकी स्थिति या सत्यापित SOS सुविधा की जानकारी नहीं है।",
      nearestName
        ? `आपात में 112 मा फोन करा। ${nearestName} नक्शा में नज़दीक कस्बा छ, पर SOS या अस्पताल की पुष्टि नीं छ।`
        : "आपात में 112 मा फोन करा। तुमारी जगह और पक्की SOS सुविधा म्ये मालूम नी छ।",
    );
    return baseResult(
      "emergency",
      lang,
      matchedPlaceIds,
      spokenResponse,
      nearestPlaceId ? 0.9 : 0.75,
      { nearestPlaceId, focusSegmentIds },
    );
  }

  if (hazard) {
    const nearestPlaceId = matchedPlaceIds[0];
    const segmentIds = nearestPlaceId
      ? segments
          .filter(
            (segment) =>
              segment.from === nearestPlaceId || segment.to === nearestPlaceId,
          )
          .map((segment) => segment.id)
      : [];
    const segmentId = segmentIds[0];
    const place = nearestPlaceId ? placeById(nearestPlaceId) : undefined;
    const hazardLabel = languageResponse(
      lang,
      hazard.replaceAll("_", " "),
      hazard === "landslide"
        ? "भूस्खलन"
        : hazard === "road_block"
          ? "सड़क बंद"
          : hazard === "flooding"
            ? "जलभराव"
            : hazard === "snow_ice"
              ? "बर्फ़ या पाला"
              : hazard.replaceAll("_", " "),
      hazard === "landslide"
        ? "धंसान"
        : hazard === "road_block"
          ? "रास्ता बंद"
          : hazard === "flooding"
            ? "पानी भरना"
            : hazard === "snow_ice"
              ? "पाला या बर्फ"
              : hazard.replaceAll("_", " "),
    );
    const severity = detectSeverity(normalized);
    const spokenResponse = languageResponse(
      lang,
      `I prepared a ${hazardLabel} report draft${place ? ` near ${place.name}` : ""}. Please review the location and details before saving.`,
      `${hazardLabel} की रिपोर्ट का मसौदा तैयार है${place ? `, ${place.name} के पास` : ""}। सहेजने से पहले स्थान और विवरण जाँचें।`,
      `${hazardLabel} की रिपोर्ट को मसौदो तैयार छ${place ? `, ${place.name} कने` : ""}। जमा करणै पैली जगह अर बात जाँचि ल्या।`,
    );
    return baseResult(
      "hazard_draft",
      lang,
      matchedPlaceIds,
      spokenResponse,
      nearestPlaceId ? 0.88 : 0.72,
      {
        draftReport: {
          hazardType: hazard,
          severity,
          segmentId,
          nearestPlaceId,
          description: command.trim(),
        },
        focusSegmentIds: segmentId ? [segmentId] : [],
      },
    );
  }

  if (routeIntent(normalized) && matchedPlaceIds.length >= 2) {
    const routePair = {
      fromId: matchedPlaceIds[0],
      toId: matchedPlaceIds[1],
    };
    const routeOptions = planRoutes({
      originId: routePair.fromId,
      destinationId: routePair.toId,
      advisories,
      places,
      segments,
      networkCoverage,
    });
    const firstRoute = routeOptions[0];
    const from = placeById(routePair.fromId)?.name ?? routePair.fromId;
    const to = placeById(routePair.toId)?.name ?? routePair.toId;
    const closed = firstRoute?.hasRoadClosure;
    const spokenResponse = routeOptions.length
      ? languageResponse(
          lang,
          `I found ${routeOptions.length} seeded route option${routeOptions.length === 1 ? "" : "s"} from ${from} to ${to}${closed ? ". The leading option includes an official road closure; do not travel through it." : ". Route data is illustrative and not live directions."}`,
          `${from} से ${to} के लिए ${routeOptions.length} पूर्व-निर्धारित मार्ग मिले${closed ? "। प्रमुख विकल्प में आधिकारिक सड़क बंदी है; वहाँ से यात्रा न करें।" : "। मार्ग उदाहरण हैं, लाइव दिशा-निर्देश नहीं।"}`,
          `${from} तैं ${to} तक ${routeOptions.length} बाट मिलि गे${closed ? "। अगली बाट में सरकारी बंदी छ; उधर मत जाया।" : "। यो बाट उदाहरण छ, लाइव दिशा नी छ।"}`,
        )
      : languageResponse(
          lang,
          `I could not find a seeded route from ${from} to ${to}.`,
          `${from} से ${to} तक पूर्व-निर्धारित मार्ग नहीं मिला।`,
          `${from} तैं ${to} तक बाट नी मिली।`,
        );
    return baseResult(
      "route_query",
      lang,
      matchedPlaceIds,
      spokenResponse,
      routeOptions.length ? 0.96 : 0.86,
      {
        routePair,
        routeOptions,
        focusSegmentIds: firstRoute?.steps.map((step) => step.segment.id) ?? [],
      },
    );
  }

  if (matchedCorridor) {
    const segmentIds = segments
      .filter((segment) => segment.corridorId === matchedCorridor.id)
      .map((segment) => segment.id);
    const segmentAdvisories = segmentIds
      .map((id) => advisories.get(id))
      .filter((advisory): advisory is SegmentAdvisory => !!advisory);
    const hazardCount = segmentAdvisories.reduce(
      (count, advisory) =>
        count +
        advisory.evidence.filter((report) => report.kind === "hazard").length,
      0,
    );
    const restrictionCount = segmentAdvisories.filter(
      (advisory) => advisory.restriction,
    ).length;
    const advisoryLevel = segmentAdvisories.reduce<SegmentAdvisory["level"]>(
      (current, advisory) =>
        advisory.level === "do_not_travel" ||
        (advisory.level === "avoid" && current !== "do_not_travel") ||
        (advisory.level === "caution" &&
          current !== "do_not_travel" &&
          current !== "avoid")
          ? advisory.level
          : current,
      "unknown",
    );
    const qualityRank = ["strong", "moderate", "weak", "dead_zone"];
    const coverages = segmentIds
      .map(
        (id) =>
          context.networkCoverage?.find(
            (coverage) => coverage.segmentId === id,
          ) ?? getNetworkCoverage(id),
      )
      .filter((coverage): coverage is NetworkCoverage => !!coverage);
    const networkQuality = coverages.sort(
      (a, b) => qualityRank.indexOf(b.quality) - qualityRank.indexOf(a.quality),
    )[0]?.quality;
    const spokenResponse = languageResponse(
      lang,
      `${matchedCorridor.code}, ${matchedCorridor.name}: ${hazardCount} recent hazard reports and ${restrictionCount} official restrictions across ${segmentIds.length} seeded segments. The weakest network estimate is ${networkQuality ?? "unknown"}. Sample information only; check official instructions.`,
      `${matchedCorridor.code}, ${matchedCorridor.name}: ${segmentIds.length} मार्ग खंडों पर ${hazardCount} हालिया खतरा रिपोर्ट और ${restrictionCount} आधिकारिक प्रतिबंध। सबसे कमजोर नेटवर्क अनुमान ${networkQuality ?? "अज्ञात"} है। यह नमूना जानकारी है; आधिकारिक निर्देश देखें।`,
      `${matchedCorridor.code}, ${matchedCorridor.name}: ${segmentIds.length} बाट खंडों मा ${hazardCount} ताज़ी खतरा रिपोर्ट अर ${restrictionCount} सरकारी रोक। कमजोर नेटवर्क अनुमान ${networkQuality ?? "मालूम नी"} छ। यो नमूना जानकारी छ; सरकारी बात देखो।`,
    );
    return baseResult(
      "status_query",
      lang,
      matchedPlaceIds,
      spokenResponse,
      segmentIds.length ? 0.9 : 0.55,
      {
        focusSegmentIds: segmentIds.slice(0, 1),
        corridorStatus: {
          segmentIds,
          hazardCount,
          restrictionCount,
          networkQuality,
          advisoryLevel,
        },
      },
    );
  }

  if (matchedPlaceIds.length > 0) {
    const selectedPlaceId = matchedPlaceIds[0];
    const relatedSegments = segments.filter(
      (segment) =>
        segment.from === selectedPlaceId || segment.to === selectedPlaceId,
    );
    const candidateSegments = relatedSegments.length
      ? relatedSegments
      : segments.filter((segment) =>
          CORRIDORS.some(
            (corridor) =>
              corridor.stops.includes(selectedPlaceId) &&
              corridor.id === segment.corridorId,
          ),
        );
    const segmentIds = candidateSegments.map((segment) => segment.id);
    const segmentAdvisories = segmentIds
      .map((id) => advisories.get(id))
      .filter((advisory): advisory is SegmentAdvisory => !!advisory);
    const hazardCount = segmentAdvisories.reduce(
      (count, advisory) =>
        count +
        advisory.evidence.filter((report) => report.kind === "hazard").length,
      0,
    );
    const restrictions = segmentAdvisories.filter(
      (advisory) => advisory.restriction,
    ).length;
    const advisoryLevel = segmentAdvisories.reduce<SegmentAdvisory["level"]>(
      (current, advisory) =>
        advisory.level === "do_not_travel" ||
        (advisory.level === "avoid" && current !== "do_not_travel") ||
        (advisory.level === "caution" &&
          current !== "do_not_travel" &&
          current !== "avoid")
          ? advisory.level
          : current,
      "unknown",
    );
    const coverageMap = networkCoverage
      ? new Map(
          networkCoverage.map((coverage) => [coverage.segmentId, coverage]),
        )
      : undefined;
    const qualities = segmentIds
      .map((id) => coverageMap?.get(id) ?? getNetworkCoverage(id))
      .filter((coverage): coverage is NetworkCoverage => !!coverage);
    const qualityRank = ["strong", "moderate", "weak", "dead_zone"];
    const networkQuality = qualities.sort(
      (a, b) => qualityRank.indexOf(b.quality) - qualityRank.indexOf(a.quality),
    )[0]?.quality;
    const matchedPlace = placeById(selectedPlaceId);
    const statusText = languageResponse(
      lang,
      `${matchedPlace?.name ?? selectedPlaceId}: ${hazardCount} recent hazard report${hazardCount === 1 ? "" : "s"} and ${restrictions} official restriction${restrictions === 1 ? "" : "s"} across connected segments. Advisory: ${advisoryLevel.replaceAll("_", " ")}. Network estimate: ${networkQuality ?? "unknown"}. This is sample data, not a safety clearance.`,
      `${matchedPlace?.nameHi ?? selectedPlaceId}: जुड़े मार्गों पर ${hazardCount} हालिया खतरा रिपोर्ट और ${restrictions} आधिकारिक प्रतिबंध। स्थिति: ${advisoryLevel}। नेटवर्क अनुमान: ${networkQuality ?? "अज्ञात"}। यह नमूना डेटा है, सुरक्षा प्रमाण नहीं।`,
      `${matchedPlace?.name ?? selectedPlaceId}: आसपास की बाटों मा ${hazardCount} ताज़ी खतरा रिपोर्ट अर ${restrictions} सरकारी रोक। हाल: ${advisoryLevel}। नेटवर्क अनुमान: ${networkQuality ?? "मालूम नी"}। यो नमूना छ, सुरक्षा की गारंटी नी।`,
    );
    return baseResult(
      "status_query",
      lang,
      matchedPlaceIds,
      statusText,
      segmentIds.length ? 0.84 : 0.55,
      {
        focusSegmentIds: segmentIds.slice(0, 1),
        corridorStatus: {
          segmentIds,
          hazardCount,
          restrictionCount: restrictions,
          networkQuality,
          advisoryLevel,
        },
      },
    );
  }

  if (
    /network|signal|dead zone|network ni chha|signal ni aano|सिग्नल|नेटवर्क|डेड ज़ोन|डेड जोन/.test(
      normalized,
    )
  ) {
    return baseResult(
      "status_query",
      lang,
      [],
      languageResponse(
        lang,
        "Name a town or road section so I can check the seeded network estimate.",
        "नेटवर्क अनुमान देखने के लिए किसी कस्बे या सड़क खंड का नाम बताएँ।",
        "नेटवर्क अनुमान देखणै खातर कस्बा या सड़क को नाम बतावा।",
      ),
      0.55,
    );
  }

  if (
    /help|what can you do|madad|मदद|कैसे मदद|commands|सहायता/.test(normalized)
  ) {
    return baseResult(
      "help",
      lang,
      [],
      languageResponse(
        lang,
        "Ask about a route or road status, describe a hazard to prepare a report draft, or ask for emergency help. In an emergency, call 112.",
        "मार्ग या सड़क की स्थिति पूछें, खतरा बताएँ ताकि रिपोर्ट का मसौदा बने, या आपातकालीन सहायता माँगें। आपातकाल में 112 पर कॉल करें।",
        "बाट या सड़क को हाल पूछो, खतरो बताई रिपोर्ट को मसौदो बनावा, या आपात मदद माँगो। आपात में 112 मा फोन करा।",
      ),
      0.9,
    );
  }

  return baseResult(
    "unknown",
    lang,
    [],
    languageResponse(
      lang,
      "I did not understand that command. Try naming two places for a route, one place for status, or describe a road hazard.",
      "आदेश समझ नहीं आया। मार्ग के लिए दो स्थान, स्थिति के लिए एक स्थान, या सड़क का खतरा बताएँ।",
      "बात समझ नी आई। बाट खातर दुई जगह, हाल खातर एक जगह, या सड़क को खतरो बतावा।",
    ),
    0.2,
  );
}

export function voiceSampleCommands(lang: VoiceCopilotLanguage): string[] {
  const samples: Record<VoiceCopilotLanguage, string[]> = {
    "en-IN": [
      "Safe route from Rishikesh to Joshimath",
      "Check road status at Chamoli",
      "Landslide near Chamoli, severe",
      "Emergency help near Rishikesh",
    ],
    "hi-IN": [
      "ऋषिकेश से जोशीमठ सुरक्षित रास्ता बताओ",
      "चमोली सड़क की स्थिति बताओ",
      "चमोली में भूस्खलन हुआ, गंभीर",
      "ऋषिकेश के पास आपात मदद",
    ],
    pahadi: [
      "Joshimath ku baat kash chha?",
      "Rishikesh bi Joshimath safe baat",
      "Chamoli ma dhansan hwe ge",
      "Dead zone kakh chha?",
    ],
  };
  return samples[lang];
}
