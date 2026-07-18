import { ControlPanelPlaceSearch } from "./control-panel-place-search";
import { ControlPanelRadiusForm } from "./control-panel-radius-form";
import type { Point } from "../types/common";

interface Props {
  radius: number;
  hasRadius: boolean;
  onSearch(radius: number): void;
  onSetRadiusPoint(point: Point): void;
  onClear(): void;
}

export function ControlPanelSearchArea({
  radius,
  hasRadius,
  onSearch,
  onSetRadiusPoint,
  onClear,
}: Props) {
  return (
    <div className="mt-3 flex flex-col gap-4">
      <ControlPanelPlaceSearch onSetRadiusPoint={onSetRadiusPoint} />

      <ControlPanelRadiusForm
        radius={radius}
        hasRadius={hasRadius}
        onSearch={onSearch}
        onClear={onClear}
      />
    </div>
  );
}
