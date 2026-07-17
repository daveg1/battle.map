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
import { MapCountries } from "./components/map-countries";

function App() {
  // Map state
  const { width, height } = useScreenSize();
  const [zoom, _setZoom] = useState(12);
  const [hoveredCountryId, setHoveredCountryId] = useState<
    number | undefined
  >();

  // Radius
  const [radiusPoint, setRadiusPoint] = useState<Point | null>(null);
  const [radiusSize, setRadiusSize] = useState<number>(100);

  // Actions
  const [isZooming, setIsZooming] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);

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
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey) {
        setIsAltPressed(true);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!event.altKey) {
        setIsAltPressed(false);
      }
    }

    function handleWindowBlur() {
      setIsAltPressed(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  function handleMapClick(event: MapLayerMouseEvent) {
    if (event.originalEvent.altKey) {
      setRadiusPoint(event.lngLat);
    }
  }

  return (
    <div className={"flex h-full"}>
      <Map
        interactive={true}
        interactiveLayerIds={["countries-fill"]}
        initialViewState={{
          longitude: -2.099075,
          latitude: 57.149651,
          zoom,
        }}
        style={{ width: `${width}px`, height: `${height}px` }}
        onZoomStart={() => setIsZooming(true)}
        onZoomEnd={() => setIsZooming(false)}
        onClick={(ev) => handleMapClick(ev)}
        onMouseMove={(ev) => {
          const id = ev.features?.[0]?.id;
          if (!id) return;
          setHoveredCountryId(+id);
        }}
        cursor={isAltPressed ? "crosshair" : ""}
      >
        <MapSource source="osm" />
        <MapCountries hoveredCountryId={hoveredCountryId} />

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

      <ControlPanel onSearch={(size) => setRadiusSize(size)} />
    </div>
  );
}

export default App;
