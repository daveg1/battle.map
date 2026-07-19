import type { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import type { BattleMarkerItem, Point, SavedPinItem } from "../types/common";
import type { SessionRadiusState } from "../session/map-session";

interface MapStoreState {
  radiusPoint: Point | null;
  radiusSize: number;
  savedPins: SavedPinItem[];
  selectedMarker: BattleMarkerItem | null;
}

interface MapStoreActions {
  initializeRadiusState(radius: SessionRadiusState): void;
  initializeSavedPins(savedPins: SavedPinItem[]): void;
  setRadiusPoint: Dispatch<SetStateAction<Point | null>>;
  setRadiusSize: Dispatch<SetStateAction<number>>;
  setSavedPins: Dispatch<SetStateAction<SavedPinItem[]>>;
  setSelectedMarker: Dispatch<SetStateAction<BattleMarkerItem | null>>;
  clearSelectedMarker(): void;
}

type MapStore = MapStoreState & MapStoreActions;

export const useMapStore = create<MapStore>((set) => ({
  radiusPoint: null,
  radiusSize: 100,
  savedPins: [],
  selectedMarker: null,
  initializeRadiusState: (radius) =>
    set({
      radiusPoint: radius.point,
      radiusSize: radius.size,
    }),
  initializeSavedPins: (savedPins) => set({ savedPins }),
  setRadiusPoint: (next) =>
    set((state) => ({
      radiusPoint:
        typeof next === "function"
          ? (next as (prev: Point | null) => Point | null)(state.radiusPoint)
          : next,
    })),
  setRadiusSize: (next) =>
    set((state) => ({
      radiusSize:
        typeof next === "function"
          ? (next as (prev: number) => number)(state.radiusSize)
          : next,
    })),
  setSavedPins: (next) =>
    set((state) => ({
      savedPins:
        typeof next === "function"
          ? (next as (prev: SavedPinItem[]) => SavedPinItem[])(state.savedPins)
          : next,
    })),
  setSelectedMarker: (next) =>
    set((state) => ({
      selectedMarker:
        typeof next === "function"
          ? (
              next as (prev: BattleMarkerItem | null) => BattleMarkerItem | null
            )(state.selectedMarker)
          : next,
    })),
  clearSelectedMarker: () => set({ selectedMarker: null }),
}));
