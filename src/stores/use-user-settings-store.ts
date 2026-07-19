import { create } from "zustand";
import type { SessionMapLayer } from "../types/viewer-state";

const MAP_SOURCE_STORAGE_KEY = "battlemap:map-source";
const LEGACY_SESSION_STORAGE_KEY = "battlemap:session";

interface UserSettingsState {
  mapSource: SessionMapLayer;
}

interface UserSettingsActions {
  toggleMapSource(): void;
}

type UserSettingsStore = UserSettingsState & UserSettingsActions;

export const useUserSettingsStore = create<UserSettingsStore>((set) => ({
  mapSource: readMapSourceFromStorage(),
  toggleMapSource: () =>
    set((state) => {
      const mapSource =
        state.mapSource === "positron" ? "dark-matter" : "positron";
      writeMapSourceToStorage(mapSource);
      return { mapSource };
    }),
}));

function readMapSourceFromStorage(): SessionMapLayer {
  if (typeof window === "undefined") {
    return "positron";
  }

  const raw = window.localStorage.getItem(MAP_SOURCE_STORAGE_KEY);
  if (raw === "positron" || raw === "dark-matter") {
    return raw;
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_SESSION_STORAGE_KEY);
  if (!legacyRaw) {
    return "positron";
  }

  try {
    const parsed = JSON.parse(legacyRaw) as { layer?: SessionMapLayer };
    return parsed.layer === "dark-matter" ? "dark-matter" : "positron";
  } catch (error) {
    console.warn("Could not parse legacy map source.", error);
    return "positron";
  }
}

function writeMapSourceToStorage(mapSource: SessionMapLayer) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MAP_SOURCE_STORAGE_KEY, mapSource);
}
