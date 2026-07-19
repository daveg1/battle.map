import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { ControlPanelPlaceSearch } from "./panel-place-search";
import { ControlPanelRadiusForm } from "./panel-radius-form";

interface Props {
  mapRef: RefObject<MapRef | null>;
}

export function ControlPanelSearchArea({ mapRef }: Props) {
  return (
    <div className="mt-3 flex flex-col gap-4">
      <ControlPanelPlaceSearch mapRef={mapRef} />
      <ControlPanelRadiusForm />
    </div>
  );
}
