import { type MapRef } from "react-map-gl/maplibre";
import { useRef } from "react";
import { MapView } from "./components/map-view";
import { ControlPanel } from "./components/panel";
import { useMapSession } from "./hooks/use-map-session";
import { useRadiusState } from "./hooks/use-radius-state";
import { useSavedPinsState } from "./hooks/use-saved-pins-state";
import { useMapStore } from "./stores/use-map-store";

export function App() {
  // Map state
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

  const {
    savedPins,
    handleToggleSavedPin,
    handleRemoveSavedPin,
    handleSelectSavedPin,
  } = useSavedPinsState({
    mapRef,
    initialSavedPins,
    saveSavedPinsSessionState,
  });

  return (
    <div className="flex h-full">
      <MapView
        mapRef={mapRef}
        initialMapViewState={initialMapViewState}
        initialLayer={initialLayer}
        saveLayerSessionState={saveLayerSessionState}
        onMoveEnd={handleMapMoveEnd}
        onFitRadiusToScreen={fitRadiusToScreen}
        onToggleSave={handleToggleSavedPin}
      />

      <ControlPanel
        radius={radiusSize}
        hasRadius={Boolean(radiusPoint)}
        savedPins={savedPins}
        onSearch={setRadiusSize}
        onSetRadiusPoint={(point) => {
          setRadiusPoint(point);
          useMapStore.getState().clearSelectedMarker();

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
          useMapStore.getState().clearSelectedMarker();
        }}
        onRemoveSavedPin={handleRemoveSavedPin}
        onSelectSavedPin={handleSelectSavedPin}
      />
    </div>
  );
}
