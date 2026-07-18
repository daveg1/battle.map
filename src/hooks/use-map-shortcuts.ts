import { useCallback, useEffect } from "react";
import { useMapStore } from "../stores/use-map-store";

interface Props {
  hasRadius: boolean;
  onFitRadius(): void;
}

// TODO: refactor to allow registering shortcuts
export function useMapShortcuts({ hasRadius, onFitRadius }: Props) {
  const clearSelectedMarker = useMapStore((state) => state.clearSelectedMarker);

  // Handles global keyboard shortcuts (Escape to close popup, Alt+Enter to fit radius).
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
      }
    },
    [clearSelectedMarker, hasRadius, onFitRadius],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);
}
