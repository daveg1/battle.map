import { Layer, Source } from "react-map-gl/maplibre";

interface Props {
  source: "positron";
}

export function MapSource(_props: Props) {
  return (
    <Source
      id="positron-source"
      type="raster"
      tiles={["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"]}
      tileSize={256}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    >
      <Layer type="raster" source="positron-source" />
    </Source>
  );
}
