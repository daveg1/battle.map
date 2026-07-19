import type { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import type { BattleMarkerItem, SavedPinItem } from "../types/common";
import type { SessionRadiusState } from "../types/viewer-state";

interface MapStoreState {
  radius: SessionRadiusState;
  savedPins: SavedPinItem[];
  selectedMarker: BattleMarkerItem | null;
}

interface MapStoreActions {
  initializeRadiusState(radius: SessionRadiusState): void;
  initializeSavedPins(savedPins: SavedPinItem[]): void;
  setRadius: Dispatch<SetStateAction<SessionRadiusState>>;
  setSavedPins: Dispatch<SetStateAction<SavedPinItem[]>>;
  setSelectedMarker: Dispatch<SetStateAction<BattleMarkerItem | null>>;
  clearSelectedMarker(): void;
}

type MapStore = MapStoreState & MapStoreActions;

export const useMapStore = create<MapStore>((set) => ({
  radius: {
    point: null,
    size: 100,
  },
  savedPins: [],
  selectedMarker: null,
  initializeRadiusState: (radius) =>
    set({
      radius,
    }),
  initializeSavedPins: (savedPins) => set({ savedPins }),
  setRadius: (next) =>
    set((state) => ({
      radius:
        typeof next === "function"
          ? (next as (prev: SessionRadiusState) => SessionRadiusState)(
              state.radius,
            )
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
