import maplibregl from "maplibre-gl";
import data from "../data/battles.json";
import type { BattleMarkerItem, Point } from "../types/common";

const MERGE_MARKER_DISTANCE_METERS = 50;

function isPointInRadius(center: Point, pointToCheck: Point, radiusKm: number) {
  const centerPoint = new maplibregl.LngLat(center.lng, center.lat);
  const targetPoint = new maplibregl.LngLat(pointToCheck.lng, pointToCheck.lat);

  // distanceTo returns distance in meters
  const distance = centerPoint.distanceTo(targetPoint);
  return distance <= radiusKm * 1_000;
}

function arePointsNearby(pointA: Point, pointB: Point, maxDistanceMeters: number) {
  const source = new maplibregl.LngLat(pointA.lng, pointA.lat);
  const target = new maplibregl.LngLat(pointB.lng, pointB.lat);
  return source.distanceTo(target) <= maxDistanceMeters;
}

export function useFetchBattles() {
  function getBattleMarkers(center: Point, radius: number) {
    const markers: BattleMarkerItem[] = [];
    const seenBattleNames = new Set<string>();

    for (const entry of data) {
      // skip dupes
      if (seenBattleNames.has(entry.name)) {
        continue;
      }
      seenBattleNames.add(entry.name);

      if (isPointInRadius(center, entry.coords, radius)) {
        const marker = markers.find((candidate) =>
          arePointsNearby(
            candidate.coords,
            entry.coords,
            MERGE_MARKER_DISTANCE_METERS,
          ),
        );

        if (marker) {
          const markerBattleCount = marker.battles.length;
          marker.battles.push(entry);
          marker.coords = {
            lng:
              (marker.coords.lng * markerBattleCount + entry.coords.lng) /
              (markerBattleCount + 1),
            lat:
              (marker.coords.lat * markerBattleCount + entry.coords.lat) /
              (markerBattleCount + 1),
          };
          continue;
        }

        markers.push({
          coords: entry.coords,
          battles: [entry],
        });
      }
    }

    return markers;
  }

  return [getBattleMarkers] as const;
}
