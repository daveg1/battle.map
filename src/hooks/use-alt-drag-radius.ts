import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { Point } from "../types/common";

const RADIUS_MIN_KM = 1;
const RADIUS_MAX_KM = 1000;
const ALT_DRAG_PIXELS_PER_STEP = 8;
const ALT_DRAG_BASE_RADIUS_STEP_KM = 10;
const ALT_DRAG_MIN_RADIUS_STEP_KM = 2;
const ALT_DRAG_MAX_RADIUS_STEP_KM = 40;
const ZOOM_REFERENCE_LEVEL = 12;
const ZOOM_SCALE_SPAN = 4;

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
      startX: event.point.x,
      startRadius: radiusSize,
    };
  }

  function handleMapMouseMove(event: MapLayerMouseEvent) {
    const dragState = radiusDragState.current;
    if (!dragState.isPointerDown || !event.originalEvent.altKey) return;

    const deltaX = event.point.x - dragState.startX;
    event.preventDefault();

    const stepDelta = Math.round(deltaX / ALT_DRAG_PIXELS_PER_STEP);
    const radiusStepKm = getRadiusStepForZoom(getMapZoom(event));
    const nextRadius = Math.min(
      RADIUS_MAX_KM,
      Math.max(
        RADIUS_MIN_KM,
        dragState.startRadius + stepDelta * radiusStepKm,
      ),
    );

    setRadiusSize((current) => (current === nextRadius ? current : nextRadius));
  }

  function resetAltDragState() {
    radiusDragState.current.isPointerDown = false;
  }

  function getMapZoom(event: MapLayerMouseEvent) {
    const target = event.target as { getZoom?: () => number };
    if (typeof target.getZoom === "function") {
      return target.getZoom();
    }

    return ZOOM_REFERENCE_LEVEL;
  }

  function getRadiusStepForZoom(zoom: number) {
    const zoomAdjustedStep =
      ALT_DRAG_BASE_RADIUS_STEP_KM *
      2 ** ((ZOOM_REFERENCE_LEVEL - zoom) / ZOOM_SCALE_SPAN);

    return Math.min(
      ALT_DRAG_MAX_RADIUS_STEP_KM,
      Math.max(ALT_DRAG_MIN_RADIUS_STEP_KM, Math.round(zoomAdjustedStep)),
    );
  }

  return {
    isAltPressed,
    handleMapMouseDown,
    handleMapMouseMove,
    resetAltDragState,
  };
}
