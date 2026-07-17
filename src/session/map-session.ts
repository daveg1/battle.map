import type { Point, SavedPinItem } from "../types/common";

const STORAGE_KEY = "battlemap:session";
const SESSION_VERSION = 1;

const DEFAULT_MAP_VIEW = {
  longitude: -2.099075,
  latitude: 57.149651,
  zoom: 12,
};

const DEFAULT_RADIUS_STATE = {
  point: null,
  size: 100,
};

export interface SessionMapView {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface SessionRadiusState {
  point: Point | null;
  size: number;
}

export type SessionMapLayer = "positron" | "dark-matter";

export interface MapSessionState {
  version: number;
  map: SessionMapView;
  radius: SessionRadiusState;
  savedPins: SavedPinItem[];
  layer: SessionMapLayer;
}

export function getInitialSessionState() {
  return readSessionState();
}

export function saveMapViewState(view: SessionMapView) {
  const current = readSessionState();
  writeSessionState({
    ...current,
    map: view,
  });
}

export function saveRadiusState(radius: SessionRadiusState) {
  const current = readSessionState();
  writeSessionState({
    ...current,
    radius,
  });
}

export function saveSavedPinsState(savedPins: SavedPinItem[]) {
  const current = readSessionState();
  writeSessionState({
    ...current,
    savedPins,
  });
}

export function saveLayerState(layer: SessionMapLayer) {
  const current = readSessionState();
  writeSessionState({
    ...current,
    layer,
  });
}

function createDefaultSessionState(): MapSessionState {
  return {
    version: SESSION_VERSION,
    map: DEFAULT_MAP_VIEW,
    radius: DEFAULT_RADIUS_STATE,
    savedPins: [],
    layer: "positron",
  };
}

function readSessionState(): MapSessionState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultSessionState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MapSessionState>;
    return {
      version: parsed.version ?? SESSION_VERSION,
      map: {
        ...DEFAULT_MAP_VIEW,
        ...parsed.map,
      },
      radius: {
        ...DEFAULT_RADIUS_STATE,
        ...parsed.radius,
      },
      savedPins: parsed.savedPins ?? [],
      layer:
        parsed.layer === "positron" || parsed.layer === "dark-matter"
          ? parsed.layer
          : "positron",
    };
  } catch (error) {
    console.warn("Could not parse saved map session state.", error);
    return createDefaultSessionState();
  }
}

function writeSessionState(state: MapSessionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
