import { type MapRef } from "react-map-gl/maplibre";
import { useCallback, useEffect, useRef } from "react";
import { MapView } from "./components/map-view";
import { ControlPanel } from "./components/panel";
import { useMapSession } from "./hooks/use-map-session";
import { useRadiusState } from "./hooks/use-radius-state";
import { useSavedPinsState } from "./hooks/use-saved-pins-state";
import { useViewerUrlParams } from "./hooks/use-viewer-url-params";
import { DEFAULT_MAP_VIEW, DEFAULT_RADIUS_STATE } from "./types/viewer-state";
import { useMapStore } from "./stores/use-map-store";

export function App() {
  // Map state
  const mapRef = useRef<MapRef | null>(null);
  const {
    initialSavedPins,
    initialLayer,
    saveSavedPinsSessionState,
    saveLayerSessionState,
  } = useMapSession();
  const {
    initialMapViewFromUrl,
    initialRadiusFromUrl,
    updateMapViewInUrl,
    updateRadiusInUrl,
  } = useViewerUrlParams();

  const initialMapViewState = initialMapViewFromUrl ?? DEFAULT_MAP_VIEW;
  const initialEffectiveRadiusState = initialRadiusFromUrl ?? DEFAULT_RADIUS_STATE;

  // Radius
  const {
    radius,
    radiusSize,
    hasRadius,
    setRadiusPoint,
    setRadiusSize,
    clearRadius,
    fitRadiusToScreen,
  } = useRadiusState({
    mapRef,
    initialRadiusState: initialEffectiveRadiusState,
  });

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

  const handleMapMoveEnd = useCallback(
    (event: {
      viewState: {
        longitude: number;
        latitude: number;
        zoom: number;
      };
    }) => {
      updateMapViewInUrl(event.viewState);
    },
    [updateMapViewInUrl],
  );

  useEffect(() => {
    updateRadiusInUrl(radius);
  }, [radius, updateRadiusInUrl]);

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
        hasRadius={hasRadius}
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
          clearRadius();
          useMapStore.getState().clearSelectedMarker();
        }}
        onRemoveSavedPin={handleRemoveSavedPin}
        onSelectSavedPin={handleSelectSavedPin}
      />
    </div>
  );
}
