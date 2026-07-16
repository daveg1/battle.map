import {
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import { useScreenSize } from "./hooks/use-screen-size";
import { useMemo, useState } from "react";
import { MapSource } from "./components/map-source";
import { useFetchBattles } from "./hooks/use-fetch-battles";
import { MapPin } from "./components/map-pin";
import type { BattleItem } from "./types/battle";
import { MapPopup } from "./components/map-popup";

function App() {
  const { width, height } = useScreenSize();
  const [zoom, _setZoom] = useState(12);
  const [source, _setSource] = useState("osm" as const);
  const [selectedBattle, setSelectedBattle] = useState<BattleItem | null>(null);

  const [getBattles] = useFetchBattles();

  const battles = useMemo(
    () => getBattles({ lat: 57.149651, lng: -2.099075 }, 100),
    [getBattles],
  );

  return (
    <>
      <Map
        initialViewState={{
          longitude: -2.099075,
          latitude: 57.149651,
          zoom,
        }}
        style={{ width: `${width}px`, height: `${height}px` }}
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
            selectedBattle={selectedBattle}
            onClose={() => setSelectedBattle(null)}
          />
        )}
      </Map>
    </>
  );
}

export default App;
