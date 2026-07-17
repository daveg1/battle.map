import { useCallback, useState } from "react";
import { getInitialMapViewState, saveMapViewState } from "../session/map-session";

interface MoveEndEvent {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export function useMapSession() {
  const [initialMapViewState] = useState(() => getInitialMapViewState());

  const handleMapMoveEnd = useCallback((event: MoveEndEvent) => {
    saveMapViewState({
      longitude: event.viewState.longitude,
      latitude: event.viewState.latitude,
      zoom: event.viewState.zoom,
    });
  }, []);

  return { initialMapViewState, handleMapMoveEnd };
}
