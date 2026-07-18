import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useSearchPlaces } from "../hooks/use-search-places";
import type { SearchResultItem } from "../types/api";
import type { Point } from "../types/common";
import { PanelDropdown } from "./panel-dropdown";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 3;

interface Props {
  onSetRadiusPoint(point: Point): void;
}

interface SearchOptions {
  showRequestError: boolean;
}

export function ControlPanelPlaceSearch({ onSetRadiusPoint }: Props) {
  const searchRequestIdRef = useRef(0);
  const skipNextAutoSearchRef = useRef(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placeResults, setPlaceResults] = useState<SearchResultItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(
    null,
  );
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [searchPlaces] = useSearchPlaces();

  function applyPlaceSelection(result: SearchResultItem) {
    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setPlaceError("The selected place has invalid coordinates.");
      return;
    }

    onSetRadiusPoint({ lat, lng });
    skipNextAutoSearchRef.current = true;
    setPlaceQuery(result.display_name || result.name || placeQuery);
    setPlaceError(null);
  }

  const runSearch = useCallback(
    async (
      query: string,
      options: SearchOptions,
    ): Promise<SearchResultItem[] | null> => {
      const requestId = ++searchRequestIdRef.current;

      try {
        const results = await searchPlaces(query);
        if (requestId !== searchRequestIdRef.current) {
          return null;
        }
        setPlaceResults(results);
        return results;
      } catch (error) {
        if (requestId !== searchRequestIdRef.current) {
          return null;
        }
        setPlaceResults([]);
        if (options.showRequestError) {
          console.error("Could not search places.", error);
          setPlaceError("Could not search places right now.");
        }
        return null;
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearchingPlace(false);
        }
      }
    },
    [searchPlaces],
  );

  useEffect(() => {
    const trimmedQuery = placeQuery.trim();
    if (!trimmedQuery) {
      searchRequestIdRef.current += 1;
      setIsSearchingPlace(false);
      setPlaceResults([]);
      setSelectedResult(null);
      return;
    }

    if (trimmedQuery.length < MIN_SEARCH_CHARS) {
      searchRequestIdRef.current += 1;
      setIsSearchingPlace(false);
      setPlaceResults([]);
      setSelectedResult(null);
      return;
    }

    if (skipNextAutoSearchRef.current) {
      skipNextAutoSearchRef.current = false;
      return;
    }

    setPlaceError(null);
    setIsSearchingPlace(true);

    const timeoutId = window.setTimeout(() => {
      void runSearch(trimmedQuery, { showRequestError: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [placeQuery, runSearch]);

  async function handlePlaceSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlaceError(null);

    const trimmedQuery = placeQuery.trim();
    if (!trimmedQuery) {
      return;
    }
    if (trimmedQuery.length < MIN_SEARCH_CHARS) {
      return;
    }

    let results = placeResults;
    if (results.length === 0) {
      setIsSearchingPlace(true);
      const fetchedResults = await runSearch(trimmedQuery, {
        showRequestError: true,
      });
      if (!fetchedResults) {
        return;
      }
      results = fetchedResults;
    }

    const resultToSelect = selectedResult ?? results[0] ?? null;
    if (!resultToSelect) {
      setPlaceError("No matching places found in Europe.");
      return;
    }

    applyPlaceSelection(resultToSelect);
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handlePlaceSearchSubmit}>
      <span className="text-sm">Place</span>

      <PanelDropdown
        query={placeQuery}
        minSearchChars={MIN_SEARCH_CHARS}
        isSearching={isSearchingPlace}
        results={placeResults}
        onQueryChange={(query) => {
          setPlaceQuery(query);
          setPlaceError(null);
        }}
        onSelectedResultChange={setSelectedResult}
        onSelectResult={applyPlaceSelection}
      />

      {placeError && <p className="text-xs text-rose-300">{placeError}</p>}
    </form>
  );
}
