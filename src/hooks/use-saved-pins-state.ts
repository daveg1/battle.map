import { useEffect, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { BattleMarkerItem, SavedPinItem } from "../types/common";

interface Props {
  mapRef: RefObject<MapRef | null>;
  initialSavedPins: SavedPinItem[];
  saveSavedPinsSessionState(savedPins: SavedPinItem[]): void;
  setSelectedMarker: Dispatch<SetStateAction<BattleMarkerItem | null>>;
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

export function useSavedPinsState({
  mapRef,
  initialSavedPins,
  saveSavedPinsSessionState,
  setSelectedMarker,
}: Props) {
  const [savedPins, setSavedPins] = useState<SavedPinItem[]>(
    initialSavedPins.filter((pin) => pin.battles?.length),
  );

  useEffect(() => {
    saveSavedPinsSessionState(savedPins);
  }, [saveSavedPinsSessionState, savedPins]);

  // Adds/removes a marker from saved pins whilst preserving order
  function handleToggleSavedPin(marker: BattleMarkerItem) {
    setSavedPins((current) => {
      const isAlreadySaved = current.some((pin) => pin.id === marker.id);
      if (isAlreadySaved) {
        return current.filter((pin) => pin.id !== marker.id);
      }

      return [createSavedPin(marker), ...current];
    });
  }

  function handleRemoveSavedPin(id: string) {
    setSavedPins((current) => current.filter((pin) => pin.id !== id));
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
    setSavedPins,
    handleToggleSavedPin,
    handleRemoveSavedPin,
    handleSelectSavedPin,
  };
}
