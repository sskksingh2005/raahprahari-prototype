import {
  BadgeCheck,
  ShieldCheck,
  Sprout,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import type { ReputationLevel } from "@/lib/contribution";
import { cn } from "@/lib/utils";

const LEVEL_ICON: Record<ReputationLevel, LucideIcon> = {
  new: Sprout,
  building: TrendingUp,
  reliable: BadgeCheck,
  trusted: ShieldCheck,
};

export const percent = (share: number) => `${Math.round(share * 100)}`;

/** Fills {name} placeholders in a dictionary string. */
export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, `${value}`),
    template,
  );
}

/** Icon and label together, never colour alone. */
export function LevelBadge({ level }: { level: ReputationLevel }) {
  const { t } = usePrefs();
  const Icon = LEVEL_ICON[level];
  return (
    <span
      data-testid="reputation-level"
      data-level={level}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap sm:gap-1.5 sm:px-2",
        level === "trusted" ? "text-brand-orange" : "text-foreground",
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {t(`contrib.level.${level}` as TranslationKey)}
    </span>
  );
}

export function Card({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rp-info-card", className)}>
      {Icon ? (
        <Icon aria-hidden className="mb-3 size-5 text-brand-orange" />
      ) : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}
