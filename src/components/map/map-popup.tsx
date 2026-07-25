import { Popup } from "react-map-gl/maplibre";
import type { BattleMarkerItem } from "../../types/common";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import { MapArticlePreview } from "./map-article-preview";
import { TextTooltip } from "../ui/text-tooltip";
import { SelectableList } from "../ui/selectable-list";
import { useArticlePreviewMediaRow } from "../../hooks/use-article-preview";
import { useIsMobile } from "../../hooks/use-is-mobile";

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
  const isMobile = useIsMobile();
  const [battleIndex, setBattleIndex] = useState(0);
  const battles = selectedMarker?.battles ?? [];
  const battleCount = battles.length;
  const clampedBattleIndex = Math.min(
    battleIndex,
    Math.max(0, battleCount - 1),
  );
  const currentBattle = battles[clampedBattleIndex];
  const { shouldShowMediaRow } = useArticlePreviewMediaRow(
    battles.map((battle) => battle.article),
  );

  useEffect(() => {
    setBattleIndex(0);
  }, [selectedMarker?.id]);

  if (!selectedMarker || battleCount === 0 || !currentBattle) {
    return null;
  }

  return (
    <Popup
      anchor="bottom"
      longitude={Number(selectedMarker.coords.lng)}
      latitude={Number(selectedMarker.coords.lat)}
      className={clsx(
        disabled && "is-zooming",
        isMobile && "fullscreen-mobile-popup",
        isMobile && battleCount > 1 && "fullscreen-mobile-popup-wide",
      )}
      maxWidth="none"
      offset={24}
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      focusAfterOpen={false}
    >
      <div
        className={clsx(
          "flex flex-col gap-3",
          isMobile
            ? "h-full w-full p-4"
            : clsx("max-w-[84vw]", battleCount > 1 ? "w-136" : "w-70"),
        )}
      >
        <div
          className={clsx(
            "flex min-h-0 gap-3",
            isMobile &&
              (battleCount > 1 ? "h-full flex-row" : "h-full flex-col"),
          )}
        >
          {battleCount > 1 && (
            <aside className={clsx("w-42 shrink-0", isMobile && "min-h-0")}>
              <SelectableList
                items={battles}
                selectedIndex={clampedBattleIndex}
                onSelectedIndexChange={setBattleIndex}
                getItemKey={(battle, index) =>
                  `${battle.name}-${battle.year}-${index}`
                }
                className={clsx(
                  "space-y-1 overflow-y-auto",
                  isMobile && battleCount > 1
                    ? "max-h-full pr-1"
                    : isMobile
                      ? "max-h-32"
                      : "max-h-85 pr-1",
                )}
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

          <div
            className={clsx(
              "flex min-w-0 flex-1 flex-col gap-2",
              isMobile ? "overflow-y-auto" : "justify-end",
            )}
          >
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
              <span className="min-w-0 wrap-break-word">
                {currentBattle.year}
              </span>

              <span className="font-semibold">Location</span>
              <span className="min-w-0 wrap-break-word">
                {currentBattle.place}, {currentBattle.country}
              </span>

              <span className="font-semibold">War</span>
              <span className="min-w-0 wrap-break-word">
                {currentBattle.war}
              </span>
            </div>

            <a
              className="text-sm text-blue-700"
              target="_new"
              href={currentBattle.article}
            >
              Wikipedia
            </a>

            <MapArticlePreview
              articleTitle={currentBattle.article}
              showMediaRow={shouldShowMediaRow}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </Popup>
  );
}
