import * as turf from "@turf/turf";
import {
  AttributionControl,
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { useCallback, type RefObject } from "react";
import { useAltDragRadius } from "../hooks/use-alt-drag-radius";
import { useBattleMarkers } from "../hooks/use-battle-markers";
import { useMapRuntime } from "../hooks/use-map-runtime";
import { useMapShortcuts } from "../hooks/use-map-shortcuts";
import { FitRadiusControl } from "./fit-radius-control";
import { MapSource } from "./map-source";
import { MapPopup } from "./map-popup";
import { MapRadius } from "./map-radius";
import { MapRadiusBlip } from "./map-radius-blip";
import { SettingsControl } from "./settings-control";
import {
  BATTLE_CLUSTER_COUNT_LAYER_ID,
  BATTLE_CLUSTER_LAYER_ID,
  BATTLE_UNCLUSTERED_LAYER_ID,
  MapBattlePins,
} from "./map-battle-pins";
import type { BattleMarkerItem } from "../types/common";
import { useMapStore } from "../stores/use-map-store";
import type { SessionMapLayer } from "../types/viewer-state";
import { useScreenSize } from "../hooks/use-screen-size";

interface MoveEndEvent {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

interface Props {
  mapRef: RefObject<MapRef | null>;
  initialMapViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  initialLayer: SessionMapLayer;
  saveLayerSessionState(layer: SessionMapLayer): void;
  onMoveEnd(event: MoveEndEvent): void;
  onToggleSave(marker: BattleMarkerItem): void;
}

export function MapView({
  mapRef,
  initialMapViewState,
  initialLayer,
  saveLayerSessionState,
  onMoveEnd,
  onToggleSave,
}: Props) {
  const { width, height } = useScreenSize();

  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);
  const savedPins = useMapStore((state) => state.savedPins);
  const selectedMarker = useMapStore((state) => state.selectedMarker);
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);

  const fitRadiusToScreen = useCallback(() => {
    if (!radius.point) {
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    const circle = turf.circle([radius.point.lng, radius.point.lat], radius.size, {
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
  }, [mapRef, radius]);

  const { isAltPressed, handleMapMouseDown } = useAltDragRadius({
    radiusSize: radius.size,
    setRadius,
  });

  const [visibleMarkers] = useBattleMarkers({ radius, savedPins });

  const {
    mapSource,
    isZooming,
    setIsZooming,
    handleToggleMapSource,
    handleMapLoad,
    handleMapClick,
  } = useMapRuntime({
    mapRef,
    initialLayer,
    saveLayerSessionState,
    visibleMarkers,
    radius,
    fitRadiusToScreen,
  });

  useMapShortcuts({
    hasRadius: Boolean(radius.point),
    onFitRadius: fitRadiusToScreen,
  });

  return (
    <Map
      ref={mapRef}
      interactive={true}
      attributionControl={false}
      interactiveLayerIds={[
        BATTLE_CLUSTER_LAYER_ID,
        BATTLE_CLUSTER_COUNT_LAYER_ID,
        BATTLE_UNCLUSTERED_LAYER_ID,
      ]}
      initialViewState={initialMapViewState}
      style={{ width: `${width}px`, height: `${height}px` }}
      onZoomStart={() => setIsZooming(true)}
      onZoomEnd={() => setIsZooming(false)}
      onMoveEnd={onMoveEnd}
      onLoad={handleMapLoad}
      onMouseDown={handleMapMouseDown}
      onClick={handleMapClick}
      cursor={isAltPressed ? "crosshair" : ""}
    >
      <MapSource source={mapSource} />

      <GeolocateControl position="top-right" />
      <NavigationControl position="top-right" />
      <SettingsControl
        mapSource={mapSource}
        onToggleMapSource={handleToggleMapSource}
      />
      <FitRadiusControl onFit={fitRadiusToScreen} disabled={!radius.point} />
      <ScaleControl />
      <AttributionControl compact={true} />

      {radius.point && <MapRadius point={radius.point} size={radius.size} />}
      <MapRadiusBlip point={radius.point} />

      <MapBattlePins
        markers={visibleMarkers}
        savedMarkerIds={savedPins.map((pin) => pin.id)}
      />

      {selectedMarker && (
        <MapPopup
          disabled={isZooming}
          selectedMarker={selectedMarker}
          isSaved={savedPins.some((pin) => pin.id === selectedMarker.id)}
          onToggleSave={onToggleSave}
          onClose={clearSelectedMarker}
        />
      )}
    </Map>
  );
}
