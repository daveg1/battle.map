import { useCallback, useState } from "react";
import {
  getInitialSessionState,
  saveMapViewState,
  saveRadiusState,
  saveSavedPinsState,
  type SessionRadiusState,
} from "../session/map-session";
import type { SavedPinItem } from "../types/common";

interface MoveEndEvent {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export function useMapSession() {
  const [initialSessionState] = useState(() => getInitialSessionState());

  const handleMapMoveEnd = useCallback((event: MoveEndEvent) => {
    saveMapViewState({
      longitude: event.viewState.longitude,
      latitude: event.viewState.latitude,
      zoom: event.viewState.zoom,
    });
  }, []);

  const saveRadiusSessionState = useCallback((radius: SessionRadiusState) => {
    saveRadiusState(radius);
  }, []);

  const saveSavedPinsSessionState = useCallback((savedPins: SavedPinItem[]) => {
    saveSavedPinsState(savedPins);
  }, []);

  return {
    initialMapViewState: initialSessionState.map,
    initialRadiusState: initialSessionState.radius,
    initialSavedPins: initialSessionState.savedPins,
    handleMapMoveEnd,
    saveRadiusSessionState,
    saveSavedPinsSessionState,
  };
}
