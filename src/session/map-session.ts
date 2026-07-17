import type { Point } from "../types/common";

const STORAGE_KEY = "battlemap:session";
const SESSION_VERSION = 1;

const DEFAULT_MAP_VIEW = {
  longitude: -2.099075,
  latitude: 57.149651,
  zoom: 12,
};

interface SessionMapView {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface SessionRadiusState {
  point: Point | null;
  size: number;
  searchSize: number;
}

export interface MapSessionState {
  version: number;
  map: SessionMapView;
  radius: SessionRadiusState;
}

export function getInitialMapViewState() {
  return readSessionState().map;
}

export function saveMapViewState(view: SessionMapView) {
  const current = readSessionState();
  writeSessionState({
    ...current,
    map: view,
  });
}

function createDefaultSessionState(): MapSessionState {
  return {
    version: SESSION_VERSION,
    map: DEFAULT_MAP_VIEW,
    radius: {
      point: null,
      size: 100,
      searchSize: 100,
    },
  };
}

function readSessionState(): MapSessionState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultSessionState();
  }

  try {
    return JSON.parse(raw) as MapSessionState;
  } catch (error) {
    console.warn("Could not parse saved map session state.", error);
    return createDefaultSessionState();
  }
}

function writeSessionState(state: MapSessionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
