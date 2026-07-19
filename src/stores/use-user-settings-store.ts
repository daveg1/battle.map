import { create } from "zustand";
import type { SessionMapLayer } from "../types/viewer-state";

interface UserSettingsState {
  mapSource: SessionMapLayer;
}

interface UserSettingsActions {
  initializeMapSource(source: SessionMapLayer): void;
  toggleMapSource(): void;
}

type UserSettingsStore = UserSettingsState & UserSettingsActions;

export const useUserSettingsStore = create<UserSettingsStore>((set) => ({
  mapSource: "positron",
  initializeMapSource: (source) => set({ mapSource: source }),
  toggleMapSource: () =>
    set((state) => ({
      mapSource: state.mapSource === "positron" ? "dark-matter" : "positron",
    })),
}));
