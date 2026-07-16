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
import { MapPin } from "./components/map-pin";
import type { BattleItem, Point } from "./types/common";
import { MapPopup } from "./components/map-popup";
import { ControlPanel } from "./components/control-panel";
import { MapRadius } from "./components/map-radius";

function App() {
  // Map state
  const { width, height } = useScreenSize();
  const [zoom, _setZoom] = useState(12);

  // Radius
  const [radiusPoint, setRadiusPoint] = useState<Point | null>(null);
  const [radiusSize, setRadiusSize] = useState<number>(100);

  // Actions
  const [isZooming, setIsZooming] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  // Battles
  const [selectedBattle, setSelectedBattle] = useState<BattleItem | null>(null);
  const [getBattles] = useFetchBattles();

  const battles = useMemo(() => {
    if (!radiusPoint) return [];
    return getBattles(radiusPoint, radiusSize);
  }, [radiusPoint, radiusSize, getBattles]);

  // Event handlers
  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setSelectedBattle(null);
      setIsMarking(false);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  });

  function handleMapClick(event: MapLayerMouseEvent) {
    if (!isMarking) return;

    setRadiusPoint(event.lngLat);
    setIsMarking(false);
  }

  return (
    <div className={"flex h-full"}>
      <Map
        initialViewState={{
          longitude: -2.099075,
          latitude: 57.149651,
          zoom,
        }}
        style={{ width: `${width}px`, height: `${height}px` }}
        onZoomStart={() => setIsZooming(true)}
        onZoomEnd={() => setIsZooming(false)}
        onClick={(ev) => handleMapClick(ev)}
        cursor={isMarking ? "crosshair" : ""}
      >
        <MapSource source="osm" />

        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl />

        {battles.map((battle) => (
          <MapPin
            key={`marker-${battle.name}`}
            battle={battle}
            onClick={(battle) => setSelectedBattle(battle)}
          />
        ))}

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
        isMarking={isMarking}
        onStartMarking={() => {
          setIsMarking(true);
        }}
        radiusSize={radiusSize}
        onSearch={(size) => setRadiusSize(size)}
      />
    </div>
  );
}

export default App;
