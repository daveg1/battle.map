import { Layer, Source } from "react-map-gl/maplibre";
import type { Point } from "../types/common";
import * as turf from "@turf/turf";

interface Props {
  point: Point;
}

export function MapRadius({ point }: Props) {
  const circle = turf.circle([point.lng, point.lat], 100, {
    steps: 64, // Higher number = smoother circle
    units: "kilometers",
  });

  return (
    <Source id="search-zone-source" type="geojson" data={circle}>
      <Layer
        id="search-zone-fill"
        type="fill"
        paint={{
          "fill-color": "#3b82f6",
          "fill-opacity": 0.4,
        }}
      />
      <Layer
        id="search-zone-stroke"
        type="line"
        paint={{
          "line-color": "#1d4ed8",
          "line-width": 2,
        }}
      />
    </Source>
  );
}
