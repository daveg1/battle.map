import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { Point } from "../types/common";

const RADIUS_MIN_KM = 1;
const RADIUS_MAX_KM = 1000;
const ALT_DRAG_THRESHOLD_PX = 12;
const ALT_DRAG_PIXELS_PER_STEP = 8;
const ALT_DRAG_RADIUS_STEP_KM = 10;

interface Props {
  radiusSize: number;
  setRadiusPoint: Dispatch<SetStateAction<Point | null>>;
  setRadiusSize: Dispatch<SetStateAction<number>>;
}

export function useAltDragRadius({
  radiusSize,
  setRadiusPoint,
  setRadiusSize,
}: Props) {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const radiusDragState = useRef({
    isPointerDown: false,
    isResizing: false,
    startX: 0,
    startRadius: 100,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey) {
        setIsAltPressed(true);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!event.altKey) {
        setIsAltPressed(false);
      }
    }

    function handleWindowBlur() {
      setIsAltPressed(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  function handleMapMouseDown(event: MapLayerMouseEvent) {
    if (!event.originalEvent.altKey) return;

    event.preventDefault();
    setRadiusPoint(event.lngLat);
    radiusDragState.current = {
      isPointerDown: true,
      isResizing: false,
      startX: event.point.x,
      startRadius: radiusSize,
    };
  }

  function handleMapMouseMove(event: MapLayerMouseEvent) {
    const dragState = radiusDragState.current;
    if (!dragState.isPointerDown || !event.originalEvent.altKey) return;

    const deltaX = event.point.x - dragState.startX;
    if (!dragState.isResizing && Math.abs(deltaX) < ALT_DRAG_THRESHOLD_PX) {
      return;
    }

    dragState.isResizing = true;
    event.preventDefault();

    const stepDelta = Math.round(deltaX / ALT_DRAG_PIXELS_PER_STEP);
    const nextRadius = Math.min(
      RADIUS_MAX_KM,
      Math.max(
        RADIUS_MIN_KM,
        dragState.startRadius + stepDelta * ALT_DRAG_RADIUS_STEP_KM,
      ),
    );

    setRadiusSize((current) => (current === nextRadius ? current : nextRadius));
  }

  function resetAltDragState() {
    radiusDragState.current.isPointerDown = false;
    radiusDragState.current.isResizing = false;
  }

  return {
    isAltPressed,
    handleMapMouseDown,
    handleMapMouseMove,
    resetAltDragState,
  };
}
