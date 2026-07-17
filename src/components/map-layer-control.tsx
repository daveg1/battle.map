import clsx from "clsx";
import { MoonIcon, SunIcon } from "@heroicons/react/16/solid";
import type { MapSourceType } from "./map-source";

interface Props {
  source: MapSourceType;
  onToggle: () => void;
}

export function MapLayerControl({ source, onToggle }: Props) {
  const toggleToDark = source === "positron";

  return (
    <div className="maplibregl-ctrl-top-right">
      <div className="maplibregl-ctrl maplibregl-ctrl-group !mt-40 !mr-2 overflow-hidden rounded">
        <button
          type="button"
          className={clsx(
            "grid cursor-pointer place-items-center bg-white p-2 text-stone-900",
          )}
          onClick={onToggle}
          aria-label={
            toggleToDark ? "Switch to Dark Matter" : "Switch to Positron"
          }
          title={toggleToDark ? "Switch to Dark Matter" : "Switch to Positron"}
        >
          {toggleToDark && <MoonIcon className="size-4" />}
          {!toggleToDark && <SunIcon className="size-4" />}
        </button>
      </div>
    </div>
  );
}
