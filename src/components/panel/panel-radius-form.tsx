import type { ChangeEvent } from "react";
import { useMapStore } from "../../stores/use-map-store";
import { MAX_RADIUS_KM, MIN_RADIUS_KM } from "../../types/viewer-state";

export function ControlPanelRadiusForm() {
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

  return (
    <>
      <div className="flex flex-col gap-2 py-2">
        <h4 className="text-sm">Search radius (km)</h4>

        <div className="flex items-center gap-2">
          <input
            type="range"
            className="w-full"
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            value={radius.size}
            onChange={handleRadiusUpdate}
          />

          <input
            type="number"
            className="w-[4ch] rounded text-right leading-5 lg:w-[6ch]"
            value={radius.size}
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            onChange={handleRadiusUpdate}
          />
        </div>
      </div>

      <button
        type="button"
        className="w-full cursor-pointer rounded-sm bg-stone-700 py-2 text-sm enabled:hover:bg-stone-700/50 disabled:cursor-not-allowed disabled:opacity-50 lg:rounded-lg"
        disabled={!hasRadius}
        onClick={handleClearRadius}
      >
        Clear radius
      </button>
    </>
  );
}
