import { Layer, Source } from "react-map-gl/maplibre";

export type MapSourceType = "positron" | "dark-matter";

interface Props {
  source: MapSourceType;
}

const MAP_SOURCE_ID = "basemap-source";

const MAP_SOURCES: Record<MapSourceType, { tiles: string[] }> = {
  positron: {
    tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"],
  },
  "dark-matter": {
    tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"],
  },
};

export function MapSource({ source }: Props) {
  const selected = MAP_SOURCES[source];

  return (
    <Source
      id={MAP_SOURCE_ID}
      type="raster"
      tiles={selected.tiles}
      tileSize={256}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    >
      <Layer type="raster" source={MAP_SOURCE_ID} />
    </Source>
  );
}
