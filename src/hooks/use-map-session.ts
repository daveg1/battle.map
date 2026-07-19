import { useCallback, useState } from "react";
import {
  getInitialSessionState,
  saveLayerState,
  saveSavedPinsState,
  type SessionMapLayer,
} from "../session/map-session";
import type { SavedPinItem } from "../types/common";

export function useMapSession() {
  const [initialSessionState] = useState(() => getInitialSessionState());

  const saveSavedPinsSessionState = useCallback((savedPins: SavedPinItem[]) => {
    saveSavedPinsState(savedPins);
  }, []);

  const saveLayerSessionState = useCallback((layer: SessionMapLayer) => {
    saveLayerState(layer);
  }, []);

  return {
    initialSavedPins: initialSessionState.savedPins,
    initialLayer: initialSessionState.layer,
    saveSavedPinsSessionState,
    saveLayerSessionState,
  };
}
