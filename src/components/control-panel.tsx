import { ControlPanelLogo } from "./control-panel-logo";
import { ControlPanelSearchArea } from "./control-panel-search-area";
import { ControlPanelSection } from "./control-panel-section";
import { ControlPanelSavedPins } from "./control-panel-saved-pins";
import type { Point, SavedPinItem } from "../types/common";

interface Props {
  radius: number;
  hasRadius: boolean;
  savedPins: SavedPinItem[];
  onSearch(radius: number): void;
  onSetRadiusPoint(point: Point): void;
  onClear(): void;
  onRemoveSavedPin(id: string): void;
  onSelectSavedPin(id: string): void;
}

export function ControlPanel({
  radius,
  hasRadius,
  savedPins,
  onSearch,
  onSetRadiusPoint,
  onClear,
  onRemoveSavedPin,
  onSelectSavedPin,
}: Props) {
  return (
    <div className="flex h-screen w-100 flex-col gap-4 overflow-hidden bg-stone-800 p-4 text-white">
      <ControlPanelLogo />

      <ControlPanelSection title="Search">
        <ControlPanelSearchArea
          radius={radius}
          hasRadius={hasRadius}
          onSearch={onSearch}
          onSetRadiusPoint={onSetRadiusPoint}
          onClear={onClear}
        />
      </ControlPanelSection>

      <ControlPanelSection title="Saved pins" className="flex min-h-0 flex-1 flex-col">
        <ControlPanelSavedPins
          savedPins={savedPins}
          onSelectSavedPin={onSelectSavedPin}
          onRemoveSavedPin={onRemoveSavedPin}
        />
      </ControlPanelSection>
    </div>
  );
}
