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
  const centerPoint = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [point.lng, point.lat],
        },
        properties: {},
      },
    ],
  };

  return (
    <>
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

      <Source id="search-zone-center-source" type="geojson" data={centerPoint}>
        <Layer
          id="search-zone-center-dot"
          type="circle"
          paint={{
            "circle-radius": 3,
            "circle-color": "#4f647b",
            "circle-opacity": 0.7,
          }}
        />
      </Source>
    </>
  );
}
