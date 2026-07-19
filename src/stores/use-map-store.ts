import type { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import type { BattleMarkerItem, SavedPinItem } from "../types/common";
import { DEFAULT_RADIUS_STATE, type SessionRadiusState } from "../types/viewer-state";
import { readRadiusFromUrl } from "../utils/viewer-url-state";

interface MapStoreState {
  radius: SessionRadiusState;
  savedPins: SavedPinItem[];
  selectedMarker: BattleMarkerItem | null;
}

interface MapStoreActions {
  initializeSavedPins(savedPins: SavedPinItem[]): void;
  setRadius: Dispatch<SetStateAction<SessionRadiusState>>;
  setSavedPins: Dispatch<SetStateAction<SavedPinItem[]>>;
  setSelectedMarker: Dispatch<SetStateAction<BattleMarkerItem | null>>;
  clearSelectedMarker(): void;
}

type MapStore = MapStoreState & MapStoreActions;

export const useMapStore = create<MapStore>((set) => ({
  radius: readRadiusFromUrl() ?? DEFAULT_RADIUS_STATE,
  savedPins: [],
  selectedMarker: null,
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
