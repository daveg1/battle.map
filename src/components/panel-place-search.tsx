import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { useState, type FormEvent } from "react";
import { usePlaceSearch } from "../hooks/use-place-search";
import type { SearchResultItem } from "../types/api";
import { useMapStore } from "../stores/use-map-store";
import { PanelSearchResults } from "./panel-search-results";

interface Props {
  mapRef: RefObject<MapRef | null>;
}

export function ControlPanelPlaceSearch({ mapRef }: Props) {
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(
    null,
  );
  const { query, setQuery, isFetching, isError, results } = usePlaceSearch();
  const setRadius = useMapStore((state) => state.setRadius);
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);

  function applyPlaceSelection(result: SearchResultItem) {
    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setSelectionError("The selected place has invalid coordinates.");
      return;
    }

    setRadius((current) => ({
      ...current,
      point: { lat, lng },
    }));
    clearSelectedMarker();

    const map = mapRef.current;
    if (map) {
      map.easeTo({
        center: [lng, lat],
        zoom: 8,
        duration: 600,
      });
    }

    setSelectionError(null);
  }

  function handlePlaceSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectionError(null);

    const resultToSelect = selectedResult ?? results[0] ?? null;
    if (!resultToSelect) {
      return;
    }

    applyPlaceSelection(resultToSelect);
  }

  const requestError = isError ? "Could not search places right now." : null;
  const placeError = selectionError ?? requestError;

  return (
    <form className="flex flex-col gap-2" onSubmit={handlePlaceSearchSubmit}>
      <span className="text-sm">Place</span>

      <PanelSearchResults
        query={query}
        isSearching={isFetching}
        results={results}
        onQueryChange={(value) => {
          setQuery(value);
          setSelectionError(null);
        }}
        onSelectedResultChange={setSelectedResult}
        onSelectResult={applyPlaceSelection}
      />

      {placeError && <p className="text-xs text-rose-300">{placeError}</p>}
    </form>
  );
}
