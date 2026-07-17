import { RangeSlider } from "./forms/range-slider";

interface Props {
  radius: number;
  onSearch(radius: number): void;
}

export function ControlPanel({ radius, onSearch }: Props) {
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
    </div>
  );
}
