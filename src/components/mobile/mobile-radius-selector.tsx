import * as turf from "@turf/turf";
import {
  ArrowsPointingOutIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import type { ChangeEvent } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { useMapStore } from "../../stores/use-map-store";

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 1000;

interface Props {
  mapRef: RefObject<MapRef | null>;
}

export function MobileRadiusSelector({ mapRef }: Props) {
  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);
  const hasRadius = Boolean(radius.point);

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

  function handleFitToView() {
    if (!radius.point) {
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    const circle = turf.circle(
      [radius.point.lng, radius.point.lat],
      radius.size,
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
  }

  return (
    <aside className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 mx-auto flex w-fit gap-2 rounded-lg border border-stone-600 bg-stone-900/90 p-3 text-white shadow-lg backdrop-blur-sm">
      <section className="flex gap-4">
        <div className="flex shrink-0 flex-col">
          <span className="text-sm font-medium">Radius</span>
          <span className="text-sm tabular-nums">
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
        />
      </section>

      <button
        type="button"
        className="grid w-12 cursor-pointer place-items-center rounded bg-stone-700 py-2 text-sm enabled:hover:bg-stone-700/60 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleFitToView}
        disabled={!hasRadius}
        aria-label="Fit radius to view"
        title="Fit radius to view"
      >
        <ArrowsPointingOutIcon className="size-5" />
      </button>

      <button
        type="button"
        className="grid w-12 cursor-pointer place-items-center rounded bg-stone-700 py-2 text-sm enabled:hover:bg-stone-700/60 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleClearRadius}
        disabled={!hasRadius}
        aria-label="Clear radius"
        title="Clear radius"
      >
        <NoSymbolIcon className="size-5" />
      </button>
    </aside>
  );
}
