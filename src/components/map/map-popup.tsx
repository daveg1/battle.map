import { Popup } from "react-map-gl/maplibre";
import type { BattleMarkerItem } from "../../types/common";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import { MapArticlePreview } from "./map-article-preview";
import { TextTooltip } from "../ui/text-tooltip";
import { SelectableList } from "../ui/selectable-list";

interface Props {
  selectedMarker: BattleMarkerItem | null;
  isSaved: boolean;
  onToggleSave: (marker: BattleMarkerItem) => void;
  disabled: boolean;
  onClose: () => void;
}

export function MapPopup({
  disabled,
  selectedMarker,
  isSaved,
  onToggleSave,
  onClose,
}: Props) {
  if (!selectedMarker) return null;

  const [battleIndex, setBattleIndex] = useState(0);
  const battleCount = selectedMarker.battles.length;
  if (battleCount === 0) return null;

  const clampedBattleIndex = Math.min(battleIndex, battleCount - 1);
  const currentBattle = selectedMarker.battles[clampedBattleIndex];

  useEffect(() => {
    setBattleIndex(0);
  }, [selectedMarker.id]);

  return (
    <Popup
      anchor="bottom"
      longitude={Number(selectedMarker.coords.lng)}
      latitude={Number(selectedMarker.coords.lat)}
      className={clsx(disabled && "is-zooming")}
      maxWidth="none"
      offset={24}
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      focusAfterOpen={false}
    >
      <div
        className={clsx(
          "flex max-w-[84vw] flex-col gap-3",
          battleCount > 1 ? "w-136" : "w-70",
        )}
      >
        <div className="flex min-h-0 gap-3">
          {battleCount > 1 && (
            <aside className="w-42 shrink-0">
              <SelectableList
                items={selectedMarker.battles}
                selectedIndex={clampedBattleIndex}
                onSelectedIndexChange={setBattleIndex}
                getItemKey={(battle, index) =>
                  `${battle.name}-${battle.year}-${index}`
                }
                className="max-h-85 space-y-1 overflow-y-auto pr-1"
                itemClassName={({ isSelected }) =>
                  clsx(
                    "w-full rounded border px-2 py-1.5 text-left",
                    isSelected
                      ? "border-stone-400 bg-stone-200 text-stone-900"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100",
                  )
                }
              >
                {({ item: battle }) => (
                  <>
                    <p className="text-xs font-semibold">{battle.year}</p>
                    <p className="truncate text-xs">{battle.name}</p>
                    <p className="truncate text-[11px] text-stone-500">
                      {battle.war}
                    </p>
                  </>
                )}
              </SelectableList>
            </aside>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-end gap-2">
            <div className="flex items-center justify-between gap-2">
              <TextTooltip
                as="h3"
                text={currentBattle.name}
                className="min-w-0 truncate text-lg font-semibold"
              />
              <button
                type="button"
                className="shrink-0 cursor-pointer rounded bg-stone-200 p-1.5 text-sm enabled:hover:bg-stone-300"
                aria-label="Save pin"
                title={isSaved ? "Unsave pin" : "Save pin"}
                onClick={() => onToggleSave(selectedMarker)}
              >
                {!isSaved && <BookmarkOutlineIcon className="size-4" />}
                {isSaved && <BookmarkSolidIcon className="size-4" />}
              </button>
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

            <MapArticlePreview articleTitle={currentBattle.article} />
          </div>
        </div>
      </div>
    </Popup>
  );
}
