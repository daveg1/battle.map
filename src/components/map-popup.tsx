import { Popup } from "react-map-gl/maplibre";
import type { BattleItem } from "../types/battle";

interface Props {
  selectedBattle: BattleItem | null;
  onClose: () => void;
}

export function MapPopup({ selectedBattle, onClose }: Props) {
  if (!selectedBattle) return;

  return (
    <Popup
      anchor="top"
      longitude={Number(selectedBattle.coords.lng)}
      latitude={Number(selectedBattle.coords.lat)}
      onClose={onClose}
    >
      <div>
        <h3 className="text-lg font-semibold">{selectedBattle.name}</h3>

        <p>Year: {selectedBattle.year}</p>
        <p>Country: {selectedBattle.country}</p>
        <p>Place: {selectedBattle.place}</p>
        <p>War: {selectedBattle.war}</p>

        <hr className="my-2 border-stone-300" />

        <a
          className="text-blue-700"
          target="_new"
          href={selectedBattle.article}
        >
          Wikipedia
        </a>
      </div>
    </Popup>
  );
}
