import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeInfo,
  Database,
  Accessibility,
  FileText,
  LockKeyhole,
  Mail,
  Route as RouteIcon,
} from "lucide-react";
import { PageBanner } from "@/components/page-banner";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/i18n/preferences";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About | RaahPrahari" }] }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = usePrefs();
  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t("aboutPage.eyebrow")}
        title={t("about.title")}
        description={t("aboutPage.description")}
      />
      <div className="rp-info-container rp-info-content">
        <div className="grid gap-3 min-[600px]:grid-cols-2 min-[1050px]:grid-cols-3">
          <article className="rp-info-card">
            <Database aria-hidden className="mb-3 size-5 text-brand-orange" />
            <h2>{t("aboutPage.prototypeTitle")}</h2>
            <p>{t("aboutPage.prototypeBody")}</p>
          </article>

          <article className="rp-info-card">
            <BadgeInfo aria-hidden className="mb-3 size-5 text-brand-orange" />
            <h2>{t("aboutPage.readTitle")}</h2>
            <p>{t("aboutPage.readBody")}</p>
            <ul className="mt-3 space-y-2 pl-5">
              <li>
                <strong>{t("aboutPage.cautionLabel")}</strong>{" "}
                {t("aboutPage.caution")}
              </li>
              <li>
                <strong>{t("aboutPage.avoidLabel")}</strong>{" "}
                {t("aboutPage.avoid")}
              </li>
              <li>
                <strong>{t("aboutPage.unknownLabel")}</strong>{" "}
                {t("aboutPage.unknown")}
              </li>
            </ul>
            <p>{t("aboutPage.readNote")}</p>
          </article>

          <article className="rp-info-card">
            <RouteIcon aria-hidden className="mb-3 size-5 text-brand-orange" />
            <h2>{t("aboutPage.limitsTitle")}</h2>
            <p>{t("aboutPage.limitsBody")}</p>
          </article>
        </div>

        <div className="mt-3 grid gap-3 min-[600px]:grid-cols-2">
          <article id="privacy" className="rp-info-card scroll-mt-24">
            <LockKeyhole
              aria-hidden
              className="mb-3 size-5 text-brand-orange"
            />
            <h2>{t("aboutPage.privacyTitle")}</h2>
            <p>{t("aboutPage.privacyBody")}</p>
          </article>
          <article id="terms" className="rp-info-card scroll-mt-24">
            <FileText aria-hidden className="mb-3 size-5 text-brand-orange" />
            <h2>{t("aboutPage.termsTitle")}</h2>
            <p>{t("aboutPage.termsBody")}</p>
          </article>
          <article id="accessibility" className="rp-info-card scroll-mt-24">
            <Accessibility
              aria-hidden
              className="mb-3 size-5 text-brand-orange"
            />
            <h2>{t("aboutPage.accessibilityTitle")}</h2>
            <p>{t("aboutPage.accessibilityBody")}</p>
          </article>
          <article id="contact" className="rp-info-card scroll-mt-24">
            <Mail aria-hidden className="mb-3 size-5 text-brand-orange" />
            <h2>{t("aboutPage.contactTitle")}</h2>
            <p>{t("aboutPage.contactBody")}</p>
            <p>
              <Link to="/contact" className="text-link underline">
                {t("aboutPage.contactLink")}
              </Link>
            </p>
          </article>
        </div>

        <div
          className="rp-info-actions"
          role="group"
          aria-label={t("aboutPage.actionsLabel")}
        >
          <Button asChild className="min-h-11 rounded-xl">
            <Link to="/traveller">
              {t("aboutPage.checkRoad")} <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <Link to="/advisories">{t("aboutPage.viewAdvisories")}</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <Link to="/help">{t("aboutPage.help")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
