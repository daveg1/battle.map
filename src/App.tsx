import {
  AttributionControl,
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import * as turf from "@turf/turf";
import { useScreenSize } from "./hooks/use-screen-size";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapLayerControl } from "./components/map-layer-control";
import { MapSource, type MapSourceType } from "./components/map-source";
import { useFetchBattles } from "./hooks/use-fetch-battles";
import type { BattleMarkerItem, Point, SavedPinItem } from "./types/common";
import { MapPopup } from "./components/map-popup";
import { ControlPanel } from "./components/panel";
import { MapRadius } from "./components/map-radius";
import { useAltDragRadius } from "./hooks/use-alt-drag-radius";
import { useMapSession } from "./hooks/use-map-session";
import {
  BATTLE_CLUSTER_COUNT_LAYER_ID,
  BATTLE_CLUSTER_LAYER_ID,
  BATTLE_PIN_IMAGE_ID,
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
  const [radiusPoint, setRadiusPoint] = useState<Point | null>(
    initialRadiusState.point,
  );
  const [radiusSize, setRadiusSize] = useState<number>(initialRadiusState.size);

  // Actions
  const [mapSource, setMapSource] = useState<MapSourceType>(initialLayer);
  const [isZooming, setIsZooming] = useState(false);
  const { isAltPressed, handleMapMouseDown } = useAltDragRadius({
    radiusSize,
    setRadiusPoint,
    setRadiusSize,
  });

  // Battles
  const [selectedMarker, setSelectedMarker] = useState<BattleMarkerItem | null>(
    null,
  );
  const [savedPins, setSavedPins] = useState<SavedPinItem[]>(
    initialSavedPins.filter((pin) => pin.battles?.length),
  );
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

  // Event handlers
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedMarker(null);
        return;
      }

      if (event.altKey && event.key === "Enter") {
        if (!radiusPoint) {
          return;
        }

        const map = mapRef.current;
        if (!map) {
          return;
        }

        event.preventDefault();

        const circle = turf.circle([radiusPoint.lng, radiusPoint.lat], radiusSize, {
          steps: 64,
          units: "kilometers",
        });
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(circle);

        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: 40,
            duration: 600,
          },
        );
      }
    },
    [radiusPoint, radiusSize],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  useEffect(() => {
    saveRadiusSessionState({
      point: radiusPoint,
      size: radiusSize,
    });
  }, [radiusPoint, radiusSize, saveRadiusSessionState]);

  useEffect(() => {
    saveSavedPinsSessionState(savedPins);
  }, [savedPins, saveSavedPinsSessionState]);

  useEffect(() => {
    saveLayerSessionState(mapSource);
  }, [mapSource, saveLayerSessionState]);

  function createSavedPin(marker: BattleMarkerItem): SavedPinItem {
    const primaryBattle = marker.battles[0];

    return {
      id: marker.id,
      coords: marker.coords,
      title: primaryBattle.name,
      location: `${primaryBattle.place}, ${primaryBattle.country}`,
      battleNames: marker.battles.map((battle) => battle.name),
      battles: marker.battles,
    };
  }

  function handleToggleSavedPin(marker: BattleMarkerItem) {
    setSavedPins((current) => {
      const isAlreadySaved = current.some((pin) => pin.id === marker.id);
      if (isAlreadySaved) {
        return current.filter((pin) => pin.id !== marker.id);
      }

      return [createSavedPin(marker), ...current];
    });
  }

  function handleSelectSavedPin(id: string) {
    const pin = savedPins.find((entry) => entry.id === id);
    if (!pin) return;

    setSelectedMarker({
      id: pin.id,
      coords: pin.coords,
      battles: pin.battles,
    });

    const map = mapRef.current;
    if (!map) return;

    const currentZoom = map.getZoom();
    map.easeTo({
      center: [pin.coords.lng, pin.coords.lat],
      zoom: Math.max(currentZoom, 5),
      duration: 600,
    });
  }

  function handleToggleMapSource() {
    setMapSource((current) =>
      current === "positron" ? "dark-matter" : "positron",
    );
  }

  function handleMapLoad() {
    const map = mapRef.current;
    if (!map) return;

    const collapseAttribution = () => {
      const attribution = map
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib.maplibregl-compact-show");
      if (attribution) {
        attribution.classList.remove("maplibregl-compact-show");
      }
    };
    collapseAttribution();
    requestAnimationFrame(collapseAttribution);

    if (map.hasImage(BATTLE_PIN_IMAGE_ID)) return;

    const markerImage = new Image();
    markerImage.onload = () => {
      const loadedMap = mapRef.current;
      if (!loadedMap || loadedMap.hasImage(BATTLE_PIN_IMAGE_ID)) return;
      loadedMap.addImage(BATTLE_PIN_IMAGE_ID, markerImage, {
        pixelRatio: 2,
      });
    };
    markerImage.src = "/battlepin.png";
  }

  function handleMapClick(event: MapLayerMouseEvent) {
    const clickedFeature = event.features?.[0];
    if (!clickedFeature) return;

    if (clickedFeature.layer.id === BATTLE_UNCLUSTERED_LAYER_ID) {
      const markerIndex = Number(clickedFeature.properties?.markerIndex);
      if (Number.isNaN(markerIndex)) return;

      const selected = visibleMarkers[markerIndex];
      if (selected) {
        setSelectedMarker(selected);

        const map = mapRef.current;
        if (map) {
          map.easeTo({
            center: [selected.coords.lng, selected.coords.lat],
            duration: 600,
          });
        }
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
        onRemoveSavedPin={(id) =>
          setSavedPins((current) => current.filter((pin) => pin.id !== id))
        }
        onSelectSavedPin={handleSelectSavedPin}
      />
    </div>
  );
}

export default App;
