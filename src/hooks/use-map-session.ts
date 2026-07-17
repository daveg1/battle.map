import { useCallback, useState } from "react";
import {
  getInitialSessionState,
  saveMapViewState,
  saveRadiusState,
  type SessionRadiusState,
} from "../session/map-session";

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

  return {
    initialMapViewState: initialSessionState.map,
    initialRadiusState: initialSessionState.radius,
    handleMapMoveEnd,
    saveRadiusSessionState,
  };
}
