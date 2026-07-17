import { Layer, Source } from "react-map-gl/maplibre";
import type { Point } from "../types/common";
import * as turf from "@turf/turf";

interface Props {
  point: Point;
  size: number;
}

export function MapRadius({ point, size }: Props) {
  const circle = turf.circle([point.lng, point.lat], size, {
    steps: 64, // Higher number = smoother circle
    units: "kilometers",
  });

  return (
    <Source id="search-zone-source" type="geojson" data={circle}>
      <Layer
        id="search-zone-fill"
        type="fill"
        paint={{
          "fill-color": "#60758d",
          "fill-opacity": 0.24,
        }}
      />
      <Layer
        id="search-zone-stroke"
        type="line"
        paint={{
          "line-color": "#4f647b",
          "line-width": 2,
        }}
      />
    </Source>
  );
}
