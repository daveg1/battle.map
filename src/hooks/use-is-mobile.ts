import { useEffect, useState } from "react";

export const DEFAULT_MOBILE_MEDIA_QUERY = "(max-width: 1023px)";

function getMatches(mediaQuery: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(mediaQuery).matches;
}

export function useIsMobile(mediaQuery = DEFAULT_MOBILE_MEDIA_QUERY) {
  const [isMobile, setIsMobile] = useState(() => getMatches(mediaQuery));

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    const updateMatches = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", updateMatches);

    return () => {
      mediaQueryList.removeEventListener("change", updateMatches);
    };
  }, [mediaQuery]);

  return isMobile;
}
