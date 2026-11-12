import type { TranslationKey } from "@/i18n/dictionary";

/**
 * Register of unresolved Privacy, Terms and Accessibility policy questions.
 *
 * Add an entry only when a question has actually been recorded by the project
 * owners, with the wording supplied in both dictionaries. Do not add questions
 * or answers on their behalf. The About page lists whatever is here and says
 * so plainly when the list is empty.
 */
export interface PolicyOpenQuestion {
  id: string;
  area: "privacy" | "terms" | "accessibility";
  question: TranslationKey;
}

export const POLICY_OPEN_QUESTIONS: readonly PolicyOpenQuestion[] = [];
