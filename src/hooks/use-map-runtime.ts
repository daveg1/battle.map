import { useState } from "react";
import type { RefObject } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import {
  BATTLE_CLUSTER_COUNT_LAYER_ID,
  BATTLE_CLUSTER_LAYER_ID,
  BATTLE_PIN_IMAGE_ID,
  BATTLE_UNCLUSTERED_LAYER_ID,
} from "../components/map/map-battle-pins";
import type { BattleMarkerItem } from "../types/common";
import type { SessionRadiusState } from "../types/viewer-state";
import { useMapStore } from "../stores/use-map-store";
import { useUserSettingsStore } from "../stores/use-user-settings-store";
import { openPinOnMap } from "../utils/open-pin-on-map";

interface Props {
  mapRef: RefObject<MapRef | null>;
  visibleMarkers: BattleMarkerItem[];
  radius: SessionRadiusState;
  fitRadiusToScreen(): void;
}

export function useMapRuntime({
  mapRef,
  visibleMarkers,
  radius,
  fitRadiusToScreen,
}: Props) {
  const setSelectedMarker = useMapStore((state) => state.setSelectedMarker);
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);
  const mapSource = useUserSettingsStore((state) => state.mapSource);
  const toggleMapSource = useUserSettingsStore(
    (state) => state.toggleMapSource,
  );

  const [isZooming, setIsZooming] = useState(false);

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

    if (radius.point) {
      requestAnimationFrame(fitRadiusToScreen);
    }
  }

  // Handles clicking battle markers/clusters to select a marker or zoom into a cluster.
  function handleMapClick(event: MapLayerMouseEvent) {
    if (event.originalEvent.altKey) {
      return;
    }

    const clickedFeature = event.features?.[0];
    if (!clickedFeature) {
      clearSelectedMarker();
      return;
    }

    if (clickedFeature.layer.id === BATTLE_UNCLUSTERED_LAYER_ID) {
      const markerIndex = Number(clickedFeature.properties?.markerIndex);
      if (Number.isNaN(markerIndex)) return;

      const selected = visibleMarkers[markerIndex];
      if (selected) {
        setSelectedMarker(selected);

        openPinOnMap(mapRef, selected.coords);
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
