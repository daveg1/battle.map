import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { Popover } from "radix-ui";
import { useRef } from "react";
import type { RefObject } from "react";
import { useControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { ControlPanelPlaceSearch } from "../panel/panel-place-search";
import { ControlPortal, CustomControl } from "./control-base";

interface Props {
  mapRef: RefObject<MapRef | null>;
}

export function SearchControl({ mapRef }: Props) {
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
      <Popover.Root modal={false}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="grid cursor-pointer place-items-center bg-white p-2 text-stone-900"
            aria-label="Open search"
            title="Open search"
          >
            <MagnifyingGlassIcon className="size-4" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="left"
            align="start"
            sideOffset={6}
            className="z-30 w-80 rounded border border-stone-700 bg-stone-800 p-3 text-white shadow-lg"
          >
            <ControlPanelPlaceSearch mapRef={mapRef} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </ControlPortal>
  );
}
