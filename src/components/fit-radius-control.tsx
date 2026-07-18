import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { useControl } from "react-map-gl/maplibre";
import { ControlPortal, CustomControl } from "./custom-control";

interface Props {
  disabled: boolean;
  onFit(): void;
}

export function FitRadiusControl({ disabled, onFit }: Props) {
  const controlRef = useRef<CustomControl | null>(null);
  const control = useControl<CustomControl>(
    () => {
      const nextControl = new CustomControl();
      controlRef.current = nextControl;
      return nextControl;
    },
    { position: "top-right" },
  );

  return (
    <ControlPortal control={control ?? controlRef.current}>
      <button
        type="button"
        className="grid cursor-pointer place-items-center bg-white p-2 text-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onFit}
        disabled={disabled}
        aria-label="Fit radius to screen"
        title="Fit radius to screen (Alt+Enter)"
      >
        <ArrowsPointingOutIcon className="size-4" />
      </button>
    </ControlPortal>
  );
}
