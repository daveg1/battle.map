import { type MapRef } from "react-map-gl/maplibre";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapView } from "./components/map/map-view";
import { ControlPanel } from "./components/panel/panel";
import { SplashScreen } from "./components/splash/splash-screen";
import { useSavedPinsState } from "./hooks/use-saved-pins-state";
import { useViewerUrlParams } from "./hooks/use-viewer-url-params";
import { DEFAULT_MAP_VIEW } from "./types/viewer-state";
import { useMapStore } from "./stores/use-map-store";
import { useUserSettingsStore } from "./stores/use-user-settings-store";
import { readMapViewFromUrl } from "./utils/viewer-url-state";
import { MobileRadiusSelector } from "./components/mobile/mobile-radius-selector";

export function App() {
  const mapRef = useRef<MapRef | null>(null);
  const { updateMapViewInUrl, updateRadiusInUrl } = useViewerUrlParams();
  const initialMapViewState = useMemo(
    () => readMapViewFromUrl() ?? DEFAULT_MAP_VIEW,
    [],
  );

  const radius = useMapStore((state) => state.radius);
  const splashDismissed = useUserSettingsStore(
    (state) => state.splashDismissed,
  );
  const setSplashDismissed = useUserSettingsStore(
    (state) => state.setSplashDismissed,
  );
  const [isSplashVisible, setIsSplashVisible] = useState(
    () => !splashDismissed,
  );

  const {
    savedPins,
    recentlyAddedPinId,
    recentlyRemovedPinId,
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

  function handleDismissSplash() {
    setSplashDismissed(true);
    setIsSplashVisible(false);
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="flex h-full">
        <MapView
          mapRef={mapRef}
          initialMapViewState={initialMapViewState}
          onMoveEnd={handleMapMoveEnd}
          onToggleSave={handleToggleSavedPin}
          onShowSplash={() => setIsSplashVisible(true)}
        />

        <ControlPanel
          mapRef={mapRef}
          savedPins={savedPins}
          recentlyAddedPinId={recentlyAddedPinId}
          recentlyRemovedPinId={recentlyRemovedPinId}
          onRemoveSavedPin={handleRemoveSavedPin}
          onSelectSavedPin={handleSelectSavedPin}
        />
      </div>

      <MobileRadiusSelector mapRef={mapRef} />

      {isSplashVisible && <SplashScreen onDismiss={handleDismissSplash} />}
    </div>
  );
}
