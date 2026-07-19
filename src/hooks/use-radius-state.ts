import * as turf from "@turf/turf";
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { Point } from "../types/common";
import type { SessionRadiusState } from "../types/viewer-state";
import { useMapStore } from "../stores/use-map-store";

interface Props {
  mapRef: RefObject<MapRef | null>;
  initialRadiusState: SessionRadiusState;
}

export function useRadiusState({
  mapRef,
  initialRadiusState,
}: Props) {
  const hasInitializedRadius = useRef(false);
  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);
  const initializeRadiusState = useMapStore(
    (state) => state.initializeRadiusState,
  );
  const radiusPoint = radius.point;
  const radiusSize = radius.size;
  const hasRadius = Boolean(radiusPoint);

  const setRadiusPoint = useCallback(
    (point: Point | null) => {
      setRadius((current) => ({
        ...current,
        point,
      }));
    },
    [setRadius],
  );

  const setRadiusSize = useCallback(
    (size: number) => {
      setRadius((current) => ({
        ...current,
        size,
      }));
    },
    [setRadius],
  );

  const clearRadius = useCallback(() => {
    setRadiusPoint(null);
  }, [setRadiusPoint]);

  const fitRadiusToScreen = useCallback(() => {
    if (!radiusPoint) {
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    const circle = turf.circle([radiusPoint.lng, radiusPoint.lat], radiusSize, {
      steps: 64,
      units: "kilometers",
    });
    const [minLng, minLat, maxLng, maxLat] = turf.bbox(circle);

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 40,
        duration: 600,
      },
    );
  }, [mapRef, radiusPoint, radiusSize]);

  useEffect(() => {
    if (hasInitializedRadius.current) {
      return;
    }

    initializeRadiusState(initialRadiusState);
    hasInitializedRadius.current = true;
  }, [initialRadiusState, initializeRadiusState]);

  return {
    radius,
    radiusPoint,
    radiusSize,
    hasRadius,
    setRadius,
    setRadiusPoint,
    setRadiusSize,
    clearRadius,
    fitRadiusToScreen,
  };
}
