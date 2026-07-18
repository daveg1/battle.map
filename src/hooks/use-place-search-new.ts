import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { useMemo, useState } from "react";
import type { SearchResultItem } from "../types/api";

const PLACE_SEARCH_BASE_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 6;
export const PLACE_SEARCH_MIN_CHARS = 3;
const EUROPE_BOUNDS = {
  minLat: 34,
  maxLat: 72,
  minLng: -31,
  maxLng: 45,
};

function isInEurope(lat: number, lng: number) {
  return (
    lat >= EUROPE_BOUNDS.minLat &&
    lat <= EUROPE_BOUNDS.maxLat &&
    lng >= EUROPE_BOUNDS.minLng &&
    lng <= EUROPE_BOUNDS.maxLng
  );
}

async function fetchPlaces(query: string, limit: number) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: String(limit),
  });

  const response = await fetch(`${PLACE_SEARCH_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Place search failed with status ${response.status}.`);
  }

  const results = (await response.json()) as SearchResultItem[];
  return results.filter((result) => {
    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) && isInEurope(lat, lng);
  });
}

interface UsePlaceSearchNewOptions {
  debounceMs?: number;
  limit?: number;
  enabled?: boolean;
  initialQuery?: string;
}

export function usePlaceSearchNew(options: UsePlaceSearchNewOptions = {}) {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    limit = DEFAULT_LIMIT,
    enabled = true,
    initialQuery = "",
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, debounceMs);

  const normalizedQuery = useMemo(
    () => debouncedQuery.trim(),
    [debouncedQuery],
  );
  const canSearch = enabled && normalizedQuery.length >= PLACE_SEARCH_MIN_CHARS;

  const queryState = useQuery({
    queryKey: ["place-search", normalizedQuery, limit],
    queryFn: () => fetchPlaces(normalizedQuery, limit),
    enabled: canSearch,
    staleTime: 60_000,
    gcTime: 300_000,
  });

  return {
    query,
    setQuery,
    canSearch,
    normalizedQuery,
    isLoading: queryState.isPending,
    isFetching: queryState.isFetching,
    isError: queryState.isError,
    isSuccess: queryState.isSuccess,
    error: queryState.error,
    results: canSearch ? (queryState.data ?? []) : [],
    refetch: queryState.refetch,
  };
}
