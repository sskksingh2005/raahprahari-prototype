import { EyeOff, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import { Card } from "./contribution-ui";
import { useAppeals, useContributionSettings } from "./use-contribution-prefs";

function Option({
  id,
  label,
  help,
  checked,
  onChange,
}: {
  id: string;
  label: TranslationKey;
  help: TranslationKey;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const { t } = usePrefs();
  return (
    <div className="flex items-start gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-describedby={`${id}-help`}
        className="mt-1"
      />
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {t(label)}
        </label>
        <p id={`${id}-help`} className="m-0! mt-1! text-xs">
          {t(help)}
        </p>
      </div>
    </div>
  );
}

export function SettingsTab() {
  const { t } = usePrefs();
  const { settings, update, newPseudonym, reset } = useContributionSettings();
  const appeals = useAppeals();
  return (
    <div className="grid gap-3 min-[900px]:grid-cols-2">
      <Card icon={EyeOff} title={t("contrib.set.title")}>
        <p>{t("contrib.set.intro")}</p>
        <div className="mt-4 space-y-3">
          <Option
            id="opt-board"
            label="contrib.set.board"
            help="contrib.set.boardHelp"
            checked={settings.showOnLeaderboard}
            onChange={(value) => update({ showOnLeaderboard: value })}
          />
          <Option
            id="opt-aggregates"
            label="contrib.set.aggregates"
            help="contrib.set.aggregatesHelp"
            checked={settings.includeInAggregates}
            onChange={(value) => update({ includeInAggregates: value })}
          />
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <p className="m-0! text-sm font-medium text-foreground!">
            {t("contrib.set.pseudonym")}
          </p>
          <p data-testid="pseudonym" className="m-0! mt-1! font-mono text-sm">
            {settings.pseudonym ?? t("contrib.set.pseudonymNone")}
          </p>
          <p className="m-0! mt-1! text-xs">{t("contrib.set.pseudonymNote")}</p>
          {settings.pseudonym ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 min-h-11"
              onClick={newPseudonym}
            >
              {t("contrib.set.pseudonymNew")}
            </Button>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-auto min-h-11 w-full whitespace-normal"
          onClick={() => {
            reset();
            appeals.clear();
            toast(t("contrib.set.resetDone"));
          }}
        >
          {t("contrib.set.reset")}
        </Button>
      </Card>
      <Card icon={ShieldOff} title={t("contrib.never.title")} className="content-start">
        <p>{t("contrib.never.body")}</p>
      </Card>
    </div>
  );
}
