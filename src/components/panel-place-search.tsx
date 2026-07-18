import { useState, type FormEvent } from "react";
import { usePlaceSearch } from "../hooks/use-place-search";
import type { SearchResultItem } from "../types/api";
import type { Point } from "../types/common";
import { PanelDropdown } from "./panel-dropdown";

interface Props {
  onSetRadiusPoint(point: Point): void;
}

export function ControlPanelPlaceSearch({ onSetRadiusPoint }: Props) {
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(
    null,
  );
  const { query, setQuery, isFetching, isError, results } = usePlaceSearch();

  function applyPlaceSelection(result: SearchResultItem) {
    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setSelectionError("The selected place has invalid coordinates.");
      return;
    }

    onSetRadiusPoint({ lat, lng });
    setQuery(result.display_name || result.name || query);
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

      <PanelDropdown
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
