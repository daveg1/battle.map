import { QuestionMarkCircleIcon } from "@heroicons/react/16/solid";
import { useRef } from "react";
import { useControl } from "react-map-gl/maplibre";
import { ControlPortal, CustomControl } from "./control-base";

interface Props {
  onShowSplash(): void;
}

export function SplashControl({ onShowSplash }: Props) {
  const controlRef = useRef<CustomControl | null>(null);
  const control = useControl<CustomControl>(
    () => {
      const nextControl = new CustomControl();
      controlRef.current = nextControl;
      return nextControl;
    },
    { position: "bottom-right" },
  );

  return (
    <ControlPortal control={control ?? controlRef.current}>
      <button
        type="button"
        className="grid cursor-pointer place-items-center bg-white p-2 text-stone-900"
        aria-label="Show help"
        title="Show help"
        onClick={onShowSplash}
      >
        <QuestionMarkCircleIcon className="size-4" />
      </button>
    </ControlPortal>
  );
}
