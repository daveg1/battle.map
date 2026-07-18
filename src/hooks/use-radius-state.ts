import * as turf from "@turf/turf";
import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { SessionRadiusState } from "../session/map-session";
import type { Point } from "../types/common";

interface Props {
  mapRef: RefObject<MapRef | null>;
  initialRadiusState: SessionRadiusState;
  saveRadiusSessionState(radius: SessionRadiusState): void;
}

export function useRadiusState({
  mapRef,
  initialRadiusState,
  saveRadiusSessionState,
}: Props) {
  const [radiusPoint, setRadiusPoint] = useState<Point | null>(
    initialRadiusState.point,
  );
  const [radiusSize, setRadiusSize] = useState<number>(initialRadiusState.size);

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
    saveRadiusSessionState({
      point: radiusPoint,
      size: radiusSize,
    });
  }, [radiusPoint, radiusSize, saveRadiusSessionState]);

  return {
    radiusPoint,
    radiusSize,
    setRadiusPoint,
    setRadiusSize,
    fitRadiusToScreen,
  };
}
