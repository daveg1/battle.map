import { RangeSlider } from "./forms/range-slider";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { SavedPinItem } from "../types/common";

interface Props {
  radius: number;
  hasRadius: boolean;
  savedPins: SavedPinItem[];
  onSearch(radius: number): void;
  onClear(): void;
  onRemoveSavedPin(id: string): void;
}

export function ControlPanel({
  radius,
  hasRadius,
  savedPins,
  onSearch,
  onClear,
  onRemoveSavedPin,
}: Props) {
  return (
    <div className="flex h-screen w-100 flex-col gap-8 bg-stone-800 p-4 text-white">
      <h2 className="text-xl">Search for battles</h2>

      <section className="flex flex-col gap-2">
        <label className="flex flex-col gap-2">
          <span>Place [todo]</span>
          <input
            disabled
            type="search"
            className="rounded bg-stone-700 px-2 py-1"
            placeholder="Search placename"
          />
        </label>
      </section>

      <hr className="border-stone-700" />

      <section>
        <RangeSlider label="Radius (km)" value={radius} onChange={onSearch} />
      </section>

      <section>
        <button
          type="button"
          className="w-full cursor-pointer rounded-lg bg-stone-700 py-2 enabled:hover:bg-stone-700/50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasRadius}
          onClick={onClear}
        >
          Clear radius
        </button>
      </section>

      <hr className="border-stone-700" />

      <section className="flex min-h-0 flex-1 flex-col">
        <h3 className="text-lg">Saved pins</h3>

        <div className="mt-3 flex max-h-full min-h-0 flex-col overflow-y-auto rounded border border-stone-700 bg-stone-900/40">
          {savedPins.length === 0 && (
            <p className="px-3 py-2 text-sm text-stone-300">
              No saved pins yet.
            </p>
          )}

          {savedPins.map((pin) => (
            <div
              key={pin.id}
              className="group cursor-pointer px-3 py-2 select-none hover:bg-stone-700/40"
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
      </section>
    </div>
  );
}
