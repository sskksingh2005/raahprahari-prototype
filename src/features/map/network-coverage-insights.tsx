import { useState } from "react";
import { Signal, Wifi } from "lucide-react";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import { getDeadZoneWarning, getNetworkQuality } from "@/data/network-coverage";
import { NETWORK_CARRIERS } from "@/data/network-coverage";
import type {
  NetworkCarrier,
  NetworkCarrierFilter,
  NetworkCoverage,
  NetworkQuality,
} from "@/lib/types";
import {
  readNetworkTelemetry,
  type NetworkTelemetry,
} from "@/lib/network-telemetry";

const qualityLabels: Record<NetworkQuality, TranslationKey> = {
  strong: "network.strong",
  moderate: "network.moderate",
  weak: "network.weak",
  dead_zone: "network.deadZone",
};

const carrierLabels: Record<NetworkCarrier, TranslationKey> = {
  jio: "network.jio",
  airtel: "network.airtel",
  bsnl: "network.bsnl",
};

const qualityStyles: Record<NetworkQuality, string> = {
  strong: "is-strong",
  moderate: "is-moderate",
  weak: "is-weak",
  dead_zone: "is-dead-zone",
};

const bandwidthLabels: Record<
  NetworkCoverage["estimatedBandwidthTier"],
  TranslationKey
> = {
  "4G/5G": "network.bandwidth4g",
  "3G-4G intermittent": "network.bandwidthIntermittent",
  "2G-3G fallback": "network.bandwidthFallback",
  "No service": "network.bandwidthNone",
};

const latencyLabels: Record<
  NetworkCoverage["estimatedLatencyTier"],
  TranslationKey
> = {
  "<100 ms": "network.latencyLow",
  "100-300 ms": "network.latencyMedium",
  ">300 ms": "network.latencyHigh",
  unavailable: "network.latencyUnavailable",
};

export function NetworkCoverageInsights({
  coverage,
  carrier,
}: {
  coverage: NetworkCoverage;
  carrier: NetworkCarrierFilter;
}) {
  const { t, ago, stamp, lang } = usePrefs();
  const [telemetry, setTelemetry] = useState<NetworkTelemetry | null>(null);
  const quality = getNetworkQuality(coverage, carrier);
  const deadZoneWarning = getDeadZoneWarning(coverage, carrier);

  return (
    <section
      className="rp-network-insights"
      aria-labelledby="rp-network-insights-title"
    >
      <div className="rp-network-insights-heading">
        <h3 id="rp-network-insights-title">{t("network.details")}</h3>
        <span className={`rp-network-quality ${qualityStyles[quality]}`}>
          {t(qualityLabels[quality])}
        </span>
      </div>

      <p className="rp-network-estimates">
        {t(bandwidthLabels[coverage.estimatedBandwidthTier])} ·{" "}
        {t(latencyLabels[coverage.estimatedLatencyTier])}
      </p>
      {deadZoneWarning && (
        <p className="rp-network-warning" role="status">
          {t("network.deadZoneWarning").replace(
            "{count}",
            String(coverage.deadZoneLengthKm),
          )}
        </p>
      )}

      <ul className="rp-network-carriers" aria-label={t("network.carriers")}>
        {NETWORK_CARRIERS.map((name) => {
          const carrierQuality = coverage.carrierCoverage[name];
          return (
            <li key={name}>
              <span>{t(carrierLabels[name])}</span>
              <span
                className={`rp-network-quality ${qualityStyles[carrierQuality]}`}
              >
                {t(qualityLabels[carrierQuality])}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="rp-network-safety">
        <strong>{t("network.emergencyPoint")}</strong>
        <span>{coverage.emergencyPointBeforeDeadZone}</span>
      </div>

      <div className="rp-network-offline">
        <strong>{t("network.offlineTitle")}</strong>
        <p>{coverage.offlineSyncAdvice[lang]}</p>
      </div>

      <p className="rp-network-freshness">
        {t("network.verified")} {ago(coverage.lastVerifiedAt)} ·{" "}
        {t("network.samples").replace("{count}", String(coverage.sampleCount))}
      </p>
      <p className="rp-network-disclaimer">{t("network.synthetic")}</p>

      <div className="rp-network-telemetry">
        <button
          type="button"
          className="rp-network-log glass-btn-frost"
          onClick={() => setTelemetry(readNetworkTelemetry())}
        >
          <Signal aria-hidden />
          {t("network.logHere")}
        </button>
        <p>{t("network.localOnly")}</p>
        {telemetry && (
          <div className="rp-network-telemetry-result" role="status">
            <Wifi aria-hidden />
            <span>
              {telemetry.online === null
                ? t("network.statusUnknown")
                : telemetry.online
                  ? t("network.statusOnline")
                  : t("network.statusOffline")}
              {telemetry.effectiveType
                ? ` · ${telemetry.effectiveType.toUpperCase()}`
                : ` · ${t("network.apiUnavailable")}`}
              {telemetry.downlinkMbps !== null &&
                ` · ${telemetry.downlinkMbps} Mbps`}
              {telemetry.roundTripTimeMs !== null &&
                ` · ${telemetry.roundTripTimeMs} ms`}
            </span>
            <time dateTime={new Date(telemetry.capturedAt).toISOString()}>
              {stamp(telemetry.capturedAt)}
            </time>
          </div>
        )}
      </div>
    </section>
  );
}
