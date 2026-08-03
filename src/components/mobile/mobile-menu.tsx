import * as turf from "@turf/turf";
import {
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "@uidotdev/usehooks";
import {
  type ChangeEvent,
  type RefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { useMapStore } from "../../stores/use-map-store";
import { MAX_RADIUS_KM, MIN_RADIUS_KM } from "../../types/viewer-state";
import { MobileMenuButton } from "./mobile-menu-button";

const FIT_TO_VIEW_DEBOUNCE_MS = 200;

interface Props {
  mapRef: RefObject<MapRef | null>;
}

export function MobileMenu({ mapRef }: Props) {
  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);
  const isPlacingRadius = useMapStore((state) => state.isPlacingRadius);
  const setIsPlacingRadius = useMapStore((state) => state.setIsPlacingRadius);
  const hasRadius = Boolean(radius.point);
  const debouncedRadiusSize = useDebounce(radius.size, FIT_TO_VIEW_DEBOUNCE_MS);
  const [isRadiusSliderOpen, setIsRadiusSliderOpen] = useState(false);

  function handleRadiusUpdate(event: ChangeEvent<HTMLInputElement>) {
    const nextSize = Number(event.target.valueAsNumber);
    const size = Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, nextSize));

    setRadius((current) => ({ ...current, size }));
  }

  function handleClearRadius() {
    setRadius((current) => ({ ...current, point: null }));
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
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col items-center gap-2">
      {isRadiusSliderOpen && (
        <section
          id="mobile-radius-slider"
          className="pointer-events-auto w-full max-w-md rounded-lg border border-stone-600 bg-stone-900/90 px-4 py-3 text-white shadow-lg backdrop-blur-sm"
        >
          <input
            type="range"
            className="w-full"
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            value={radius.size}
            onChange={handleRadiusUpdate}
            disabled={isPlacingRadius}
          />
        </section>
      )}

      <aside className="pointer-events-auto mx-auto flex w-fit gap-2 rounded-lg border border-stone-600 bg-stone-900/90 p-2 text-white shadow-lg backdrop-blur-sm">
        <MobileMenuButton
          title={
            isPlacingRadius ? "Cancel placing radius" : "Place radius on map"
          }
          isActive={isPlacingRadius}
          disabled={false}
          onClick={() => {
            const next = !isPlacingRadius;
            setIsPlacingRadius(next);
          }}
        >
          <CursorArrowRaysIcon className="size-5" />
        </MobileMenuButton>

        <MobileMenuButton
          isSplit
          isSplitOpen={isRadiusSliderOpen}
          title="Toggle radius slider"
          disabled={isPlacingRadius}
          onClick={() => {
            setIsRadiusSliderOpen((current) => !current);
          }}
        >
          <div className="px-3 py-2">
            <span className="block font-medium">Radius</span>
            <span className="block tabular-nums">
              {Math.round(radius.size)} km
            </span>
          </div>
        </MobileMenuButton>

        <MobileMenuButton
          title="Fit radius to view"
          disabled={!hasRadius || isPlacingRadius}
          onClick={handleFitToView}
        >
          <ArrowsPointingOutIcon className="size-5" />
        </MobileMenuButton>

        <MobileMenuButton
          title="Clear radius"
          disabled={!hasRadius || isPlacingRadius}
          onClick={handleClearRadius}
        >
          <NoSymbolIcon className="size-5" />
        </MobileMenuButton>
      </aside>
    </div>
  );
}
