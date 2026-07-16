import maplibregl from "maplibre-gl";
import data from "../data/battles.json";

interface Point {
  lat: number;
  lng: number;
}

function isPointInRadius(center: Point, pointToCheck: Point, radiusKm: number) {
  const centerPoint = new maplibregl.LngLat(center.lng, center.lat);
  const targetPoint = new maplibregl.LngLat(pointToCheck.lng, pointToCheck.lat);

  // distanceTo returns distance in meters
  const distance = centerPoint.distanceTo(targetPoint);
  return distance <= radiusKm * 1_000;
}

export function useFetchBattles() {
  function getBattles(center: Point, radius: number) {
    const battles = data.filter((b) =>
      isPointInRadius(center, b.coords, radius),
    );

    return battles;
  }

  return [getBattles] as const;
}
