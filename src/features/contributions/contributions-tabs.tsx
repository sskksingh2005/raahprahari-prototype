import { Coins, EyeOff, History, ShieldCheck, Trophy } from "lucide-react";
import { SYNTHETIC_CONTRIBUTORS } from "@/data/contributors";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import { useAppStore } from "@/lib/app-store";
import {
  POINTS_PER_OUTCOME,
  REPUTATION_MIN_DECIDED,
  REPUTATION_RELIABLE_SHARE,
  REPUTATION_TRUSTED_SHARE,
  SETTLED_OUTCOMES,
  UNSETTLED_OUTCOMES,
  computePoints,
  computeReputation,
  emptyCounts,
  rankByPoints,
  type OutcomeCounts,
  type ReputationLevel,
} from "@/lib/contribution";
import {
  AGGREGATE_MIN_PARTICIPANTS,
  aggregateCounts,
} from "@/lib/contribution-ledger";
import type { ReportStatus } from "@/lib/types";
import { Card, LevelBadge, fill, percent } from "./contribution-ui";
import { LedgerTab } from "./ledger-tab";
import { SettingsTab } from "./settings-tab";
import { useContributionSettings } from "./use-contribution-prefs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LEVELS: ReputationLevel[] = ["new", "building", "reliable", "trusted"];

const OUTCOME_ORDER: ReportStatus[] = [
  ...SETTLED_OUTCOMES,
  ...UNSETTLED_OUTCOMES,
];
function PointsTab() {
  const { t } = usePrefs();
  const { localReports } = useAppStore();
  // Local reports have no reviewer decision, so nothing is counted for them.
  const yourPoints = computePoints(emptyCounts());
  return (
    <div className="grid gap-3 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="grid content-start gap-3">
        <Card icon={Coins} title={t("contrib.points.yours")}>
          <p
            data-testid="your-points"
            className="m-0! mt-2! font-display text-4xl font-semibold text-foreground!"
          >
            {yourPoints}
          </p>
          <p>
            {fill(t("contrib.points.yoursNote"), {
              count: localReports.length,
            })}
          </p>
        </Card>
        <Card title={t("contrib.points.howTitle")}>
          <p>{t("contrib.points.howBody")}</p>
          <p>{t("contrib.points.noDeduction")}</p>
        </Card>
      </div>
      <Card title={t("contrib.points.tableCaption")}>
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>{t("contrib.col.outcome")}</TableHead>
              <TableHead className="text-right">
                {t("contrib.col.points")}
              </TableHead>
              <TableHead>
                {t("contrib.col.meaning")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {OUTCOME_ORDER.map((outcome) => (
              <TableRow key={outcome} data-testid={`outcome-${outcome}`}>
                <TableCell className="font-medium whitespace-normal">
                  {t(`contrib.outcome.${outcome}` as TranslationKey)}
                </TableCell>
                <TableCell className="text-right whitespace-normal">
                  {POINTS_PER_OUTCOME[outcome] > 0
                    ? fill(t("contrib.points.perReport"), {
                        points: POINTS_PER_OUTCOME[outcome],
                      })
                    : t("contrib.points.none")}
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {t(`contrib.meaning.${outcome}` as TranslationKey)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function ReputationTab() {
  const { t } = usePrefs();
  const mine = computeReputation(emptyCounts());
  const values = {
    min: REPUTATION_MIN_DECIDED,
    percent: percent(REPUTATION_RELIABLE_SHARE),
    upper: percent(REPUTATION_TRUSTED_SHARE),
  };
  const ruleValues: Record<ReputationLevel, Record<string, string | number>> = {
    new: values,
    building: { ...values, percent: percent(REPUTATION_RELIABLE_SHARE) },
    reliable: values,
    trusted: { ...values, percent: percent(REPUTATION_TRUSTED_SHARE) },
  };
  return (
    <div className="grid gap-3 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="grid content-start gap-3">
        <Card icon={ShieldCheck} title={t("contrib.rep.yours")}>
          <div className="mt-3">
            <LevelBadge level={mine.level} />
          </div>
          <p>
            {fill(t("contrib.rep.yoursNote"), {
              count: mine.decided,
              min: REPUTATION_MIN_DECIDED,
            })}
          </p>
        </Card>
        <Card title={t("contrib.rep.howTitle")}>
          <p>{t("contrib.rep.howBody")}</p>
          <p>
            <strong>{t("contrib.rep.formula")}</strong>
          </p>
          <p>{fill(t("contrib.rep.minimum"), values)}</p>
          <p>{t("contrib.rep.limit")}</p>
        </Card>
      </div>
      <Card title={t("contrib.rep.tableCaption")}>
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>{t("contrib.col.level")}</TableHead>
              <TableHead>
                {t("contrib.col.rule")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LEVELS.map((level) => (
              <TableRow key={level} data-testid={`level-${level}`}>
                <TableCell>
                  <LevelBadge level={level} />
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {fill(
                    t(`contrib.levelRule.${level}` as TranslationKey),
                    ruleValues[level],
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

interface BoardEntry {
  id: string;
  handle: string;
  counts: OutcomeCounts;
  you: boolean;
}

function LeaderboardTab() {
  const { t } = usePrefs();
  const { settings } = useContributionSettings();
  const pool: BoardEntry[] = SYNTHETIC_CONTRIBUTORS.filter(
    (c) => c.optedIn,
  ).map((c) => ({ id: c.id, handle: c.handle, counts: c.counts, you: false }));
  // The person's own row exists only while they have opted in on this device.
  const youOnBoard = settings.showOnLeaderboard && settings.pseudonym !== null;
  if (youOnBoard)
    pool.push({
      id: "you",
      handle: settings.pseudonym ?? "",
      counts: emptyCounts(),
      you: true,
    });
  const ranked = rankByPoints(pool);
  const aggregate = aggregateCounts([
    ...SYNTHETIC_CONTRIBUTORS.filter((c) => c.optedIn).map((c) => c.counts),
    ...(settings.includeInAggregates ? [emptyCounts()] : []),
  ]);
  return (
    <div className="grid gap-3">
      <Card icon={Trophy} title={t("contrib.board.title")}>
        <p>{t("contrib.board.body")}</p>
        <p>{t("contrib.board.optedInOnly")}</p>
        <Table className="mt-3 [&_td]:px-1 [&_th]:px-1 sm:[&_td]:px-2 sm:[&_th]:px-2">
          <TableCaption className="sr-only">
            {t("contrib.board.caption")}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t("contrib.col.rank")}</TableHead>
              <TableHead>{t("contrib.col.contributor")}</TableHead>
              <TableHead className="text-right">
                {t("contrib.col.points")}
              </TableHead>
              <TableHead>{t("contrib.col.level")}</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                {t("contrib.col.verified")}
              </TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                {t("contrib.col.decided")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranked.map(({ entry, rank, points, reputation }) => (
              <TableRow key={entry.id} data-testid={`rank-${entry.id}`}>
                <TableCell className="font-display font-semibold">
                  {rank}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{entry.handle}</span>{" "}
                  <span className="block font-mono text-[11px] text-muted-foreground sm:inline">
                    (
                    {entry.you
                      ? t("contrib.board.you")
                      : t("contrib.board.synthetic")}
                    )
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {points}
                </TableCell>
                <TableCell>
                  <LevelBadge level={reputation.level} />
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell">
                  {reputation.verifiedShare === null
                    ? "–"
                    : `${percent(reputation.verifiedShare)}%`}
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell">
                  {reputation.decided}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p>{t("contrib.board.note")}</p>
      </Card>
      <Card title={t("contrib.agg.title")}>
        <p>{t("contrib.agg.body")}</p>
        <p data-testid="agg-participants" className="font-semibold text-foreground!">
          {fill(t("contrib.agg.participants"), { count: aggregate.participants })}
        </p>
        {aggregate.totals ? (
          <dl
            data-testid="agg-totals"
            className="mt-3 grid grid-cols-2 gap-2 min-[600px]:grid-cols-4"
          >
            {(
              [
                ["contrib.agg.verified", aggregate.totals.verified],
                ["contrib.agg.duplicate", aggregate.totals.duplicate],
                ["contrib.agg.rejected", aggregate.totals.rejected],
                [
                  "contrib.agg.share",
                  aggregate.totals.verifiedShare === null
                    ? "–"
                    : `${percent(aggregate.totals.verifiedShare)}%`,
                ],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-background/50 p-3"
              >
                <dt className="text-xs text-muted-foreground">{t(label)}</dt>
                <dd className="m-0 font-display text-2xl font-semibold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p data-testid="agg-hidden">
            {fill(t("contrib.agg.tooFew"), { min: AGGREGATE_MIN_PARTICIPANTS })}
          </p>
        )}
      </Card>
    </div>
  );
}

export function ContributionsTabs() {
  const { t } = usePrefs();
  return (
    <Tabs defaultValue="points" className="gap-4">
      <TabsList
        aria-label={t("contrib.tabsLabel")}
        className="grid h-auto w-full grid-cols-2 min-[520px]:grid-cols-3 lg:w-fit lg:grid-cols-5"
      >
        <TabsTrigger value="points">
          <Coins aria-hidden />
          {t("contrib.tab.points")}
        </TabsTrigger>
        <TabsTrigger value="reputation">
          <ShieldCheck aria-hidden />
          {t("contrib.tab.reputation")}
        </TabsTrigger>
        <TabsTrigger value="leaderboard">
          <Trophy aria-hidden />
          {t("contrib.tab.leaderboard")}
        </TabsTrigger>
        <TabsTrigger value="ledger">
          <History aria-hidden />
          {t("contrib.tab.ledger")}
        </TabsTrigger>
        <TabsTrigger value="settings">
          <EyeOff aria-hidden />
          {t("contrib.tab.settings")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="points">
        <PointsTab />
      </TabsContent>
      <TabsContent value="reputation">
        <ReputationTab />
      </TabsContent>
      <TabsContent value="leaderboard">
        <LeaderboardTab />
      </TabsContent>
      <TabsContent value="ledger">
        <LedgerTab />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}