import type { Point } from "./common";

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

export const DEFAULT_MAP_VIEW: SessionMapView = {
  longitude: -2.099075,
  latitude: 57.149651,
  zoom: 12,
};

export const DEFAULT_RADIUS_STATE: SessionRadiusState = {
  point: null,
  size: 100,
};

export const MIN_RADIUS_KM = 1;
export const MAX_RADIUS_KM = 350;
