import type {
  SessionMapView,
  SessionRadiusState,
} from "../types/viewer-state";

const MAP_LONGITUDE_PARAM = "lng";
const MAP_LATITUDE_PARAM = "lat";
const MAP_ZOOM_PARAM = "z";
const RADIUS_LONGITUDE_PARAM = "rlng";
const RADIUS_LATITUDE_PARAM = "rlat";
const RADIUS_SIZE_PARAM = "rkm";

export function readMapViewFromUrl(): SessionMapView | null {
  const params = new URLSearchParams(window.location.search);
  const longitude = parseNumber(params.get(MAP_LONGITUDE_PARAM));
  const latitude = parseNumber(params.get(MAP_LATITUDE_PARAM));
  const zoom = parseNumber(params.get(MAP_ZOOM_PARAM));

  if (
    !isFiniteNumber(longitude) ||
    !isFiniteNumber(latitude) ||
    !isFiniteNumber(zoom)
  ) {
    return null;
  }

  return { longitude, latitude, zoom };
}

export function readRadiusFromUrl(): SessionRadiusState | null {
  const params = new URLSearchParams(window.location.search);
  const lng = parseNumber(params.get(RADIUS_LONGITUDE_PARAM));
  const lat = parseNumber(params.get(RADIUS_LATITUDE_PARAM));
  const size = parseNumber(params.get(RADIUS_SIZE_PARAM));

  if (
    !isFiniteNumber(lng) ||
    !isFiniteNumber(lat) ||
    !isFiniteNumber(size) ||
    size <= 0
  ) {
    return null;
  }

  return {
    point: { lng, lat },
    size,
  };
}

export function writeMapViewToUrl(view: SessionMapView) {
  replaceUrlSearchParams((params) => {
    params.set(MAP_LONGITUDE_PARAM, formatNumber(view.longitude, 6));
    params.set(MAP_LATITUDE_PARAM, formatNumber(view.latitude, 6));
    params.set(MAP_ZOOM_PARAM, formatNumber(view.zoom, 2));
  });
}

export function writeRadiusToUrl(radius: SessionRadiusState) {
  replaceUrlSearchParams((params) => {
    if (!radius.point) {
      params.delete(RADIUS_LONGITUDE_PARAM);
      params.delete(RADIUS_LATITUDE_PARAM);
      params.delete(RADIUS_SIZE_PARAM);
      return;
    }

    params.set(RADIUS_LONGITUDE_PARAM, formatNumber(radius.point.lng, 6));
    params.set(RADIUS_LATITUDE_PARAM, formatNumber(radius.point.lat, 6));
    params.set(RADIUS_SIZE_PARAM, formatNumber(radius.size, 2));
  });
}

function replaceUrlSearchParams(update: (params: URLSearchParams) => void) {
  const url = new URL(window.location.href);
  update(url.searchParams);
  const search = url.searchParams.toString();
  const nextUrl = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

function parseNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function formatNumber(value: number, decimals: number) {
  return value.toFixed(decimals);
}
