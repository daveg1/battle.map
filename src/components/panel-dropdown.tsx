import clsx from "clsx";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import type { SearchResultItem } from "../types/api";

interface Props {
  query: string;
  minSearchChars: number;
  isSearching: boolean;
  results: SearchResultItem[];
  onQueryChange(query: string): void;
  onSelectResult(result: SearchResultItem): void;
  onSelectedResultChange(result: SearchResultItem | null): void;
}

export function PanelDropdown({
  query,
  minSearchChars,
  isSearching,
  results,
  onQueryChange,
  onSelectResult,
  onSelectedResultChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  useEffect(() => {
    setSelectedResultIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  useEffect(() => {
    onSelectedResultChange(results[selectedResultIndex] ?? null);
  }, [onSelectedResultChange, results, selectedResultIndex]);

  function handleContainerBlur(event: FocusEvent<HTMLDivElement>) {
    const nextElement = event.relatedTarget;
    if (
      nextElement instanceof Node &&
      containerRef.current?.contains(nextElement)
    ) {
      return;
    }
    setIsOpen(false);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedResultIndex((current) =>
        current < 0 || current >= results.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedResultIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1,
      );
    }
  }

  return (
    <div className="relative" ref={containerRef} onBlur={handleContainerBlur}>
      <input
        type="search"
        className="w-full rounded bg-stone-700 px-2 py-1"
        placeholder="Search placename"
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
        }}
        onFocus={() => {
          if (query.trim()) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleInputKeyDown}
      />
      {isOpen && query.trim() && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border border-stone-700 bg-stone-800 shadow-lg">
          {query.trim().length < minSearchChars && (
            <p className="px-2 py-2 text-sm text-stone-300">
              Type at least {minSearchChars} characters to search.
            </p>
          )}

          {isSearching && (
            <p className="px-2 py-2 text-sm text-stone-300">Searching...</p>
          )}

          {!isSearching &&
            query.trim().length >= minSearchChars &&
            results.length === 0 && (
              <p className="px-2 py-2 text-sm text-stone-300">
                No matching places found in Europe.
              </p>
            )}

          {!isSearching &&
            results.map((result, index) => (
              <button
                key={result.place_id}
                type="button"
                className={clsx(
                  "w-full cursor-pointer px-2 py-2 text-left text-sm hover:bg-stone-700/70 focus:bg-stone-700/70 focus:outline-none",
                  selectedResultIndex === index && "bg-stone-700/70",
                )}
                onMouseEnter={() => setSelectedResultIndex(index)}
                onClick={() => {
                  onSelectResult(result);
                  setIsOpen(false);
                }}
              >
                {result.display_name || result.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
