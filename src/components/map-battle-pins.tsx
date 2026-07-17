import { Layer, Source } from "react-map-gl/maplibre";
import type { FeatureCollection, Point as GeoJsonPoint } from "geojson";
import type { BattleMarkerItem } from "../types/common";

export const BATTLE_SOURCE_ID = "battle-points";
export const BATTLE_CLUSTER_LAYER_ID = "battle-clusters";
export const BATTLE_CLUSTER_COUNT_LAYER_ID = "battle-cluster-count";
export const BATTLE_UNCLUSTERED_LAYER_ID = "battle-unclustered-point";
export const BATTLE_PIN_IMAGE_ID = "battle-pin-icon";

interface Props {
  markers: BattleMarkerItem[];
  savedMarkerIds: string[];
}

export function MapBattlePins({ markers, savedMarkerIds }: Props) {
  const savedMarkerIdSet = new Set(savedMarkerIds);
  const data: FeatureCollection<
    GeoJsonPoint,
    { markerIndex: number; isSaved: boolean }
  > = {
    type: "FeatureCollection",
    features: markers.map((marker, index) => ({
      type: "Feature" as const,
      properties: {
        markerIndex: index,
        isSaved: savedMarkerIdSet.has(marker.id),
      },
      geometry: {
        type: "Point" as const,
        coordinates: [marker.coords.lng, marker.coords.lat],
      },
    })),
  };

  return (
    <Source
      id={BATTLE_SOURCE_ID}
      type="geojson"
      data={data}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={20}
    >
      <Layer
        id={BATTLE_CLUSTER_LAYER_ID}
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#f59e0b",
            10,
            "#f97316",
            30,
            "#ea580c",
          ],
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 24],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        }}
      />

      <Layer
        id={BATTLE_CLUSTER_COUNT_LAYER_ID}
        type="symbol"
        filter={["has", "point_count"]}
        layout={{
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold"],
          "text-size": 12,
        }}
        paint={{
          "text-color": "#ffffff",
        }}
      />

      <Layer
        id={BATTLE_UNCLUSTERED_LAYER_ID}
        type="symbol"
        filter={["!", ["has", "point_count"]]}
        layout={{
          "icon-image": BATTLE_PIN_IMAGE_ID,
          "icon-size": 0.45,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        }}
      />
    </Source>
  );
}
