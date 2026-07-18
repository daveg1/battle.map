import type { ChangeEvent } from "react";

interface Props {
  radius: number;
  hasRadius: boolean;
  onSearch(radius: number): void;
  onClear(): void;
}

export function ControlPanelRadiusForm({
  radius,
  hasRadius,
  onSearch,
  onClear,
}: Props) {
  function handleRadiusUpdate(event: ChangeEvent<HTMLInputElement>) {
    onSearch(event.target.valueAsNumber);
  }

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm">Radius (km)</h4>

        <input
          type="number"
          className="w-16 rounded bg-stone-700 px-2 py-1"
          value={radius}
          onChange={handleRadiusUpdate}
        />
      </div>

      <input
        type="range"
        className="mt-2 w-full"
        min={1}
        max={1000}
        value={radius}
        onChange={handleRadiusUpdate}
      />

      <button
        type="button"
        className="w-full cursor-pointer rounded-lg bg-stone-700 py-2 enabled:hover:bg-stone-700/50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasRadius}
        onClick={onClear}
      >
        Clear radius
      </button>
    </>
  );
}
