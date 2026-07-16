import { Layer, Source } from "react-map-gl/maplibre";

interface Props {
  source: "osm"; // | "other";
}

export function MapSource(_props: Props) {
  return (
    <Source
      id="osm-source"
      type="raster"
      tiles={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
      tileSize={256}
      attribution="&copy; OpenStreetMap"
    >
      <Layer type="raster" source="osm-source" />
    </Source>
  );
}
