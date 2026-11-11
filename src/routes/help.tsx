import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  FileText,
  Landmark,
  LockKeyhole,
  Map,
  Mountain,
  Search,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { Input } from "@/components/ui/input";
import { usePrefs } from "@/i18n/preferences";
import { helpTopics } from "@/data/help-topics";
import "./help.css";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help & Safety Centre · RaahPrahari" }] }),
  component: HelpPage,
});

const topicIcons: Record<(typeof helpTopics)[number]["slug"], LucideIcon> = {
  report: TriangleAlert,
  status: ShieldAlert,
  freshness: Clock3,
  "map-offline": Map,
  privacy: LockKeyhole,
  restrictions: Landmark,
};

function HelpPage() {
  const { t } = usePrefs();
  const isHelpTopic = useRouterState({
    select: (state) => state.location.pathname !== "/help",
  });
  const [query, setQuery] = useState("");
  const filteredTopics = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return helpTopics;
    return helpTopics.filter(({ titleKey, descriptionKey }) =>
      `${t(titleKey)} ${t(descriptionKey)}`
        .toLocaleLowerCase()
        .includes(normalized),
    );
  }, [query, t]);

  if (isHelpTopic) return <Outlet />;

  return (
    <div className="help-page">
      <header className="help-banner">
        <div className="help-container help-banner-content">
          <p className="help-eyebrow">
            <span aria-hidden />
            {t("help.eyebrow")}
          </p>
          <h1>{t("help.title")}</h1>
          <p className="help-banner-description">{t("help.subtitle")}</p>
        </div>
      </header>

      <div className="help-container help-content">
        <section className="help-topics" aria-label={t("help.topics")}>
          <label className="help-search">
            <span className="sr-only">{t("help.search")}</span>
            <Search aria-hidden className="help-search-icon" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("help.search")}
              className="help-search-input"
            />
          </label>

          <div className="help-topic-grid">
            {filteredTopics.map(({ slug, titleKey, descriptionKey }) => {
              const Icon = topicIcons[slug];
              return (
                <Link
                  key={slug}
                  to="/help/$topic"
                  params={{ topic: slug }}
                  className="rp-card rp-enter help-topic-card"
                >
                  <span
                    className={`help-topic-icon help-topic-icon-${slug}`}
                    aria-hidden
                  >
                    <Icon />
                  </span>
                  <span className="help-topic-copy">
                    <span className="help-topic-title">
                      {t(titleKey)}
                      {slug === "map-offline" && (
                        <span className="help-planned">
                          {t("help.planned")}
                        </span>
                      )}
                    </span>
                    <span className="help-topic-description">
                      {t(descriptionKey)}
                    </span>
                  </span>
                  <ArrowRight aria-hidden className="rp-arrow help-topic-arrow" />
                </Link>
              );
            })}
            {filteredTopics.length === 0 && (
              <p className="help-empty" role="status">
                {t("help.empty")}
              </p>
            )}
          </div>
        </section>

        <aside className="help-reminder" aria-labelledby="help-reminder-title">
          <div className="help-reminder-content">
            <p className="help-reminder-label">
              <ShieldAlert aria-hidden />
              {t("help.reminderLabel")}
            </p>
            <h2 id="help-reminder-title">{t("help.reminderTitle")}</h2>
            <p className="help-reminder-body">{t("help.reminderBody")}</p>
            <span className="help-reminder-rule" aria-hidden />
            <ul className="help-reminder-items">
              <li>
                <Mountain aria-hidden />
                <span>{t("help.reminderConditions")}</span>
              </li>
              <li>
                <FileText aria-hidden />
                <span>{t("help.reminderUpdates")}</span>
              </li>
              <li>
                <ShieldCheck aria-hidden />
                <span>{t("help.reminderResponsibly")}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <footer className="help-page-footer">
        <div className="help-container help-footer-content">
          <Link to="/" className="help-back-link">
            <ArrowLeft aria-hidden />
            {t("help.backHome")}
          </Link>
          <PrototypeRibbon />
        </div>
      </footer>
    </div>
  );
}
