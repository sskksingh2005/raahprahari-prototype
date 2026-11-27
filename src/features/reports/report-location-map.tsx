import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  loadLeaflet,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
} from "@/features/map/leaflet-segment-map";

export function ReportLocationMap({
  lat,
  lon,
  onChange,
}: {
  lat: number | null;
  lon: number | null;
  onChange: (lat: number, lon: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ map: Leaflet.Map; L: typeof Leaflet } | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const changeRef = useRef(onChange);
  const initialLatRef = useRef(lat);
  const initialLonRef = useRef(lon);
  const [failure, setFailure] = useState("");

  useEffect(() => {
    changeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const resizeMap = () => map?.invalidateSize();

    void loadLeaflet()
      .then((L) => {
        if (cancelled) return;
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          setFailure(
            "Map tiles are unavailable while offline. Coordinates already selected remain saved.",
          );
          return;
        }

        const initialLat = initialLatRef.current;
        const initialLon = initialLonRef.current;
        const center: [number, number] =
          initialLat !== null && initialLon !== null
            ? [initialLat, initialLon]
            : [30.07, 79.2];
        const createdMap = L.map(container, {
          attributionControl: false,
          zoomControl: true,
          keyboard: true,
          minZoom: 6,
          maxZoom: 18,
          maxBounds: L.latLngBounds([27.8, 76.8], [32.2, 81.8]),
        }).setView(center, initialLat !== null && initialLon !== null ? 13 : 7);
        map = createdMap;
        mapRef.current = { map: createdMap, L };

        L.control
          .attribution({
            prefix: '<a href="https://leafletjs.com">Leaflet</a>',
            position: "bottomleft",
          })
          .addAttribution(OSM_ATTRIBUTION)
          .addTo(createdMap);

        let loaded = 0;
        let errors = 0;
        L.tileLayer(OSM_TILE_URL, { maxZoom: 19, crossOrigin: true })
          .on("tileload", () => {
            loaded += 1;
          })
          .on("tileerror", () => {
            errors += 1;
            if (loaded === 0 && errors >= 4) {
              setFailure(
                "The map tiles could not be loaded. You can still enter coordinates manually.",
              );
            }
          })
          .addTo(createdMap);

        const placeMarker = (pointLat: number, pointLon: number) => {
          if (markerRef.current) {
            markerRef.current.setLatLng([pointLat, pointLon]);
          } else {
            markerRef.current = L.marker([pointLat, pointLon], {
              draggable: true,
            })
              .addTo(createdMap)
              .on("dragend", (event: Leaflet.LeafletEvent) => {
                const point = (event.target as Leaflet.Marker).getLatLng();
                changeRef.current(point.lat, point.lng);
              });
          }
        };

        if (initialLat !== null && initialLon !== null) {
          placeMarker(initialLat, initialLon);
        }
        createdMap.on("click", (event: Leaflet.LeafletMouseEvent) => {
          placeMarker(event.latlng.lat, event.latlng.lng);
          changeRef.current(event.latlng.lat, event.latlng.lng);
        });

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(resizeMap);
          resizeObserver.observe(container);
        } else {
          window.addEventListener("resize", resizeMap);
        }
      })
      .catch(() => {
        if (!cancelled)
          setFailure(
            "The interactive map could not start. You can still enter coordinates manually.",
          );
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeMap);
      if (map) {
        map.remove();
      }
      if (mapRef.current?.map === map) {
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || lat === null || lon === null) return;
    const { map, L } = mapRef.current;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.marker([lat, lon], { draggable: true })
        .addTo(map)
        .on("dragend", (event: Leaflet.LeafletEvent) => {
          const point = (event.target as Leaflet.Marker).getLatLng();
          changeRef.current(point.lat, point.lng);
        });
    }
  }, [lat, lon]);

  return (
    <div>
      {failure && (
        <p
          role="alert"
          className="mb-2 rounded-lg border border-status-caution/50 bg-status-caution/10 p-2 text-xs"
        >
          {failure}
        </p>
      )}
      <div
        ref={containerRef}
        role="application"
        aria-label="Interactive map for choosing the hazard location"
        className="h-64 w-full rounded-xl border border-border sm:h-80"
      />
      {lat === null || lon === null ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Default area: Uttarakhand. Choose a point on the map to mark the
          hazard.
        </p>
      ) : null}
    </div>
  );
}
