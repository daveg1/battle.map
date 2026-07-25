import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { ControlPanelLogo } from "./panel-logo";
import { ControlPanelSection } from "./panel-section";
import { ControlPanelSavedPins } from "./panel-saved-pins";
import type { SavedPinItem } from "../../types/common";
import { ControlPanelRadiusForm } from "./panel-radius-form";
import { ControlPanelPlaceSearch } from "./panel-place-search";

interface Props {
  mapRef: RefObject<MapRef | null>;
  savedPins: SavedPinItem[];
  recentlyAddedPinId: string | null;
  recentlyRemovedPinId: string | null;
  onRemoveSavedPin(id: string): void;
  onSelectSavedPin(id: string): void;
}

export function ControlPanel({
  mapRef,
  savedPins,
  recentlyAddedPinId,
  recentlyRemovedPinId,
  onRemoveSavedPin,
  onSelectSavedPin,
}: Props) {
  return null;

  return (
    <div className="flex h-screen w-100 flex-col gap-4 overflow-hidden overflow-y-auto bg-stone-800 p-2 text-white lg:p-4">
      <ControlPanelLogo />

      <ControlPanelSection
        title="Search"
        className="flex flex-col gap-2 lg:gap-3"
      >
        <ControlPanelPlaceSearch mapRef={mapRef} />
        <ControlPanelRadiusForm />
      </ControlPanelSection>

      <ControlPanelSection title="Saved pins" className="flex flex-1 flex-col">
        <ControlPanelSavedPins
          savedPins={savedPins}
          recentlyAddedPinId={recentlyAddedPinId}
          recentlyRemovedPinId={recentlyRemovedPinId}
          onSelectSavedPin={onSelectSavedPin}
          onRemoveSavedPin={onRemoveSavedPin}
        />
      </ControlPanelSection>
    </div>
  );
}
