import { useState } from "react";
import { History, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_LEDGER } from "@/data/ledger";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import {
  APPEAL_NOTE_MAX,
  canAppeal,
  checkAppealNote,
  isReversal,
  ledgerBalance,
  type AppealNoteProblem,
  type LedgerEntry,
} from "@/lib/contribution-ledger";
import { cn } from "@/lib/utils";
import { Card, fill } from "./contribution-ui";
import { useAppeals } from "./use-contribution-prefs";

function AppealControl({ entry }: { entry: LedgerEntry }) {
  const { t, stamp } = usePrefs();
  const { appeals, save, withdraw } = useAppeals();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState<AppealNoteProblem | null>(null);
  const saved = appeals[entry.id];

  if (entry.appealOutcome) {
    return (
      <p className="m-0! mt-1! text-xs font-semibold text-foreground!">
        {t(
          entry.appealOutcome === "upheld"
            ? "contrib.appeal.upheld"
            : "contrib.appeal.notUpheld",
        )}
      </p>
    );
  }
  if (saved) {
    return (
      <div className="mt-1 space-y-1">
        <p className="m-0! text-xs">
          {fill(t("contrib.appeal.saved"), { date: stamp(saved.at) })}
        </p>
        <p className="m-0! text-xs italic">{saved.note}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={() => withdraw(entry.id)}
        >
          {t("contrib.appeal.withdraw")}
        </Button>
      </div>
    );
  }
  if (!canAppeal(entry)) return null;
  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-1 min-h-11"
        onClick={() => setOpen(true)}
      >
        <MessageSquareWarning aria-hidden />
        {t("contrib.appeal.action")}
      </Button>
    );
  }
  const fieldId = `appeal-${entry.id}`;
  const errorId = `${fieldId}-error`;
  return (
    <form
      className="mt-2 space-y-2"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const found = checkAppealNote(note);
        setProblem(found);
        if (found) return;
        save(entry.id, note);
        setOpen(false);
        setNote("");
      }}
    >
      <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
        {t("contrib.appeal.label")}
      </label>
      <Textarea
        id={fieldId}
        value={note}
        maxLength={APPEAL_NOTE_MAX + 50}
        aria-invalid={problem ? true : undefined}
        aria-describedby={problem ? errorId : undefined}
        autoComplete="off"
        onChange={(event) => setNote(event.target.value)}
      />
      {problem ? (
        <p id={errorId} role="alert" className="m-0! text-sm text-status-dnt!">
          {fill(t(`contrib.appeal.err.${problem}` as TranslationKey), {
            max: APPEAL_NOTE_MAX,
          })}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" className="min-h-11">
          {t("contrib.appeal.submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={() => {
            setOpen(false);
            setProblem(null);
          }}
        >
          {t("contrib.appeal.cancel")}
        </Button>
      </div>
    </form>
  );
}

export function LedgerTab() {
  const { t, stamp } = usePrefs();
  const balance = ledgerBalance(EXAMPLE_LEDGER);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 min-[900px]:grid-cols-2">
        <Card icon={History} title={t("contrib.ledger.title")}>
          <p>{t("contrib.ledger.how")}</p>
        </Card>
        <Card title={t("contrib.ledger.yours")}>
          <p data-testid="your-ledger-empty">{t("contrib.ledger.yoursEmpty")}</p>
        </Card>
      </div>
      <Card title={t("contrib.ledger.exampleTitle")}>
        <p>{t("contrib.ledger.exampleNote")}</p>
        <Table className="mt-3 [&_td]:px-1 [&_th]:px-1 sm:[&_td]:px-2 sm:[&_th]:px-2">
          <TableHeader>
            <TableRow>
              <TableHead>{t("contrib.col.date")}</TableHead>
              <TableHead>{t("contrib.col.reason")}</TableHead>
              <TableHead className="text-right">
                {t("contrib.col.points")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EXAMPLE_LEDGER.map((entry) => (
              <TableRow key={entry.id} data-testid={`ledger-${entry.id}`}>
                <TableCell className="align-top text-xs whitespace-normal">
                  {stamp(entry.at)}
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <span className="font-medium text-foreground">
                    {t(`contrib.reason.${entry.reason}` as TranslationKey)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                    {entry.reportRef}
                    {entry.reverses
                      ? ` · ${fill(t("contrib.ledger.reverses"), { id: entry.reverses })}`
                      : ""}
                  </span>
                  <AppealControl entry={entry} />
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right align-top font-semibold whitespace-nowrap",
                    isReversal(entry) ? "text-status-dnt" : "text-foreground",
                  )}
                >
                  {entry.points > 0 ? `+${entry.points}` : `−${Math.abs(entry.points)}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p data-testid="ledger-balance" className="font-semibold text-foreground!">
          {fill(t("contrib.ledger.balance"), { points: balance })}
        </p>
      </Card>
      <Card title={t("contrib.appeal.title")}>
        <p>{t("contrib.appeal.how")}</p>
      </Card>
    </div>
  );
}
