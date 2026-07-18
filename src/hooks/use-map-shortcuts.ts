import { useCallback, useEffect } from "react";

interface Props {
  hasRadius: boolean;
  onEscape(): void;
  onFitRadius(): void;
}

// TODO: refactor to allow registering shortcuts
export function useMapShortcuts({ hasRadius, onEscape, onFitRadius }: Props) {
  // Handles global keyboard shortcuts (Escape to close popup, Alt+Enter to fit radius).
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.altKey && event.key === "Enter") {
        if (!hasRadius) return;

        event.preventDefault();
        onFitRadius();
      }
    },
    [hasRadius, onEscape, onFitRadius],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);
}
