import {
  AttributionControl,
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { useScreenSize } from "./hooks/use-screen-size";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FitRadiusControl } from "./components/fit-radius-control";
import { MapLayerControl } from "./components/map-layer-control";
import { MapSource } from "./components/map-source";
import { useFetchBattles } from "./hooks/use-fetch-battles";
import type { BattleMarkerItem } from "./types/common";
import { MapPopup } from "./components/map-popup";
import { ControlPanel } from "./components/panel";
import { MapRadius } from "./components/map-radius";
import { useAltDragRadius } from "./hooks/use-alt-drag-radius";
import { useMapRuntime } from "./hooks/use-map-runtime";
import { useMapSession } from "./hooks/use-map-session";
import { useRadiusState } from "./hooks/use-radius-state";
import { useSavedPinsState } from "./hooks/use-saved-pins-state";
import {
  BATTLE_CLUSTER_COUNT_LAYER_ID,
  BATTLE_CLUSTER_LAYER_ID,
  BATTLE_UNCLUSTERED_LAYER_ID,
  MapBattlePins,
} from "./components/map-battle-pins";

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
  const [getBattleMarkers] = useFetchBattles();

  const battleMarkers = useMemo(() => {
    if (!radiusPoint) return [];
    return getBattleMarkers(radiusPoint, radiusSize);
  }, [radiusPoint, radiusSize, getBattleMarkers]);

  const visibleMarkers = useMemo(() => {
    const markers = [...battleMarkers];

    for (const savedPin of savedPins) {
      const alreadyVisible = markers.some(
        (marker) => marker.id === savedPin.id,
      );
      if (alreadyVisible) continue;

      markers.push({
        id: savedPin.id,
        coords: savedPin.coords,
        battles: savedPin.battles,
      });
    }

    return markers;
  }, [battleMarkers, savedPins]);

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

  // TODO: create some kind of keyboard shortcut handler here so we can register keyboard shortcuts and use them via a hook.
  // TODO: this will also let us see which events have already been set.
  // TODO: furthermore we can use this registry to quickly print a list of available commands:
  // `key+combo` <name> - <description>
  // Handles global keyboard shortcuts (Escape to close popup, Alt+Enter to fit radius).
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedMarker(null);
        return;
      }

      if (event.altKey && event.key === "Enter") {
        if (!radiusPoint) return;

        event.preventDefault();
        fitRadiusToScreen();
      }
    },
    [fitRadiusToScreen, radiusPoint],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <div className={"flex h-full"}>
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
        onMoveEnd={handleMapMoveEnd}
        onLoad={handleMapLoad}
        onMouseDown={handleMapMouseDown}
        onClick={handleMapClick}
        cursor={isAltPressed ? "crosshair" : ""}
      >
        <MapSource source={mapSource} />

        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />
        <MapLayerControl source={mapSource} onToggle={handleToggleMapSource} />
        <FitRadiusControl onFit={fitRadiusToScreen} disabled={!radiusPoint} />
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
            onToggleSave={handleToggleSavedPin}
            onClose={() => setSelectedMarker(null)}
          />
        )}
      </Map>

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
