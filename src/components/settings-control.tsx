import { Cog6ToothIcon, MoonIcon, SunIcon } from "@heroicons/react/16/solid";
import { DropdownMenu } from "radix-ui";
import { useRef } from "react";
import { useControl } from "react-map-gl/maplibre";
import type { SessionMapLayer } from "../types/viewer-state";
import { ControlPortal, CustomControl } from "./custom-control";

interface Props {
  mapSource: SessionMapLayer;
  onToggleMapSource(): void;
}

export function SettingsControl({ mapSource, onToggleMapSource }: Props) {
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
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="grid cursor-pointer place-items-center bg-white p-2 text-stone-900"
            aria-label="Open settings"
            title="Open settings"
          >
            <Cog6ToothIcon className="size-4" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="left"
            align="start"
            sideOffset={6}
            className="z-30 min-w-44 rounded border border-stone-700 bg-stone-800 p-1 shadow-lg"
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-1.5 text-sm text-stone-100 outline-none hover:bg-stone-700/70 focus:bg-stone-700/70"
              onSelect={onToggleMapSource}
            >
              <span>Toggle theme</span>

              {mapSource === "positron" ? (
                <MoonIcon className="size-4 shrink-0" />
              ) : (
                <SunIcon className="size-4 shrink-0" />
              )}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </ControlPortal>
  );
}
