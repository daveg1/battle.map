import { Popup } from "react-map-gl/maplibre";
import type { BattleMarkerItem } from "../types/common";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface Props {
  selectedMarker: BattleMarkerItem | null;
  disabled: boolean;
  onClose: () => void;
}

export function MapPopup({ disabled, selectedMarker, onClose }: Props) {
  if (!selectedMarker) return;

  const [battleIndex, setBattleIndex] = useState(0);
  const battleCount = selectedMarker.battles.length;
  const currentBattle = selectedMarker.battles[battleIndex];

  useEffect(() => {
    setBattleIndex(0);
  }, [selectedMarker]);

  function handlePrev() {
    setBattleIndex((current) => Math.max(0, current - 1));
  }

  function handleNext() {
    setBattleIndex((current) => Math.min(battleCount - 1, current + 1));
  }

  return (
    <Popup
      anchor="top"
      longitude={Number(selectedMarker.coords.lng)}
      latitude={Number(selectedMarker.coords.lat)}
      className={clsx(disabled && "is-zooming")}
      maxWidth="none"
      onClose={onClose}
      closeButton={false}
    >
      <div className="flex w-70 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="min-w-0 truncate text-lg font-semibold"
            title={currentBattle.name}
          >
            {currentBattle.name}
          </h3>
          {battleCount > 1 && (
            <span className="shrink-0 text-xs whitespace-nowrap text-stone-500">
              {battleIndex + 1} / {battleCount}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          <span className="font-semibold">Year</span>
          <span className="min-w-0 wrap-break-word">{currentBattle.year}</span>

          <span className="font-semibold">Location</span>
          <span className="min-w-0 wrap-break-word">
            {currentBattle.place}, {currentBattle.country}
          </span>

          <span className="font-semibold">War</span>
          <span className="min-w-0 wrap-break-word">{currentBattle.war}</span>
        </div>

        <a
          className="text-sm text-blue-700"
          target="_new"
          href={currentBattle.article}
        >
          Wikipedia
        </a>

        {battleCount > 1 && (
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              className="cursor-pointer rounded bg-stone-200 px-2 py-1 text-sm enabled:hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={battleIndex === 0}
              onClick={handlePrev}
            >
              Prev
            </button>

            <button
              type="button"
              className="ml-auto cursor-pointer rounded bg-stone-200 px-2 py-1 text-sm enabled:hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={battleIndex === battleCount - 1}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Popup>
  );
}
