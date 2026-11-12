import {
  CircleCheck,
  CircleSlash,
  FlaskConical,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import {
  type ChannelTone,
  type IntegrationState,
  type IntegrationStatus,
} from "@/lib/system-status";
import { useSystemStatus } from "@/lib/use-system-status";
import { cn } from "@/lib/utils";

/** Every state pairs an icon and a label with its colour, never colour alone. */
const STATE_DISPLAY: Record<
  IntegrationState,
  { icon: LucideIcon; label: TranslationKey; help: TranslationKey | null; className: string }
> = {
  configured: {
    icon: CircleCheck,
    label: "status.state.configured",
    help: "status.stateHelp.configured",
    className: "border-status-clear text-status-clear",
  },
  simulated: {
    icon: FlaskConical,
    label: "status.state.simulated",
    help: "status.stateHelp.simulated",
    className: "border-status-caution text-status-caution",
  },
  unavailable: {
    icon: CircleSlash,
    label: "status.state.unavailable",
    help: "status.stateHelp.unavailable",
    className: "border-status-dnt text-status-dnt",
  },
  checking: {
    icon: LoaderCircle,
    label: "status.state.checking",
    help: null,
    className: "border-status-unknown text-status-unknown",
  },
};

const TONE_CLASS: Record<ChannelTone, string> = {
  ok: "text-status-clear",
  warn: "text-status-caution",
  bad: "text-status-dnt",
  neutral: "text-muted-foreground",
};

const LEGEND_ORDER: IntegrationState[] = [
  "configured",
  "simulated",
  "unavailable",
];

function StateBadge({ state }: { state: IntegrationState }) {
  const { t } = usePrefs();
  const { icon: Icon, label, className } = STATE_DISPLAY[state];
  return (
    <span
      data-testid="integration-state"
      data-state={state}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-background/70 px-2 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-3.5 motion-reduce:animate-none",
          state === "checking" && "animate-spin",
        )}
      />
      {t(label)}
    </span>
  );
}

function IntegrationRow({ item }: { item: IntegrationStatus }) {
  const { t, stamp } = usePrefs();
  const channel = item.channel;
  return (
    <li
      data-testid={`integration-${item.id}`}
      className="rp-info-card list-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2>{t(item.name)}</h2>
        <StateBadge state={item.state} />
      </div>
      <p>{t(item.reason)}</p>
      <div className="mt-3 border-t border-border pt-3 text-sm">
        <p className="m-0! text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("status.channelLabel")}
        </p>
        {channel ? (
          <>
            <p className={cn("mt-1! font-medium", TONE_CLASS[channel.tone])}>
              {t(channel.label)}
            </p>
            {channel.lastSuccessAt !== undefined ? (
              <p className="mt-1!">
                {t("status.lastSuccess")}:{" "}
                {channel.lastSuccessAt === null
                  ? t("status.never")
                  : stamp(channel.lastSuccessAt)}
              </p>
            ) : null}
            {channel.nextAttemptAt ? (
              <p className="mt-1!">
                {t("status.nextAttempt")}: {stamp(channel.nextAttemptAt)}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-1!">{t("status.channelNone")}</p>
        )}
      </div>
    </li>
  );
}

export function SystemStatusView({ items }: { items: IntegrationStatus[] }) {
  const { t } = usePrefs();
  return (
    <>
      <section
        aria-label={t("status.legendLabel")}
        className="mb-4 grid gap-2 min-[700px]:grid-cols-3"
      >
        {LEGEND_ORDER.map((state) => {
          const { help } = STATE_DISPLAY[state];
          return (
            <div
              key={state}
              className="flex min-w-0 flex-col items-start gap-1.5 rounded-lg border border-border bg-card/60 p-3"
            >
              <StateBadge state={state} />
              {help ? (
                <p className="text-xs text-muted-foreground">{t(help)}</p>
              ) : null}
            </div>
          );
        })}
      </section>
      <ul className="m-0 grid list-none gap-3 p-0 min-[600px]:grid-cols-2 min-[1050px]:grid-cols-3">
        {items.map((item) => (
          <IntegrationRow key={item.id} item={item} />
        ))}
      </ul>
      <p className="mt-4 max-w-reading text-sm text-muted-foreground">
        {t("status.disclaimer")}
      </p>
    </>
  );
}

export function SystemStatus() {
  return <SystemStatusView items={useSystemStatus()} />;
}
