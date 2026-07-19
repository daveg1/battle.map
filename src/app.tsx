import { type MapRef } from "react-map-gl/maplibre";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MapView } from "./components/map/map-view";
import { ControlPanel } from "./components/panel/panel";
import { useSavedPinsState } from "./hooks/use-saved-pins-state";
import { useViewerUrlParams } from "./hooks/use-viewer-url-params";
import { DEFAULT_MAP_VIEW } from "./types/viewer-state";
import { useMapStore } from "./stores/use-map-store";
import { readMapViewFromUrl } from "./utils/viewer-url-state";

export function App() {
  // Map state
  const mapRef = useRef<MapRef | null>(null);
  const { updateMapViewInUrl, updateRadiusInUrl } = useViewerUrlParams();
  const initialMapViewState = useMemo(
    () => readMapViewFromUrl() ?? DEFAULT_MAP_VIEW,
    [],
  );

  const radius = useMapStore((state) => state.radius);

  const {
    savedPins,
    handleToggleSavedPin,
    handleRemoveSavedPin,
    handleSelectSavedPin,
  } = useSavedPinsState({ mapRef });

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
        onMoveEnd={handleMapMoveEnd}
        onToggleSave={handleToggleSavedPin}
      />

      <ControlPanel
        mapRef={mapRef}
        savedPins={savedPins}
        onRemoveSavedPin={handleRemoveSavedPin}
        onSelectSavedPin={handleSelectSavedPin}
      />
    </div>
  );
}
