import * as turf from "@turf/turf";
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
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
  const radiusPoint = useMapStore((state) => state.radiusPoint);
  const radiusSize = useMapStore((state) => state.radiusSize);
  const setRadiusPoint = useMapStore((state) => state.setRadiusPoint);
  const setRadiusSize = useMapStore((state) => state.setRadiusSize);
  const initializeRadiusState = useMapStore(
    (state) => state.initializeRadiusState,
  );

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
    radiusPoint,
    radiusSize,
    setRadiusPoint,
    setRadiusSize,
    fitRadiusToScreen,
  };
}
