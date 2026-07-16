import { Map } from "react-map-gl/maplibre";
import { useScreenSize } from "./hooks/use-screen-size";
import { useState } from "react";
import { MapSource } from "./components/map-source";

function App() {
  const { width, height } = useScreenSize();
  const [zoom, _setZoom] = useState(12);
  const [source, _setSource] = useState("osm" as const);

  return (
    <>
      <Map
        initialViewState={{
          longitude: -2.099075,
          latitude: 57.149651,
          zoom,
        }}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <MapSource source={source} />
      </Map>
    </>
  );
}

export default App;
