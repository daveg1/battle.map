import clsx from "clsx";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useSearchPlaces } from "../hooks/use-search-places";
import type { SearchResultItem } from "../types/api";
import type { Point } from "../types/common";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 3;

interface Props {
  onSetRadiusPoint(point: Point): void;
}

interface SearchOptions {
  showRequestError: boolean;
}

export function ControlPanelPlaceSearch({ onSetRadiusPoint }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRequestIdRef = useRef(0);
  const skipNextAutoSearchRef = useRef(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placeResults, setPlaceResults] = useState<SearchResultItem[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
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
        setSelectedResultIndex(results.length > 0 ? 0 : -1);
        return results;
      } catch (error) {
        if (requestId !== searchRequestIdRef.current) {
          return null;
        }
        setPlaceResults([]);
        setSelectedResultIndex(-1);
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
      setSelectedResultIndex(-1);
      setIsResultsOpen(false);
      return;
    }

    if (trimmedQuery.length < MIN_SEARCH_CHARS) {
      searchRequestIdRef.current += 1;
      setIsSearchingPlace(false);
      setPlaceResults([]);
      setSelectedResultIndex(-1);
      setIsResultsOpen(true);
      return;
    }

    if (skipNextAutoSearchRef.current) {
      skipNextAutoSearchRef.current = false;
      return;
    }

    setPlaceError(null);
    setIsSearchingPlace(true);
    setIsResultsOpen(true);

    const timeoutId = window.setTimeout(() => {
      void runSearch(trimmedQuery, { showRequestError: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [placeQuery, runSearch]);

  function handleContainerBlur(event: FocusEvent<HTMLDivElement>) {
    const nextElement = event.relatedTarget;
    if (
      nextElement instanceof Node &&
      containerRef.current?.contains(nextElement)
    ) {
      return;
    }
    setIsResultsOpen(false);
  }

  async function handlePlaceSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlaceError(null);

    const trimmedQuery = placeQuery.trim();
    if (!trimmedQuery) {
      return;
    }
    if (trimmedQuery.length < MIN_SEARCH_CHARS) {
      setIsResultsOpen(true);
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

    const selectedResult =
      results[selectedResultIndex] ?? results[0] ?? null;
    if (!selectedResult) {
      setPlaceError("No matching places found in Europe.");
      setIsResultsOpen(true);
      return;
    }

    applyPlaceSelection(selectedResult);
    setIsResultsOpen(true);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isResultsOpen || placeResults.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedResultIndex((current) =>
        current < 0 || current >= placeResults.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedResultIndex((current) =>
        current <= 0 ? placeResults.length - 1 : current - 1,
      );
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handlePlaceSearchSubmit}>
      <span className="text-sm">Place</span>
      <div className="relative" ref={containerRef} onBlur={handleContainerBlur}>
        <input
          type="search"
          className="w-full rounded bg-stone-700 px-2 py-1"
          placeholder="Search placename"
          value={placeQuery}
          onChange={(event) => {
            setPlaceQuery(event.target.value);
            setPlaceError(null);
          }}
          onFocus={() => {
            if (placeQuery.trim()) {
              setIsResultsOpen(true);
            }
          }}
          onKeyDown={handleInputKeyDown}
        />
        {isResultsOpen && placeQuery.trim() && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border border-stone-700 bg-stone-800 shadow-lg">
            {placeQuery.trim().length < MIN_SEARCH_CHARS && (
              <p className="px-2 py-2 text-sm text-stone-300">
                Type at least {MIN_SEARCH_CHARS} characters to search.
              </p>
            )}
            {isSearchingPlace && (
              <p className="px-2 py-2 text-sm text-stone-300">Searching...</p>
            )}
            {!isSearchingPlace &&
              placeQuery.trim().length >= MIN_SEARCH_CHARS &&
              placeResults.length === 0 && (
              <p className="px-2 py-2 text-sm text-stone-300">
                No matching places found in Europe.
              </p>
              )}
            {!isSearchingPlace &&
              placeResults.map((result, index) => (
                <button
                  key={result.place_id}
                  type="button"
                  className={clsx(
                    "w-full cursor-pointer px-2 py-2 text-left text-sm hover:bg-stone-700/70 focus:bg-stone-700/70 focus:outline-none",
                    selectedResultIndex === index && "bg-stone-700/70",
                  )}
                  onMouseEnter={() => setSelectedResultIndex(index)}
                  onClick={() => {
                    applyPlaceSelection(result);
                    setIsResultsOpen(false);
                  }}
                >
                  {result.display_name || result.name}
                </button>
              ))}
          </div>
        )}
      </div>
      {placeError && <p className="text-xs text-rose-300">{placeError}</p>}
    </form>
  );
}
