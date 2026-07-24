import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { SavedPinItem } from "../../types/common";

interface Props {
  savedPins: SavedPinItem[];
  recentlyAddedPinId: string | null;
  recentlyRemovedPinId: string | null;
  onRemoveSavedPin(id: string): void;
  onSelectSavedPin(id: string): void;
}

export function ControlPanelSavedPins({
  savedPins,
  recentlyAddedPinId,
  recentlyRemovedPinId,
  onRemoveSavedPin,
  onSelectSavedPin,
}: Props) {
  const [revealedPinId, setRevealedPinId] = useState<string | null>(null);

  useEffect(() => {
    if (!recentlyAddedPinId) {
      setRevealedPinId(null);
      return;
    }

    setRevealedPinId(null);
    const frameId = window.requestAnimationFrame(() => {
      setRevealedPinId(recentlyAddedPinId);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [recentlyAddedPinId]);

  return (
    <div className="mt-3 flex max-h-full min-h-0 flex-col overflow-y-auto">
      {savedPins.length === 0 && (
        <p className="px-3 py-2 text-sm text-stone-300">No saved pins yet.</p>
      )}

      {savedPins.map((pin) => (
        <div
          key={pin.id}
          className={clsx(
            "group cursor-pointer rounded px-3 py-2 select-none hover:bg-stone-700/40",
            "transition-opacity duration-300",
            (pin.id === recentlyAddedPinId && pin.id !== revealedPinId) ||
              pin.id === recentlyRemovedPinId
              ? "opacity-0"
              : "opacity-100",
          )}
          onClick={() => onSelectSavedPin(pin.id)}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{pin.title}</p>
              <p className="text-xs text-stone-300">{pin.location}</p>
            </div>

            <button
              type="button"
              className="cursor-pointer rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-stone-600/60"
              aria-label="Remove saved pin"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveSavedPin(pin.id);
              }}
            >
              <XMarkIcon className="size-5 text-stone-300" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
