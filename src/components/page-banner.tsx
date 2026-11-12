import "./page-banner.css";

export function PageBanner({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="rp-info-banner photo-surface">
      <div className="rp-info-container rp-info-banner-content">
        <p className="rp-info-eyebrow">
          <span aria-hidden />
          {eyebrow}
        </p>
        <h1>{title}</h1>
        {description && (
          <p className="rp-info-banner-description">{description}</p>
        )}
      </div>
    </header>
  );
}
