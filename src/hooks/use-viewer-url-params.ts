import type {
  SessionMapView,
  SessionRadiusState,
} from "../types/viewer-state";
import { writeMapViewToUrl, writeRadiusToUrl } from "../utils/viewer-url-state";

export function useViewerUrlParams() {
  function updateMapViewInUrl(view: SessionMapView) {
    writeMapViewToUrl(view);
  }

  function updateRadiusInUrl(radius: SessionRadiusState) {
    writeRadiusToUrl(radius);
  }

  return {
    updateMapViewInUrl,
    updateRadiusInUrl,
  };
}
