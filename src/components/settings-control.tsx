import { Cog6ToothIcon } from "@heroicons/react/16/solid";
import { useRef } from "react";
import { useControl } from "react-map-gl/maplibre";
import { ControlPortal, CustomControl } from "./custom-control";

interface Props {
  onOpen?: () => void;
}

export function SettingsControl({ onOpen }: Props) {
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
        className="grid cursor-pointer place-items-center bg-white p-2 text-stone-900"
        onClick={onOpen}
        aria-label="Open settings"
        title="Open settings"
      >
        <Cog6ToothIcon className="size-4" />
      </button>
    </ControlPortal>
  );
}
