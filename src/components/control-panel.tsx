import { ControlPanelHeader } from "./control-panel-header";
import { ControlPanelSearch } from "./control-panel-search";
import { ControlPanelSection } from "./control-panel-section";
import { ControlPanelSavedPins } from "./control-panel-saved-pins";
import { RangeSlider } from "./forms/range-slider";
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
      <ControlPanelHeader />

      <ControlPanelSection title="Search">
        <div className="mt-3 flex flex-col gap-4">
          <ControlPanelSearch onSetRadiusPoint={onSetRadiusPoint} />

          <RangeSlider label="Radius (km)" value={radius} onChange={onSearch} />

          <button
            type="button"
            className="w-full cursor-pointer rounded-lg bg-stone-700 py-2 enabled:hover:bg-stone-700/50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasRadius}
            onClick={onClear}
          >
            Clear radius
          </button>
        </div>
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
