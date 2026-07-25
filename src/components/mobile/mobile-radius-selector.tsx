import * as turf from "@turf/turf";
import {
  ArrowsPointingOutIcon,
  MapPinIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "@uidotdev/usehooks";
import { type ChangeEvent, useCallback, useEffect } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { useMapStore } from "../../stores/use-map-store";

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 1000;
const FIT_TO_VIEW_DEBOUNCE_MS = 200;

interface Props {
  mapRef: RefObject<MapRef | null>;
}

export function MobileRadiusSelector({ mapRef }: Props) {
  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);
  const isPlacingRadius = useMapStore((state) => state.isPlacingRadius);
  const setIsPlacingRadius = useMapStore((state) => state.setIsPlacingRadius);
  const hasRadius = Boolean(radius.point);
  const debouncedRadiusSize = useDebounce(radius.size, FIT_TO_VIEW_DEBOUNCE_MS);

  function handleRadiusUpdate(event: ChangeEvent<HTMLInputElement>) {
    const nextSize = Number(event.target.valueAsNumber);
    const size = Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, nextSize));

    setRadius((current) => ({
      ...current,
      size,
    }));
  }

  function handleClearRadius() {
    setRadius((current) => ({
      ...current,
      point: null,
    }));
    clearSelectedMarker();
  }

  const fitRadiusToView = useCallback(
    (radiusSize: number) => {
      if (!radius.point) {
        return;
      }

      const map = mapRef.current;
      if (!map) {
        return;
      }

      const circle = turf.circle(
        [radius.point.lng, radius.point.lat],
        radiusSize,
        {
          steps: 64,
          units: "kilometers",
        },
      );
      const [minLng, minLat, maxLng, maxLat] = turf.bbox(circle);

      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: 40,
          duration: 600,
        },
      );
    },
    [mapRef, radius.point],
  );

  function handleFitToView() {
    fitRadiusToView(radius.size);
  }

  useEffect(() => {
    fitRadiusToView(debouncedRadiusSize);
  }, [debouncedRadiusSize, fitRadiusToView]);

  return (
    <aside className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 mx-auto flex w-fit gap-2 rounded-lg border border-stone-600 bg-stone-900/90 p-2 text-white shadow-lg backdrop-blur-sm">
      <button
        type="button"
        className="grid w-12 cursor-pointer place-items-center rounded py-2 text-sm enabled:hover:bg-stone-700/60 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => {
          const next = !isPlacingRadius;
          setIsPlacingRadius(next);
        }}
        aria-label={isPlacingRadius ? "Cancel placing radius" : "Place radius on map"}
        title={isPlacingRadius ? "Cancel placing radius" : "Place radius on map"}
        style={isPlacingRadius ? { backgroundColor: "rgb(68 64 60 / 0.9)" } : undefined}
      >
        <MapPinIcon className="size-5" />
      </button>

      <section className="flex items-center gap-4 transition-opacity" style={isPlacingRadius ? { opacity: 0.4, pointerEvents: "none" } : undefined}>
        <div className="flex shrink-0 flex-col">
          <span className="text-xs font-medium">Radius</span>
          <span className="text-xs tabular-nums">
            {Math.round(radius.size)} km
          </span>
        </div>

        <input
          type="range"
          className="w-50"
          min={MIN_RADIUS_KM}
          max={MAX_RADIUS_KM}
          value={radius.size}
          onChange={handleRadiusUpdate}
          aria-label="Search radius in kilometers"
          disabled={isPlacingRadius}
        />
      </section>

      <button
        type="button"
        className="grid w-12 cursor-pointer place-items-center rounded bg-stone-700 py-2 text-sm enabled:hover:bg-stone-700/60 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleFitToView}
        disabled={!hasRadius || isPlacingRadius}
        aria-label="Fit radius to view"
        title="Fit radius to view"
      >
        <ArrowsPointingOutIcon className="size-5" />
      </button>

      <button
        type="button"
        className="grid w-12 cursor-pointer place-items-center rounded bg-stone-700 py-2 text-sm enabled:hover:bg-stone-700/60 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleClearRadius}
        disabled={!hasRadius || isPlacingRadius}
        aria-label="Clear radius"
        title="Clear radius"
      >
        <NoSymbolIcon className="size-5" />
      </button>
    </aside>
  );
}
