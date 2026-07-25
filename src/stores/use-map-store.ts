import type { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import type { BattleMarkerItem, SavedPinItem } from "../types/common";
import { DEFAULT_RADIUS_STATE, type SessionRadiusState } from "../types/viewer-state";
import { readRadiusFromUrl } from "../utils/viewer-url-state";

const SAVED_PINS_STORAGE_KEY = "battlemap:saved-pins";

interface MapStoreState {
  radius: SessionRadiusState;
  savedPins: SavedPinItem[];
  selectedMarker: BattleMarkerItem | null;
  isPlacingRadius: boolean;
}

interface MapStoreActions {
  setRadius: Dispatch<SetStateAction<SessionRadiusState>>;
  setSavedPins: Dispatch<SetStateAction<SavedPinItem[]>>;
  setSelectedMarker: Dispatch<SetStateAction<BattleMarkerItem | null>>;
  clearSelectedMarker(): void;
  setIsPlacingRadius(value: boolean): void;
}

type MapStore = MapStoreState & MapStoreActions;

export const useMapStore = create<MapStore>((set) => ({
  radius: readRadiusFromUrl() ?? DEFAULT_RADIUS_STATE,
  savedPins: readSavedPinsFromStorage(),
  selectedMarker: null,
  isPlacingRadius: false,
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
    set((state) => {
      const savedPins =
        typeof next === "function"
          ? (next as (prev: SavedPinItem[]) => SavedPinItem[])(state.savedPins)
          : next;

      writeSavedPinsToStorage(savedPins);
      return { savedPins };
    }),
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
  setIsPlacingRadius: (value) => set({ isPlacingRadius: value }),
}));

function readSavedPinsFromStorage(): SavedPinItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(SAVED_PINS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as SavedPinItem[];
    } catch (error) {
      console.warn("Could not parse saved pins.", error);
    }
  }

  const legacyRaw = window.localStorage.getItem("battlemap:session");
  if (!legacyRaw) {
    return [];
  }

  try {
    const parsed = JSON.parse(legacyRaw) as { savedPins?: SavedPinItem[] };
    return parsed.savedPins ?? [];
  } catch (error) {
    console.warn("Could not parse legacy saved pins.", error);
    return [];
  }
}

function writeSavedPinsToStorage(savedPins: SavedPinItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SAVED_PINS_STORAGE_KEY, JSON.stringify(savedPins));
}
