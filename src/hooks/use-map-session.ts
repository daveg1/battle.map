import { useCallback, useState } from "react";
import {
  getInitialUserSessionState,
  saveLayerState,
  saveSavedPinsState,
} from "../session/user-session";
import type { SavedPinItem } from "../types/common";
import type { SessionMapLayer } from "../types/viewer-state";

export function useMapSession() {
  const [initialSessionState] = useState(() => getInitialUserSessionState());

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
