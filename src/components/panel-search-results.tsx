import clsx from "clsx";
import { Popover } from "radix-ui";
import { useEffect, useState, type KeyboardEvent } from "react";
import { PLACE_SEARCH_MIN_CHARS } from "../hooks/use-place-search";
import type { SearchResultItem } from "../types/api";

interface Props {
  query: string;
  isSearching: boolean;
  results: SearchResultItem[];
  onQueryChange(query: string): void;
  onSelectResult(result: SearchResultItem): void;
  onSelectedResultChange(result: SearchResultItem | null): void;
}

export function PanelSearchResults({
  query,
  isSearching,
  results,
  onQueryChange,
  onSelectResult,
  onSelectedResultChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  useEffect(() => {
    setSelectedResultIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  useEffect(() => {
    onSelectedResultChange(results[selectedResultIndex] ?? null);
  }, [onSelectedResultChange, results, selectedResultIndex]);

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
    <Popover.Root
      open={isOpen && Boolean(query.trim())}
      onOpenChange={setIsOpen}
      modal={false}
    >
      <Popover.Anchor asChild>
        <input
          type="search"
          className="w-full rounded bg-stone-700 px-2 py-1"
          placeholder="Search placename"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            onQueryChange(nextQuery);
            setIsOpen(Boolean(nextQuery.trim()));
          }}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleInputKeyDown}
        />
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="z-20 max-h-60 w-(--radix-popover-trigger-width) overflow-y-auto rounded border border-stone-700 bg-stone-800 shadow-lg"
        >
          {query.trim().length < PLACE_SEARCH_MIN_CHARS && (
            <p className="px-2 py-2 text-sm text-stone-300">
              Type at least {PLACE_SEARCH_MIN_CHARS} characters to search.
            </p>
          )}

          {isSearching && (
            <p className="px-2 py-2 text-sm text-stone-300">Searching...</p>
          )}

          {!isSearching &&
            query.trim().length >= PLACE_SEARCH_MIN_CHARS &&
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
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
