import { CircleHelp, Info, Link2, Link2Off } from "lucide-react";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import type { CommunityReport } from "@/lib/types";

/** Corroborated only when a reviewer recorded independent evidence. Score and count never decide it. */
export function hasIndependentEvidence(group: CommunityReport[]): boolean {
  return group.length > 1 && group.some((r) => r.independent === true);
}

export function ObservationEvidence({
  group,
}: {
  group: CommunityReport[];
}) {
  const { t } = usePrefs();
  const corroborated = hasIndependentEvidence(group);
  return (
    <section
      aria-labelledby="review-observations-title"
      className="rp-info-card glass"
      data-testid="review-observations"
    >
      <h2 id="review-observations-title">{t("review.obs.title")}</h2>
      <p className="flex items-start gap-2">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>{t("review.obs.intro")}</span>
      </p>
      <p
        data-testid="review-corroboration"
        data-corroborated={corroborated}
        className="font-semibold text-foreground"
      >
        {corroborated
          ? t("review.obs.corroborated")
          : t("review.obs.notCorroborated")}
      </p>
      <ul className="m-0 mt-3 list-none space-y-3 p-0">
        {group.map((obs) => {
          const Icon =
            obs.independent === true
              ? Link2Off
              : obs.independent === false
                ? Link2
                : CircleHelp;
          const independence =
            obs.independent === true
              ? t("review.obs.independent")
              : obs.independent === false
                ? t("review.obs.notIndependent")
                : t("review.obs.independenceUnknown");
          return (
            <li
              key={obs.ref}
              data-testid={`observation-${obs.ref}`}
              className="rounded-md border border-border p-3"
            >
              <h3 className="m-0 text-sm font-semibold text-foreground">
                {t("review.obs.item").replace("{ref}", obs.ref)}
              </h3>
              <p className="m-0 mt-1 text-xs text-muted-foreground">
                {t("review.obs.received")}
              </p>
              <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
                <dt className="font-semibold text-foreground">
                  {t("review.obs.source")}
                </dt>
                <dd className="m-0 text-muted-foreground">
                  {t(`source.${obs.source}` as TranslationKey)}
                </dd>
                <dt className="font-semibold text-foreground">
                  {t("review.obs.independence")}
                </dt>
                <dd className="m-0 flex items-center gap-1.5 text-muted-foreground">
                  <Icon aria-hidden className="size-4 shrink-0" />
                  {independence}
                </dd>
                <dt className="font-semibold text-foreground">
                  {t("review.obs.rationale")}
                </dt>
                <dd className="m-0 break-words text-muted-foreground">
                  {obs.independenceRationale || t("review.obs.noRationale")}
                </dd>
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
