import { useEffect, useRef, useState, type RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { BattleMarkerItem, SavedPinItem } from "../types/common";
import { useMapStore } from "../stores/use-map-store";

interface Props {
  mapRef: RefObject<MapRef | null>;
}

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

// TODO: can/should this be removed?
export function useSavedPinsState({ mapRef }: Props) {
  const savedPins = useMapStore((state) => state.savedPins);
  const setSavedPins = useMapStore((state) => state.setSavedPins);
  const setSelectedMarker = useMapStore((state) => state.setSelectedMarker);
  const [recentlyAddedPinId, setRecentlyAddedPinId] = useState<string | null>(
    null,
  );
  const [recentlyRemovedPinId, setRecentlyRemovedPinId] = useState<
    string | null
  >(null);
  const removalTimeoutByPinId = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!recentlyAddedPinId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRecentlyAddedPinId(null);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [recentlyAddedPinId]);

  useEffect(
    () => () => {
      for (const timeoutId of removalTimeoutByPinId.current.values()) {
        window.clearTimeout(timeoutId);
      }
      removalTimeoutByPinId.current.clear();
    },
    [],
  );

  function handleRemoveSavedPin(id: string) {
    if (removalTimeoutByPinId.current.has(id)) {
      return;
    }

    setRecentlyRemovedPinId(id);
    if (recentlyAddedPinId === id) {
      setRecentlyAddedPinId(null);
    }

    const timeoutId = window.setTimeout(() => {
      setSavedPins((current) => current.filter((pin) => pin.id !== id));
      setRecentlyRemovedPinId((current) => (current === id ? null : current));
      removalTimeoutByPinId.current.delete(id);
    }, 300);

    removalTimeoutByPinId.current.set(id, timeoutId);
  }

  // Adds/removes a marker from saved pins whilst preserving order
  function handleToggleSavedPin(marker: BattleMarkerItem) {
    const isAlreadySaved = savedPins.some((pin) => pin.id === marker.id);
    if (isAlreadySaved) {
      handleRemoveSavedPin(marker.id);
      return;
    }

    setSavedPins((current) => {
      setRecentlyAddedPinId(marker.id);
      return current.some((pin) => pin.id === marker.id)
        ? current
        : [createSavedPin(marker), ...current];
    });
  }

  // Navigates to a saved pin on the map
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

  return {
    savedPins,
    recentlyAddedPinId,
    recentlyRemovedPinId,
    handleToggleSavedPin,
    handleRemoveSavedPin,
    handleSelectSavedPin,
  };
}
