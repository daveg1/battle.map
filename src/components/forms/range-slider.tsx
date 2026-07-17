interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function RangeSlider({ label, value, onChange }: Props) {
  function handleUpdate(
    event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) {
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
