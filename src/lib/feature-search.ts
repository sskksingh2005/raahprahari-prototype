import type { TranslationKey } from "@/i18n/dictionary";

/**
 * Searchable list of the app's screens for the feature search palette.
 * Every path is a real route. Descriptions say plainly when a screen uses
 * sample data or a service that is not connected.
 */
export type FeaturePath =
  | "/"
  | "/map"
  | "/review"
  | "/official"
  | "/contributions"
  | "/traveller"
  | "/advisories"
  | "/report"
  | "/reports"
  | "/profile"
  | "/status"
  | "/help"
  | "/about"
  | "/contact";

export type FeatureCategory =
  | "general"
  | "navigation"
  | "reports"
  | "review"
  | "official"
  | "community"
  | "account"
  | "system"
  | "help";

export type FeatureId =
  | "home"
  | "map"
  | "review"
  | "official"
  | "contributions"
  | "traveller"
  | "advisories"
  | "report"
  | "myReports"
  | "profile"
  | "status"
  | "help"
  | "about"
  | "contact";

export interface Feature {
  id: FeatureId;
  path: FeaturePath;
  category: FeatureCategory;
  /** Shown only to a signed-in account, matching the navigation. */
  signedInOnly?: boolean;
}

/** The first five are the suggestions shown before anything is typed. */
export const FEATURES: readonly Feature[] = [
  { id: "home", path: "/", category: "general" },
  { id: "map", path: "/map", category: "navigation" },
  { id: "review", path: "/review", category: "review" },
  { id: "official", path: "/official", category: "official" },
  { id: "contributions", path: "/contributions", category: "community" },
  { id: "traveller", path: "/traveller", category: "navigation" },
  { id: "advisories", path: "/advisories", category: "navigation" },
  { id: "report", path: "/report", category: "reports" },
  {
    id: "myReports",
    path: "/reports",
    category: "reports",
    signedInOnly: true,
  },
  { id: "profile", path: "/profile", category: "account" },
  { id: "status", path: "/status", category: "system" },
  { id: "help", path: "/help", category: "help" },
  { id: "about", path: "/about", category: "help" },
  { id: "contact", path: "/contact", category: "help" },
];

export const SUGGESTED_COUNT = 5;

export const featureTitleKey = (id: FeatureId) =>
  `palette.feature.${id}.title` as TranslationKey;
export const featureDescriptionKey = (id: FeatureId) =>
  `palette.feature.${id}.description` as TranslationKey;
export const categoryKey = (category: FeatureCategory) =>
  `palette.category.${category}` as TranslationKey;

/** Lower-cases and strips accents so "Map", "map" and "máp" match alike. */
function normalise(text: string) {
  return text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * Empty query: the suggestions. Otherwise every word must appear in the
 * title, description or category, in the current language or in English
 * (so a Hindi reader can still type "map").
 */
export function searchFeatures(
  query: string,
  translate: (key: TranslationKey) => string,
  english: (key: TranslationKey) => string,
  { signedIn }: { signedIn: boolean },
): Feature[] {
  const visible = FEATURES.filter(
    (feature) => !feature.signedInOnly || signedIn,
  );
  const words = normalise(query).split(/\s+/).filter(Boolean);
  if (!words.length) return visible.slice(0, SUGGESTED_COUNT);
  return visible.filter((feature) => {
    const keys = [
      featureTitleKey(feature.id),
      featureDescriptionKey(feature.id),
      categoryKey(feature.category),
    ];
    const haystack = normalise(
      keys.flatMap((key) => [translate(key), english(key)]).join(" "),
    );
    return words.every((word) => haystack.includes(word));
  });
}
