import type { SearchResultItem } from "../types/api";

const PLACE_SEARCH_BASE_URL = "https://nominatim.openstreetmap.org/search";
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

export function useSearchPlaces() {
  async function searchPlaces(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const params = new URLSearchParams({
      q: trimmedQuery,
      format: "jsonv2",
      limit: "6",
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

  return [searchPlaces] as const;
}
