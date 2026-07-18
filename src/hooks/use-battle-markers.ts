import maplibregl from "maplibre-gl";
import { useMemo } from "react";
import data from "../data/battles.json";
import type { BattleMarkerItem, Point, SavedPinItem } from "../types/common";

const MERGE_MARKER_DISTANCE_METERS = 50;

function isPointInRadius(center: Point, pointToCheck: Point, radiusKm: number) {
  const centerPoint = new maplibregl.LngLat(center.lng, center.lat);
  const targetPoint = new maplibregl.LngLat(pointToCheck.lng, pointToCheck.lat);

  // distanceTo returns distance in meters
  const distance = centerPoint.distanceTo(targetPoint);
  return distance <= radiusKm * 1_000;
}

function arePointsNearby(
  pointA: Point,
  pointB: Point,
  maxDistanceMeters: number,
) {
  const source = new maplibregl.LngLat(pointA.lng, pointA.lat);
  const target = new maplibregl.LngLat(pointB.lng, pointB.lat);
  return source.distanceTo(target) <= maxDistanceMeters;
}

function createMarkerId(marker: BattleMarkerItem) {
  return marker.battles
    .map((battle) => battle.name)
    .sort((a, b) => a.localeCompare(b))
    .join("::");
}

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
        id: entry.name,
        coords: entry.coords,
        battles: [entry],
      });
    }
  }

  return markers.map((marker) => ({
    ...marker,
    id: createMarkerId(marker),
  }));
}

interface UseBattleMarkersProps {
  radiusPoint: Point | null;
  radiusSize: number;
  savedPins: SavedPinItem[];
}

export function useBattleMarkers({
  radiusPoint,
  radiusSize,
  savedPins,
}: UseBattleMarkersProps) {
  const battleMarkers = useMemo(() => {
    if (!radiusPoint) return [];
    return getBattleMarkers(radiusPoint, radiusSize);
  }, [radiusPoint, radiusSize]);

  const visibleMarkers = useMemo(() => {
    const markers: BattleMarkerItem[] = [...battleMarkers];

    for (const savedPin of savedPins) {
      const alreadyVisible = markers.some(
        (marker) => marker.id === savedPin.id,
      );
      if (alreadyVisible) continue;

      markers.push({
        id: savedPin.id,
        coords: savedPin.coords,
        battles: savedPin.battles,
      });
    }

    return markers;
  }, [battleMarkers, savedPins]);

  return [visibleMarkers] as const;
}
