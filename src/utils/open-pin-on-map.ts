import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { Point } from "../types/common";

interface OpenPinOnMapParams {
  minZoom: number;
  duration: number;
  verticalOffsetRatio: number;
}

const DEFAULT_DURATION_MS = 600;
const DEFAULT_VERTICAL_OFFSET_RATIO = 0.15;

export function openPinOnMap(
  mapRef: RefObject<MapRef | null>,
  point: Point,
  options?: Partial<OpenPinOnMapParams>,
) {
  const {
    minZoom,
    duration = DEFAULT_DURATION_MS,
    verticalOffsetRatio = DEFAULT_VERTICAL_OFFSET_RATIO,
  } = options ?? {};

  const map = mapRef.current;
  if (!map) return;

  const currentZoom = map.getZoom();
  const { height } = map.getContainer().getBoundingClientRect();
  const clampedOffsetRatio = Math.max(0, Math.min(verticalOffsetRatio, 1));
  const offsetY = Math.min(height * clampedOffsetRatio, height / 2);

  map.easeTo({
    center: [point.lng, point.lat],
    offset: [0, offsetY],
    ...(typeof minZoom === "number"
      ? { zoom: Math.max(currentZoom, minZoom) }
      : {}),
    duration,
  });
}
