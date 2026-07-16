import { RangeSlider } from "./forms/range-slider";

export function ControlPanel() {
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

        <p>- or -</p>

        <button className="w-full cursor-pointer rounded-lg bg-stone-700 py-2 hover:bg-stone-700/50">
          Click to drop pin
        </button>
      </section>

      <hr className="border-stone-700" />

      <section>
        <RangeSlider label="Radius (km)" onChange={() => void 0} />
      </section>

      <hr className="border-stone-700" />

      <section>
        <button className="w-full cursor-pointer rounded-lg bg-red-900 py-2 hover:bg-red-900/50">
          Search
        </button>
      </section>
    </div>
  );
}
