import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { ControlPanelLogo } from "./panel-logo";
import { ControlPanelSearchArea } from "./panel-search-area";
import { ControlPanelSection } from "./panel-section";
import { ControlPanelSavedPins } from "./panel-saved-pins";
import type { SavedPinItem } from "../../types/common";

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
  return (
    <div className="flex h-screen w-100 flex-col gap-4 overflow-hidden overflow-y-auto bg-stone-800 p-4 text-white">
      <ControlPanelLogo />

      <ControlPanelSection title="Search">
        <ControlPanelSearchArea mapRef={mapRef} />
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
