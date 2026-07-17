import {
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import { useScreenSize } from "./hooks/use-screen-size";
import { useEffect, useMemo, useState } from "react";
import { MapSource } from "./components/map-source";
import { useFetchBattles } from "./hooks/use-fetch-battles";
import type { BattleMarkerItem, Point } from "./types/common";
import { MapPopup } from "./components/map-popup";
import { ControlPanel } from "./components/control-panel";
import { MapRadius } from "./components/map-radius";
import { useAltDragRadius } from "./hooks/use-alt-drag-radius";
import { useMapSession } from "./hooks/use-map-session";
import {
  BATTLE_CLUSTER_COUNT_LAYER_ID,
  BATTLE_CLUSTER_LAYER_ID,
  BATTLE_UNCLUSTERED_LAYER_ID,
  MapBattlePins,
} from "./components/map-battle-pins";

function App() {
  // Map state
  const { width, height } = useScreenSize();
  const {
    initialMapViewState,
    initialRadiusState,
    handleMapMoveEnd,
    saveRadiusSessionState,
  } = useMapSession();

  // Radius
  const [radiusPoint, setRadiusPoint] = useState<Point | null>(
    initialRadiusState.point,
  );
  const [radiusSize, setRadiusSize] = useState<number>(initialRadiusState.size);
  const [searchRadiusSize, setSearchRadiusSize] = useState<number>(
    initialRadiusState.searchSize,
  );

  // Actions
  const [isZooming, setIsZooming] = useState(false);
  const { isAltPressed, handleMapMouseDown } = useAltDragRadius({
    radiusSize,
    setRadiusPoint,
    setRadiusSize,
    onResizeEnd: (nextRadius) => setSearchRadiusSize(nextRadius),
  });

  // Battles
  const [selectedMarker, setSelectedMarker] = useState<BattleMarkerItem | null>(
    null,
  );
  const [getBattleMarkers] = useFetchBattles();

  const battleMarkers = useMemo(() => {
    if (!radiusPoint) return [];
    return getBattleMarkers(radiusPoint, searchRadiusSize);
  }, [radiusPoint, searchRadiusSize, getBattleMarkers]);

  // Event handlers
  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setSelectedMarker(null);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  useEffect(() => {
    saveRadiusSessionState({
      point: radiusPoint,
      size: radiusSize,
      searchSize: searchRadiusSize,
    });
  }, [radiusPoint, radiusSize, searchRadiusSize, saveRadiusSessionState]);

  function handleMapClick(event: MapLayerMouseEvent) {
    const clickedFeature = event.features?.[0];
    if (!clickedFeature) return;

    if (clickedFeature.layer.id === BATTLE_UNCLUSTERED_LAYER_ID) {
      const markerIndex = Number(clickedFeature.properties?.markerIndex);
      if (Number.isNaN(markerIndex)) return;

      const selected = battleMarkers[markerIndex];
      if (selected) {
        setSelectedMarker(selected);
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

  return (
    <div className={"flex h-full"}>
      <Map
        interactive={true}
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
        onMouseDown={handleMapMouseDown}
        onClick={handleMapClick}
        cursor={isAltPressed ? "crosshair" : ""}
      >
        <MapSource source="osm" />

        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl />

        <MapBattlePins markers={battleMarkers} />

        {radiusPoint && <MapRadius point={radiusPoint} size={radiusSize} />}

        {selectedMarker && (
          <MapPopup
            disabled={isZooming}
            selectedMarker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        )}
      </Map>

      <ControlPanel
        radius={radiusSize}
        hasRadius={Boolean(radiusPoint)}
        onSearch={(size) => {
          setRadiusSize(size);
          setSearchRadiusSize(size);
        }}
        onClear={() => {
          setRadiusPoint(null);
          setSelectedMarker(null);
        }}
      />
    </div>
  );
}

export default App;
