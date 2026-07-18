import { useState, type SubmitEvent } from "react";
import { useSearchPlaces } from "../hooks/use-search-places";
import type { Point } from "../types/common";

interface Props {
  onSetRadiusPoint(point: Point): void;
}

export function ControlPanelPlaceSearch({ onSetRadiusPoint }: Props) {
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [searchPlaces] = useSearchPlaces();

  async function handlePlaceSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlaceError(null);
    setIsSearchingPlace(true);

    try {
      const results = await searchPlaces(placeQuery);
      const firstResult = results[0];

      if (!firstResult) {
        setPlaceError("No matching places found in Europe.");
        return;
      }

      const lat = Number.parseFloat(firstResult.lat);
      const lng = Number.parseFloat(firstResult.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setPlaceError("The selected place has invalid coordinates.");
        return;
      }

      onSetRadiusPoint({ lat, lng });
      setPlaceQuery(firstResult.display_name || firstResult.name || placeQuery);
    } catch (error) {
      console.error("Could not search places.", error);
      setPlaceError("Could not search places right now.");
    } finally {
      setIsSearchingPlace(false);
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handlePlaceSearchSubmit}>
      <span className="text-sm">Place</span>
      <input
        type="search"
        className="rounded bg-stone-700 px-2 py-1"
        placeholder="Search placename"
        value={placeQuery}
        onChange={(event) => setPlaceQuery(event.target.value)}
        disabled={isSearchingPlace}
      />
      {placeError && <p className="text-xs text-rose-300">{placeError}</p>}
    </form>
  );
}
