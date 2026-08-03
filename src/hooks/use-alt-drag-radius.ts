import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import {
  MAX_RADIUS_KM,
  MIN_RADIUS_KM,
  type SessionRadiusState,
} from "../types/viewer-state";

const ALT_DRAG_PIXELS_PER_STEP = 8;
const ALT_DRAG_BASE_RADIUS_STEP_KM = 10;
const ALT_DRAG_MIN_RADIUS_STEP_KM = 2;
const ALT_DRAG_MAX_RADIUS_STEP_KM = 40;
const ZOOM_REFERENCE_LEVEL = 12;
const ZOOM_SCALE_SPAN = 4;

interface Props {
  radiusSize: number;
  setRadius: Dispatch<SetStateAction<SessionRadiusState>>;
}

export function useAltDragRadius({
  radiusSize,
  setRadius,
}: Props) {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const radiusDragState = useRef({
    isPointerDown: false,
    startClientX: 0,
    startRadius: 100,
    getZoom: undefined as (() => number) | undefined,
  });

  useEffect(() => {
    function finishAltDrag() {
      if (!radiusDragState.current.isPointerDown) return;
      radiusDragState.current.isPointerDown = false;
    }

    function handleWindowMouseMove(event: MouseEvent) {
      const dragState = radiusDragState.current;
      if (!dragState.isPointerDown || !event.altKey) return;

      event.preventDefault();
      const deltaX = event.clientX - dragState.startClientX;
      const stepDelta = Math.round(deltaX / ALT_DRAG_PIXELS_PER_STEP);
      const radiusStepKm = getRadiusStepForZoom(dragState.getZoom?.());
      const nextRadius = Math.min(
        MAX_RADIUS_KM,
        Math.max(
          MIN_RADIUS_KM,
          dragState.startRadius + stepDelta * radiusStepKm,
        ),
      );

      setRadius((current) => {
        if (current.size === nextRadius) {
          return current;
        }
        return {
          ...current,
          size: nextRadius,
        };
      });
    }

    function handleWindowMouseUp() {
      finishAltDrag();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey) {
        setIsAltPressed(true);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!event.altKey) {
        setIsAltPressed(false);
        finishAltDrag();
      }
    }

    function handleWindowBlur() {
      setIsAltPressed(false);
      finishAltDrag();
    }

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [setRadius]);

  function handleMapMouseDown(event: MapLayerMouseEvent) {
    if (!event.originalEvent.altKey) return;

    event.preventDefault();
    setRadius((current) => ({
      ...current,
      point: event.lngLat,
    }));
    radiusDragState.current = {
      isPointerDown: true,
      startClientX: event.originalEvent.clientX,
      startRadius: radiusSize,
      getZoom: getMapZoomGetter(event),
    };
  }

  function getMapZoomGetter(event: MapLayerMouseEvent) {
    const target = event.target as { getZoom?: () => number };
    if (typeof target.getZoom === "function") {
      return target.getZoom.bind(target);
    }

    return undefined;
  }

  function getRadiusStepForZoom(zoom = ZOOM_REFERENCE_LEVEL) {
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
  };
}
