import { create } from "zustand";
import type { SessionMapLayer } from "../types/viewer-state";

const MAP_SOURCE_STORAGE_KEY = "battlemap:map-source";
const LEGACY_SESSION_STORAGE_KEY = "battlemap:session";
const SPLASH_DISMISSED_STORAGE_KEY = "battlemap:splash-dismissed";

interface UserSettingsState {
  mapSource: SessionMapLayer;
  splashDismissed: boolean;
}

interface UserSettingsActions {
  setSplashDismissed(dismissed: boolean): void;
  toggleMapSource(): void;
}

type UserSettingsStore = UserSettingsState & UserSettingsActions;

export const useUserSettingsStore = create<UserSettingsStore>((set) => ({
  mapSource: readMapSourceFromStorage(),
  splashDismissed: readSplashDismissedFromStorage(),
  setSplashDismissed: (dismissed) =>
    set(() => {
      writeSplashDismissedToStorage(dismissed);
      return { splashDismissed: dismissed };
    }),
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

function readSplashDismissedFromStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SPLASH_DISMISSED_STORAGE_KEY) === "true";
}

function writeSplashDismissedToStorage(isDismissed: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    SPLASH_DISMISSED_STORAGE_KEY,
    isDismissed ? "true" : "false",
  );
}
