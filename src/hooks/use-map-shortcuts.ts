import { useCallback, useEffect } from "react";
import { useMapStore } from "../stores/use-map-store";

interface Props {
  hasRadius: boolean;
  onFitRadius(): void;
  onClearRadius(): void;
}

// TODO: refactor to allow registering shortcuts
export function useMapShortcuts({
  hasRadius,
  onFitRadius,
  onClearRadius,
}: Props) {
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);

  // Handles global keyboard shortcuts (Escape to close popup, Alt+Enter to fit radius, Alt+C to clear radius).
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearSelectedMarker();
        return;
      }

      if (event.altKey && event.key === "Enter") {
        if (!hasRadius) return;

        event.preventDefault();
        onFitRadius();
        return;
      }

      if (
        event.altKey &&
        ["c", "backspace"].includes(event.key.toLowerCase())
      ) {
        if (!hasRadius) return;

        event.preventDefault();
        onClearRadius();
      }
    },
    [clearSelectedMarker, hasRadius, onClearRadius, onFitRadius],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);
}
