import { RangeSlider } from "./forms/range-slider";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  radius: number;
  hasRadius: boolean;
  onSearch(radius: number): void;
  onClear(): void;
}

export function ControlPanel({ radius, hasRadius, onSearch, onClear }: Props) {
  const mockSavedPins = [
    { title: "Siege of Vienna area", location: "Vienna, Austria" },
    { title: "Prague campaign spot", location: "Prague, Czech Republic" },
    { title: "Kulm battle marker", location: "Kulm, Czech Republic" },
    { title: "Warsaw uprising marker", location: "Warsaw, Poland" },
    { title: "Copenhagen harbor cluster", location: "Copenhagen, Denmark" },
    { title: "Kharkov operations area", location: "Kharkiv, Ukraine" },
    { title: "Missolonghi sieges", location: "Missolonghi, Greece" },
    { title: "Limerick siege marker", location: "Limerick, Ireland" },
    { title: "Dublin uprising point", location: "Dublin, Ireland" },
    { title: "Cēsis / Wenden marker", location: "Cēsis, Latvia" },
    { title: "Gerona siege group", location: "Girona, Spain" },
  ];

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

        <div className="mt-3 flex min-h-0 max-h-full flex-col overflow-y-auto rounded border border-stone-700 bg-stone-900/40">
          {mockSavedPins.map((pin) => (
            <div
              key={pin.title}
              className="group cursor-pointer select-none px-3 py-2 hover:bg-stone-700/40"
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
