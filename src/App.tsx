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
import type { BattleItem, Point } from "./types/common";
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
  const [selectedBattle, setSelectedBattle] = useState<BattleItem | null>(null);
  const [getBattles] = useFetchBattles();

  const battles = useMemo(() => {
    if (!radiusPoint) return [];
    return getBattles(radiusPoint, searchRadiusSize);
  }, [radiusPoint, searchRadiusSize, getBattles]);

  // Event handlers
  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setSelectedBattle(null);
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
      const battleIndex = Number(clickedFeature.properties?.battleIndex);
      if (Number.isNaN(battleIndex)) return;

      const selected = battles[battleIndex];
      if (selected) {
        setSelectedBattle(selected);
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

        <MapBattlePins battles={battles} />

        {radiusPoint && <MapRadius point={radiusPoint} size={radiusSize} />}

        {selectedBattle && (
          <MapPopup
            disabled={isZooming}
            selectedBattle={selectedBattle}
            onClose={() => setSelectedBattle(null)}
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
          setSelectedBattle(null);
        }}
      />
    </div>
  );
}

export default App;
