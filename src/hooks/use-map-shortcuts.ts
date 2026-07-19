import { useEffect, useMemo } from "react";

interface Shortcut {
  key: string;
  alias?: string[];
  altKey?: boolean;
  onPress(): void;
  enabled?: boolean;
}

interface Props {
  shortcuts: Shortcut[];
}

// Registers Alt-based keyboard shortcuts.
export function useMapShortcuts({ shortcuts }: Props) {
  const activeShortcuts = useMemo(
    () => shortcuts.filter((shortcut) => shortcut.enabled !== false),
    [shortcuts],
  );

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      const shortcut = activeShortcuts.find(
        (entry) =>
          [entry.key, ...(entry.alias ?? [])].some(
            (candidate) => candidate.toLowerCase() === event.key.toLowerCase(),
          ),
      );

      if (!shortcut) {
        return;
      }

      if (shortcut.altKey === true && !event.altKey) {
        return;
      }

      if (shortcut.altKey !== true && event.altKey) {
        return;
      }

      event.preventDefault();
      shortcut.onPress();
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [activeShortcuts]);
}
