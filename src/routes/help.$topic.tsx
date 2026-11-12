import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { helpTopics } from "@/data/help-topics";
import { usePrefs } from "@/i18n/preferences";
import "./help.css";

export const Route = createFileRoute("/help/$topic")({
  loader: ({ params }) => {
    const topic = helpTopics.find(({ slug }) => slug === params.topic);
    if (!topic) throw notFound();
    return topic;
  },
  head: () => ({ meta: [{ title: "Help topic · RaahPrahari" }] }),
  component: HelpTopicPage,
});

function HelpTopicPage() {
  const topic = Route.useLoaderData();
  const { t } = usePrefs();

  return (
    <div className="help-detail-page">
      <header className="help-banner help-detail-banner photo-surface">
        <div className="help-container help-banner-content">
          <Link to="/help" className="help-detail-back">
            <ArrowLeft aria-hidden />
            {t("help.backTopics")}
          </Link>
          <p className="help-eyebrow">
            <span aria-hidden />
            {t("help.eyebrow")}
          </p>
          <h1>{t(topic.titleKey)}</h1>
          {topic.slug === "map-offline" && (
            <span className="help-planned help-planned-detail">
              {t("help.planned")}
            </span>
          )}
        </div>
      </header>
      <div className="help-container help-detail-content">
        <article className="help-detail-card">
          <p className="help-detail-intro">{t(topic.descriptionKey)}</p>
          <h2>{t(topic.detailTitleKey)}</h2>
          <p>{t(topic.detailBodyKey)}</p>
          {topic.detailExtraKey && <p>{t(topic.detailExtraKey)}</p>}
          <p className="help-detail-caution">{t("help.reminderBody")}</p>
        </article>
        <Link to="/help" className="help-back-link">
          <ArrowLeft aria-hidden />
          {t("help.backTopics")}
        </Link>
      </div>
    </div>
  );
}
