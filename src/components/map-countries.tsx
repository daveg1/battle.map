import { Layer, Source } from "react-map-gl/maplibre";
import geojson from "../data/europe.geo.json";

interface Props {
  hoveredCountryId?: number;
}

export function MapCountries({ hoveredCountryId }: Props) {
  return (
    <Source type="geojson" data={geojson as unknown as string}>
      <Layer
        id="countries-fill"
        type="fill"
        paint={{
          "fill-color": "#FF0000",
          "fill-opacity": [
            "case",
            // TODO: fix
            ["==", ["id"], hoveredCountryId || ""],
            0.8,
            0.2,
          ], // Adjust this for desired transparency
          "fill-outline-color": "#000000", // Optional: adds a border
        }}
      />
    </Source>
  );
}
