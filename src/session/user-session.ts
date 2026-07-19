import type { SavedPinItem } from "../types/common";
import type { SessionMapLayer } from "../types/viewer-state";

const STORAGE_KEY = "battlemap:session";
const SESSION_VERSION = 1;

interface UserSessionState {
  version: number;
  savedPins: SavedPinItem[];
  layer: SessionMapLayer;
}

export function getInitialUserSessionState() {
  return readUserSessionState();
}

export function saveSavedPinsState(savedPins: SavedPinItem[]) {
  const current = readUserSessionState();
  writeUserSessionState({
    ...current,
    savedPins,
  });
}

export function saveLayerState(layer: SessionMapLayer) {
  const current = readUserSessionState();
  writeUserSessionState({
    ...current,
    layer,
  });
}

function createDefaultUserSessionState(): UserSessionState {
  return {
    version: SESSION_VERSION,
    savedPins: [],
    layer: "positron",
  };
}

function readUserSessionState(): UserSessionState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultUserSessionState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserSessionState>;
    return {
      version: parsed.version ?? SESSION_VERSION,
      savedPins: parsed.savedPins ?? [],
      layer:
        parsed.layer === "positron" || parsed.layer === "dark-matter"
          ? parsed.layer
          : "positron",
    };
  } catch (error) {
    console.warn("Could not parse saved map session state.", error);
    return createDefaultUserSessionState();
  }
}

function writeUserSessionState(state: UserSessionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
