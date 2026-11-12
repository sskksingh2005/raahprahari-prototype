import { useCallback } from "react";
import {
  DEFAULT_CONTRIBUTION_SETTINGS,
  makePseudonym,
  type ContributionSettings,
  type StoredAppeal,
} from "@/lib/contribution-ledger";
import { STORAGE_KEYS, useLocalState } from "@/lib/storage";

/** Settings stay in this browser. Nothing here is sent anywhere. */
export function useContributionSettings() {
  const [settings, setSettings] = useLocalState<ContributionSettings>(
    STORAGE_KEYS.contribSettings,
    DEFAULT_CONTRIBUTION_SETTINGS,
  );

  /** Turning either option on creates the pseudonym; it is never made earlier. */
  const update = useCallback(
    (patch: Partial<Pick<ContributionSettings, "showOnLeaderboard" | "includeInAggregates">>) =>
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        const anyOn = next.showOnLeaderboard || next.includeInAggregates;
        return { ...next, pseudonym: anyOn ? (prev.pseudonym ?? makePseudonym()) : null };
      }),
    [setSettings],
  );

  const newPseudonym = useCallback(
    () => setSettings((prev) => ({ ...prev, pseudonym: makePseudonym() })),
    [setSettings],
  );

  const reset = useCallback(
    () => setSettings(DEFAULT_CONTRIBUTION_SETTINGS),
    [setSettings],
  );

  return { settings, update, newPseudonym, reset };
}

export function useAppeals() {
  const [appeals, setAppeals] = useLocalState<Record<string, StoredAppeal>>(
    STORAGE_KEYS.contribAppeals,
    {},
  );
  const save = useCallback(
    (entryId: string, note: string) =>
      setAppeals((prev) => ({ ...prev, [entryId]: { note: note.trim(), at: Date.now() } })),
    [setAppeals],
  );
  const withdraw = useCallback(
    (entryId: string) =>
      setAppeals((prev) => {
        const { [entryId]: _removed, ...rest } = prev;
        void _removed;
        return rest;
      }),
    [setAppeals],
  );
  const clear = useCallback(() => setAppeals({}), [setAppeals]);
  return { appeals, save, withdraw, clear };
}
