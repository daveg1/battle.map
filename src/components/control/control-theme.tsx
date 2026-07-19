import clsx from "clsx";
import { MoonIcon, SunIcon } from "@heroicons/react/16/solid";
import { useRef } from "react";
import { useControl } from "react-map-gl/maplibre";
import type { MapSourceType } from "../map/map-source";
import { ControlPortal, CustomControl } from "./control-base";

interface Props {
  source: MapSourceType;
  onToggle: () => void;
}

export function ThemeControl({ source, onToggle }: Props) {
  const controlRef = useRef<CustomControl | null>(null);
  const control = useControl<CustomControl>(
    () => {
      const nextControl = new CustomControl();
      controlRef.current = nextControl;
      return nextControl;
    },
    { position: "top-right" },
  );

  const toggleToDark = source === "positron";

  return (
    <ControlPortal control={control ?? controlRef.current}>
      <button
        type="button"
        className={clsx(
          "grid cursor-pointer place-items-center bg-white p-2 text-stone-900",
        )}
        onClick={onToggle}
        aria-label={
          toggleToDark ? "Switch to Dark Matter" : "Switch to Positron"
        }
        title={toggleToDark ? "Switch to Dark Matter" : "Switch to Positron"}
      >
        {toggleToDark && <MoonIcon className="size-4" />}
        {!toggleToDark && <SunIcon className="size-4" />}
      </button>
    </ControlPortal>
  );
}
