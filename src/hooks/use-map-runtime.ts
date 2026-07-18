import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import {
  BATTLE_CLUSTER_COUNT_LAYER_ID,
  BATTLE_CLUSTER_LAYER_ID,
  BATTLE_PIN_IMAGE_ID,
  BATTLE_UNCLUSTERED_LAYER_ID,
} from "../components/map-battle-pins";
import type { MapSourceType } from "../components/map-source";
import type { BattleMarkerItem, Point } from "../types/common";
import { useMapStore } from "../stores/use-map-store";

interface Props {
  mapRef: RefObject<MapRef | null>;
  initialLayer: MapSourceType;
  saveLayerSessionState(layer: MapSourceType): void;
  visibleMarkers: BattleMarkerItem[];
  radiusPoint: Point | null;
  fitRadiusToScreen(): void;
}

export function useMapRuntime({
  mapRef,
  initialLayer,
  saveLayerSessionState,
  visibleMarkers,
  radiusPoint,
  fitRadiusToScreen,
}: Props) {
  const mapSource = useMapStore((state) => state.mapSource);
  const initializeMapSource = useMapStore((state) => state.initializeMapSource);
  const toggleMapSource = useMapStore((state) => state.toggleMapSource);
  const setSelectedMarker = useMapStore((state) => state.setSelectedMarker);

  const hasInitializedMapSource = useRef(false);

  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (!hasInitializedMapSource.current) {
      return;
    }

    saveLayerSessionState(mapSource);
  }, [mapSource, saveLayerSessionState]);

  useEffect(() => {
    if (hasInitializedMapSource.current) {
      return;
    }

    initializeMapSource(initialLayer);
    hasInitializedMapSource.current = true;
  }, [initialLayer, initializeMapSource]);

  // Toggles the basemap between light and dark variants.
  function handleToggleMapSource() {
    toggleMapSource();
  }

  // Performs one-time map setup (attribution behavior, marker icon load, and initial radius fit).
  function handleMapLoad() {
    const map = mapRef.current;
    if (!map) return;

    const collapseAttribution = () => {
      const attribution = map
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib.maplibregl-compact-show");
      if (attribution) {
        attribution.classList.remove("maplibregl-compact-show");
      }
    };
    collapseAttribution();
    requestAnimationFrame(collapseAttribution);

    if (map.hasImage(BATTLE_PIN_IMAGE_ID)) return;

    const markerImage = new Image();
    markerImage.onload = () => {
      const loadedMap = mapRef.current;
      if (!loadedMap || loadedMap.hasImage(BATTLE_PIN_IMAGE_ID)) return;
      loadedMap.addImage(BATTLE_PIN_IMAGE_ID, markerImage, {
        pixelRatio: 2,
      });
    };
    markerImage.src = "/battlepin.png";

    if (radiusPoint) {
      requestAnimationFrame(fitRadiusToScreen);
    }
  }

  // Handles clicking battle markers/clusters to select a marker or zoom into a cluster.
  function handleMapClick(event: MapLayerMouseEvent) {
    const clickedFeature = event.features?.[0];
    if (!clickedFeature) return;

    if (clickedFeature.layer.id === BATTLE_UNCLUSTERED_LAYER_ID) {
      const markerIndex = Number(clickedFeature.properties?.markerIndex);
      if (Number.isNaN(markerIndex)) return;

      const selected = visibleMarkers[markerIndex];
      if (selected) {
        setSelectedMarker(selected);

        const map = mapRef.current;
        if (map) {
          map.easeTo({
            center: [selected.coords.lng, selected.coords.lat],
            duration: 600,
          });
        }
      }
      return;
    }

    if (
      [BATTLE_CLUSTER_LAYER_ID, BATTLE_CLUSTER_COUNT_LAYER_ID].includes(
        clickedFeature.layer.id,
      )
    ) {
      const map = event.target as {
        getZoom?: () => number;
        easeTo?: (options: { center: [number, number]; zoom: number }) => void;
      };

      if (!map.getZoom || !map.easeTo) {
        return;
      }

      map.easeTo({
        center: [event.lngLat.lng, event.lngLat.lat],
        zoom: map.getZoom() + 2,
      });
    }
  }

  return {
    mapSource,
    isZooming,
    setIsZooming,
    handleToggleMapSource,
    handleMapLoad,
    handleMapClick,
  };
}
