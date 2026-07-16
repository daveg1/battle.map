import { useState } from "react";

interface Props {
  label: string;
  onChange: (value: number) => void;
}

export function RangeSlider({ label, onChange }: Props) {
  const [value, setValue] = useState(100);

  function handleUpdate(
    event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) {
    setValue(event.target.valueAsNumber);
    onChange(event.target.valueAsNumber);
  }

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h3>{label}</h3>

        <input
          type="number"
          className="w-16 rounded bg-stone-700 px-2 py-1"
          value={value}
          onChange={handleUpdate}
        />
      </div>

      <input
        type="range"
        className="mt-2 w-full"
        min={1}
        max={1000}
        value={value}
        onChange={handleUpdate}
      />
    </>
  );
}
