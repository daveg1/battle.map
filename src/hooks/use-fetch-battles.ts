import maplibregl from "maplibre-gl";
import data from "../data/battles.json";
import type { BattleItem, Point } from "../types/common";

function isPointInRadius(center: Point, pointToCheck: Point, radiusKm: number) {
  const centerPoint = new maplibregl.LngLat(center.lng, center.lat);
  const targetPoint = new maplibregl.LngLat(pointToCheck.lng, pointToCheck.lat);

  // distanceTo returns distance in meters
  const distance = centerPoint.distanceTo(targetPoint);
  return distance <= radiusKm * 1_000;
}

export function useFetchBattles() {
  function getBattles(center: Point, radius: number) {
    const battles: BattleItem[] = [];

    for (const entry of data) {
      // skip dupes
      if (battles.some((e) => e.name === entry.name)) {
        continue;
      }

      if (isPointInRadius(center, entry.coords, radius)) {
        battles.push(entry);
      }
    }

    return battles;
  }

  return [getBattles] as const;
}
