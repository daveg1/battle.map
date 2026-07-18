import {
  AttributionControl,
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import type { RefObject } from "react";
import { FitRadiusControl } from "./fit-radius-control";
import { MapLayerControl } from "./map-layer-control";
import { MapSource, type MapSourceType } from "./map-source";
import { MapPopup } from "./map-popup";
import { MapRadius } from "./map-radius";
import {
  BATTLE_CLUSTER_COUNT_LAYER_ID,
  BATTLE_CLUSTER_LAYER_ID,
  BATTLE_UNCLUSTERED_LAYER_ID,
  MapBattlePins,
} from "./map-battle-pins";
import type { BattleMarkerItem, Point, SavedPinItem } from "../types/common";

interface MoveEndEvent {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

interface Props {
  mapRef: RefObject<MapRef | null>;
  width: number;
  height: number;
  initialMapViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  mapSource: MapSourceType;
  isZooming: boolean;
  isAltPressed: boolean;
  radiusPoint: Point | null;
  radiusSize: number;
  visibleMarkers: BattleMarkerItem[];
  savedPins: SavedPinItem[];
  selectedMarker: BattleMarkerItem | null;
  onZoomStart(): void;
  onZoomEnd(): void;
  onMoveEnd(event: MoveEndEvent): void;
  onLoad(): void;
  onMouseDown(event: MapLayerMouseEvent): void;
  onClick(event: MapLayerMouseEvent): void;
  onToggleMapSource(): void;
  onFitRadius(): void;
  onToggleSave(marker: BattleMarkerItem): void;
  onClosePopup(): void;
}

export function MapView({
  mapRef,
  width,
  height,
  initialMapViewState,
  mapSource,
  isZooming,
  isAltPressed,
  radiusPoint,
  radiusSize,
  visibleMarkers,
  savedPins,
  selectedMarker,
  onZoomStart,
  onZoomEnd,
  onMoveEnd,
  onLoad,
  onMouseDown,
  onClick,
  onToggleMapSource,
  onFitRadius,
  onToggleSave,
  onClosePopup,
}: Props) {
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
      onZoomStart={onZoomStart}
      onZoomEnd={onZoomEnd}
      onMoveEnd={onMoveEnd}
      onLoad={onLoad}
      onMouseDown={onMouseDown}
      onClick={onClick}
      cursor={isAltPressed ? "crosshair" : ""}
    >
      <MapSource source={mapSource} />

      <GeolocateControl position="top-right" />
      <NavigationControl position="top-right" />
      <MapLayerControl source={mapSource} onToggle={onToggleMapSource} />
      <FitRadiusControl onFit={onFitRadius} disabled={!radiusPoint} />
      <ScaleControl />
      <AttributionControl compact={true} />

      {radiusPoint && <MapRadius point={radiusPoint} size={radiusSize} />}

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
          onClose={onClosePopup}
        />
      )}
    </Map>
  );
}
