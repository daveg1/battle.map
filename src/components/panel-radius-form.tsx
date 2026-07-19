import type { ChangeEvent } from "react";
import { useMapStore } from "../stores/use-map-store";

export function ControlPanelRadiusForm() {
  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);
  const hasRadius = Boolean(radius.point);

  function handleRadiusUpdate(event: ChangeEvent<HTMLInputElement>) {
    setRadius((current) => ({
      ...current,
      size: event.target.valueAsNumber,
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
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm">Radius (km)</h4>

        <input
          type="number"
          className="w-16 rounded bg-stone-700 px-2 py-1"
          value={radius.size}
          onChange={handleRadiusUpdate}
        />
      </div>

      <input
        type="range"
        className="mt-2 w-full"
        min={1}
        max={1000}
        value={radius.size}
        onChange={handleRadiusUpdate}
      />

      <button
        type="button"
        className="w-full cursor-pointer rounded-lg bg-stone-700 py-2 enabled:hover:bg-stone-700/50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasRadius}
        onClick={handleClearRadius}
      >
        Clear radius
      </button>
    </>
  );
}
