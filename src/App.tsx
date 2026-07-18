import { type MapRef } from "react-map-gl/maplibre";
import { useScreenSize } from "./hooks/use-screen-size";
import { useRef, useState } from "react";
import { MapView } from "./components/map-view";
import type { BattleMarkerItem } from "./types/common";
import { ControlPanel } from "./components/panel";
import { useAltDragRadius } from "./hooks/use-alt-drag-radius";
import { useBattleMarkers } from "./hooks/use-battle-markers";
import { useMapRuntime } from "./hooks/use-map-runtime";
import { useMapSession } from "./hooks/use-map-session";
import { useMapShortcuts } from "./hooks/use-map-shortcuts";
import { useRadiusState } from "./hooks/use-radius-state";
import { useSavedPinsState } from "./hooks/use-saved-pins-state";

function App() {
  // Map state
  const { width, height } = useScreenSize();
  const mapRef = useRef<MapRef | null>(null);
  const {
    initialMapViewState,
    initialRadiusState,
    initialSavedPins,
    initialLayer,
    handleMapMoveEnd,
    saveRadiusSessionState,
    saveSavedPinsSessionState,
    saveLayerSessionState,
  } = useMapSession();

  // Radius
  const {
    radiusPoint,
    radiusSize,
    setRadiusPoint,
    setRadiusSize,
    fitRadiusToScreen,
  } = useRadiusState({ mapRef, initialRadiusState, saveRadiusSessionState });

  // Actions
  const { isAltPressed, handleMapMouseDown } = useAltDragRadius({
    radiusSize,
    setRadiusPoint,
    setRadiusSize,
  });

  // Battles
  const [selectedMarker, setSelectedMarker] = useState<BattleMarkerItem | null>(
    null,
  );

  const {
    savedPins,
    handleToggleSavedPin,
    handleRemoveSavedPin,
    handleSelectSavedPin,
  } = useSavedPinsState({
    mapRef,
    initialSavedPins,
    saveSavedPinsSessionState,
    setSelectedMarker,
  });

  const [visibleMarkers] = useBattleMarkers({
    radiusPoint,
    radiusSize,
    savedPins,
  });

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
    setSelectedMarker,
    radiusPoint,
    fitRadiusToScreen,
  });

  useMapShortcuts({
    hasRadius: Boolean(radiusPoint),
    onEscape: () => setSelectedMarker(null),
    onFitRadius: fitRadiusToScreen,
  });

  return (
    <div className="flex h-full">
      <MapView
        mapRef={mapRef}
        width={width}
        height={height}
        initialMapViewState={initialMapViewState}
        mapSource={mapSource}
        isZooming={isZooming}
        isAltPressed={isAltPressed}
        radiusPoint={radiusPoint}
        radiusSize={radiusSize}
        visibleMarkers={visibleMarkers}
        savedPins={savedPins}
        selectedMarker={selectedMarker}
        onZoomStart={() => setIsZooming(true)}
        onZoomEnd={() => setIsZooming(false)}
        onMoveEnd={handleMapMoveEnd}
        onLoad={handleMapLoad}
        onMouseDown={handleMapMouseDown}
        onClick={handleMapClick}
        onToggleMapSource={handleToggleMapSource}
        onFitRadius={fitRadiusToScreen}
        onToggleSave={handleToggleSavedPin}
        onClosePopup={() => setSelectedMarker(null)}
      />

      <ControlPanel
        radius={radiusSize}
        hasRadius={Boolean(radiusPoint)}
        savedPins={savedPins}
        onSearch={setRadiusSize}
        onSetRadiusPoint={(point) => {
          setRadiusPoint(point);
          setSelectedMarker(null);

          const map = mapRef.current;
          if (!map) return;

          map.easeTo({
            center: [point.lng, point.lat],
            zoom: 8,
            duration: 600,
          });
        }}
        onClear={() => {
          setRadiusPoint(null);
          setSelectedMarker(null);
        }}
        onRemoveSavedPin={handleRemoveSavedPin}
        onSelectSavedPin={handleSelectSavedPin}
      />
    </div>
  );
}

export default App;
