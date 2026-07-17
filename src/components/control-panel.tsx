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
  onSelectSavedPin(id: string): void;
}

export function ControlPanel({
  radius,
  hasRadius,
  savedPins,
  onSearch,
  onClear,
  onRemoveSavedPin,
  onSelectSavedPin,
}: Props) {
  return (
    <div className="flex h-screen w-100 flex-col gap-4 overflow-hidden bg-stone-800 p-4 text-white">
      <header className="relative">
        <img
          src="/arrow.png"
          alt="arrow"
          className="arrow-1 absolute bottom-2 left-2 w-18 select-none"
          draggable={false}
        />

        <img
          src="/arrow.png"
          alt="arrow"
          className="arrow-2 absolute bottom-4 left-3 w-18 select-none"
          draggable={false}
        />

        <h1
          className="nudge-title flex items-center justify-center gap-2 text-2xl font-semibold text-shadow-md"
          style={{ fontFamily: "AnironBold", letterSpacing: "-0.15em" }}
        >
          Battle Map
        </h1>
      </header>

      <section className="rounded-lg border border-stone-700 bg-stone-900/40 p-3">
        <h2 className="text-lg">Search</h2>
        <div className="mt-3 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm">Place [todo]</span>
            <input
              disabled
              type="search"
              className="rounded bg-stone-700 px-2 py-1"
              placeholder="Search placename"
            />
          </label>

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
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-stone-700 bg-stone-900/40 p-3">
        <h3 className="text-lg">Saved pins</h3>

        <div className="mt-3 flex max-h-full min-h-0 flex-col overflow-y-auto">
          {savedPins.length === 0 && (
            <p className="px-3 py-2 text-sm text-stone-300">
              No saved pins yet.
            </p>
          )}

          {savedPins.map((pin) => (
            <div
              key={pin.id}
              className="group cursor-pointer rounded px-3 py-2 select-none hover:bg-stone-700/40"
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
      </section>
    </div>
  );
}
