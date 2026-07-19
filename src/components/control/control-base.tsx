import type { IControl, Map as MaplibreMap } from "maplibre-gl";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export class CustomControl implements IControl {
  private readonly container: HTMLDivElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.container.style.overflow = "hidden";
    this.container.style.borderRadius = "0.25rem";
  }

  onAdd(_map: MaplibreMap) {
    return this.container;
  }

  onRemove() {
    this.container.remove();
  }

  getContainer() {
    return this.container;
  }
}

interface ControlPortalProps {
  control: CustomControl | null;
  children: ReactNode;
}

export function ControlPortal({ control, children }: ControlPortalProps) {
  if (!control) {
    return null;
  }

  return createPortal(children, control.getContainer());
}
