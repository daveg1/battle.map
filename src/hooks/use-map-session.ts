import { useCallback, useState } from "react";
import {
  getInitialSessionState,
  saveLayerState,
  saveMapViewState,
  saveRadiusState,
  saveSavedPinsState,
  type SessionMapLayer,
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

  const saveLayerSessionState = useCallback((layer: SessionMapLayer) => {
    saveLayerState(layer);
  }, []);

  return {
    initialMapViewState: initialSessionState.map,
    initialRadiusState: initialSessionState.radius,
    initialSavedPins: initialSessionState.savedPins,
    initialLayer: initialSessionState.layer,
    handleMapMoveEnd,
    saveRadiusSessionState,
    saveSavedPinsSessionState,
    saveLayerSessionState,
  };
}
