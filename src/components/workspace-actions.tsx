import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CircleCheck,
  CircleSlash,
  FlaskConical,
  HardDrive,
  type LucideIcon,
} from "lucide-react";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import { useAccountSession } from "@/lib/account-session";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getTransportSource } from "@/lib/sync/sync-engine";
import { useOnlineStatus } from "@/lib/use-online-status";
import {
  countByAvailability,
  deriveWorkspaceActions,
  type ActionAvailability,
  type WorkspaceRoute,
  type WorkspaceScreen,
} from "@/lib/workspace-actions";
import { cn } from "@/lib/utils";

/** Every state pairs an icon and a label with its colour, never colour alone. */
const AVAILABILITY: Record<
  ActionAvailability,
  {
    icon: LucideIcon;
    label: TranslationKey;
    help: TranslationKey;
    className: string;
  }
> = {
  available: {
    icon: CircleCheck,
    label: "audit.state.available",
    help: "audit.stateHelp.available",
    className: "border-status-clear text-status-clear",
  },
  device: {
    icon: HardDrive,
    label: "audit.state.device",
    help: "audit.stateHelp.device",
    className: "border-border text-foreground",
  },
  simulated: {
    icon: FlaskConical,
    label: "audit.state.simulated",
    help: "audit.stateHelp.simulated",
    className: "border-status-caution text-status-caution",
  },
  blocked: {
    icon: CircleSlash,
    label: "audit.state.blocked",
    help: "audit.stateHelp.blocked",
    className: "border-status-dnt text-status-dnt",
  },
};

const ORDER: ActionAvailability[] = [
  "available",
  "device",
  "simulated",
  "blocked",
];

function AvailabilityBadge({
  availability,
}: {
  availability: ActionAvailability;
}) {
  const { t } = usePrefs();
  const { icon: Icon, label, className } = AVAILABILITY[availability];
  return (
    <span
      data-testid="action-availability"
      data-availability={availability}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-background/70 px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {t(label)}
    </span>
  );
}

function ScreenLink({ route, name }: { route: WorkspaceRoute; name: string }) {
  const { t } = usePrefs();
  const label = t("audit.openScreen").replace("{screen}", name);
  const className =
    "mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-link underline underline-offset-4";
  const content = (
    <>
      {label}
      <ArrowRight aria-hidden className="size-4" />
    </>
  );
  // /report validates an optional ?segment= search param, so it must be passed.
  return route === "/report" ? (
    <Link to="/report" search={{ segment: undefined }} className={className}>
      {content}
    </Link>
  ) : (
    <Link to={route} className={className}>
      {content}
    </Link>
  );
}

function ScreenCard({ screen }: { screen: WorkspaceScreen }) {
  const { t } = usePrefs();
  const name = t(screen.name);
  const headingId = `audit-${screen.id}`;
  return (
    <section
      aria-labelledby={headingId}
      data-testid={`audit-screen-${screen.id}`}
      className="rp-info-card"
    >
      <h3
        id={headingId}
        className="m-0 font-display text-lg font-semibold text-foreground"
      >
        {name}
      </h3>
      {screen.route ? (
        <ScreenLink route={screen.route} name={name} />
      ) : (
        <p className="m-0! mt-1! text-sm">{t("audit.dialogScreen")}</p>
      )}
      <ul className="m-0 mt-3 list-none space-y-3 p-0">
        {screen.actions.map((item) => (
          <li
            key={item.id}
            data-testid={`audit-action-${item.id}`}
            className="border-t border-border pt-3 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="min-w-0 text-sm font-semibold text-foreground">
                {t(item.name)}
              </span>
              <AvailabilityBadge availability={item.availability} />
            </div>
            <p className="m-0! mt-1! text-sm">{t(item.reason)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorkspaceActionsView({
  screens,
}: {
  screens: WorkspaceScreen[];
}) {
  const { t } = usePrefs();
  const counts = countByAvailability(screens);
  return (
    <section aria-labelledby="audit-title" className="mt-10">
      <h2
        id="audit-title"
        className="font-display text-2xl font-semibold text-foreground"
      >
        {t("audit.title")}
      </h2>
      <p className="mt-2 max-w-reading text-sm text-muted-foreground">
        {t("audit.intro")}
      </p>

      <dl
        aria-label={t("audit.summaryLabel")}
        className="mt-4 grid gap-2 min-[560px]:grid-cols-2 min-[1050px]:grid-cols-4"
      >
        {ORDER.map((state) => (
          <div
            key={state}
            data-testid={`audit-count-${state}`}
            className="flex min-w-0 flex-col items-start gap-1.5 rounded-lg border border-border bg-card/60 p-3"
          >
            <dt>
              <AvailabilityBadge availability={state} />
            </dt>
            <dd className="m-0 font-display text-2xl font-semibold text-foreground">
              {counts[state]}
            </dd>
            <dd className="m-0 text-xs text-muted-foreground">
              {t(AVAILABILITY[state].help)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-3 min-[700px]:grid-cols-2 min-[1050px]:grid-cols-3">
        {screens.map((screen) => (
          <ScreenCard key={screen.id} screen={screen} />
        ))}
      </div>
    </section>
  );
}

/** Reads the same runtime facts the feature screens use; changes with them. */
export function WorkspaceActions() {
  const online = useOnlineStatus();
  const session = useAccountSession().status;
  const screens = useMemo(
    () =>
      deriveWorkspaceActions({
        transport: getTransportSource(),
        supabaseConfigured: isSupabaseConfigured(),
        session,
        devBuild: import.meta.env.DEV,
        online,
      }),
    [online, session],
  );
  return <WorkspaceActionsView screens={screens} />;
}
