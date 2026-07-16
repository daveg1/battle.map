import {
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import { useScreenSize } from "./hooks/use-screen-size";
import { useEffect, useMemo, useState } from "react";
import { MapSource } from "./components/map-source";
import { useFetchBattles } from "./hooks/use-fetch-battles";
import { MapPin } from "./components/map-pin";
import type { BattleItem } from "./types/common";
import { MapPopup } from "./components/map-popup";

function App() {
  const { width, height } = useScreenSize();
  const [zoom, _setZoom] = useState(12);
  const [isZooming, setIsZooming] = useState(false);
  const [source, _setSource] = useState("osm" as const);
  const [selectedBattle, setSelectedBattle] = useState<BattleItem | null>(null);

  const [getBattles] = useFetchBattles();

  const battles = useMemo(
    () => getBattles({ lat: 57.149651, lng: -2.099075 }, 100),
    [getBattles],
  );

  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setSelectedBattle(null);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  });

  return (
    <>
      <Map
        initialViewState={{
          longitude: -2.099075,
          latitude: 57.149651,
          zoom,
        }}
        style={{ width: `${width}px`, height: `${height}px` }}
        onZoomStart={() => setIsZooming(true)}
        onZoomEnd={() => setIsZooming(false)}
      >
        <MapSource source={source} />

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

        {selectedBattle && (
          <MapPopup
            disabled={isZooming}
            selectedBattle={selectedBattle}
            onClose={() => setSelectedBattle(null)}
          />
        )}
      </Map>
    </>
  );
}

export default App;
