import { Popup } from "react-map-gl/maplibre";
import type { BattleMarkerItem } from "../types/common";
import clsx from "clsx";

interface Props {
  selectedMarker: BattleMarkerItem | null;
  disabled: boolean;
  onClose: () => void;
}

export function MapPopup({ disabled, selectedMarker, onClose }: Props) {
  if (!selectedMarker) return;

  return (
    <Popup
      anchor="top"
      longitude={Number(selectedMarker.coords.lng)}
      latitude={Number(selectedMarker.coords.lat)}
      className={clsx(disabled && "is-zooming")}
      onClose={onClose}
      closeButton={false}
    >
      <h3 className="text-lg font-semibold">Battles here</h3>
      <ul className="mt-2 list-disc pl-5">
        {selectedMarker.battles.map((battle) => (
          <li key={battle.name}>{battle.name}</li>
        ))}
      </ul>
    </Popup>
  );
}
