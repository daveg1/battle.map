import { Popup } from "react-map-gl/maplibre";
import type { BattleItem } from "../types/common";
import clsx from "clsx";

interface Props {
  selectedBattle: BattleItem | null;
  disabled: boolean;
  onClose: () => void;
}

export function MapPopup({ disabled, selectedBattle, onClose }: Props) {
  if (!selectedBattle) return;

  return (
    <Popup
      anchor="top"
      longitude={Number(selectedBattle.coords.lng)}
      latitude={Number(selectedBattle.coords.lat)}
      className={clsx(disabled && "is-zooming")}
      onClose={onClose}
      closeButton={false}
    >
      <h3 className="text-lg font-semibold">{selectedBattle.name}</h3>

      <p>Year: {selectedBattle.year}</p>
      <p>Country: {selectedBattle.country}</p>
      <p>Place: {selectedBattle.place}</p>
      <p>War: {selectedBattle.war}</p>

      <hr className="my-2 border-stone-300" />

      <a className="text-blue-700" target="_new" href={selectedBattle.article}>
        Wikipedia
      </a>
    </Popup>
  );
}
