import clsx from "clsx";
import { Popover } from "radix-ui";
import { useEffect, useState, type KeyboardEvent } from "react";
import { PLACE_SEARCH_MIN_CHARS } from "../../hooks/use-place-search";
import type { SearchResultItem } from "../../types/api";
import { SelectableList } from "../ui/selectable-list";

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

  function handleInputFocusOrClick() {
    if (query.trim() && results.length > 0) {
      setIsOpen(true);
    }
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
    <>
      <span className="text-sm">Placename, address, or coordinates</span>

      <Popover.Root
        open={isOpen && Boolean(query.trim())}
        onOpenChange={setIsOpen}
        modal={false}
      >
        <Popover.Anchor asChild>
          <input
            name="place-search"
            type="search"
            className="w-full rounded bg-stone-700 px-2 py-1 text-sm leading-7"
            placeholder="Enter search..."
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              onQueryChange(nextQuery);
              setIsOpen(Boolean(nextQuery.trim()));
            }}
            onFocus={handleInputFocusOrClick}
            onClick={handleInputFocusOrClick}
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

            {!isSearching && (
              <SelectableList
                items={results}
                selectedIndex={selectedResultIndex}
                onSelectedIndexChange={setSelectedResultIndex}
                onItemMouseEnter={(_, index) => setSelectedResultIndex(index)}
                onItemClick={(result) => {
                  onSelectResult(result);
                  setIsOpen(false);
                }}
                getItemKey={(result) => result.place_id}
                enableKeyboardNavigation={false}
                tabIndex={-1}
                itemClassName={({ isSelected }) =>
                  clsx(
                    "w-full px-2 py-2 text-left text-sm text-stone-300 hover:bg-stone-700/70 focus:bg-stone-700/70 focus:outline-none",
                    isSelected && "bg-stone-700/70",
                  )
                }
              >
                {({ item: result }) => result.display_name || result.name}
              </SelectableList>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
