import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const ARTICLE_PREVIEW_STALE_TIME_MS = 60_000;

interface WikipediaSummaryResponse {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

export interface ArticlePreview {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

/**
 * Converts incoming article input into a canonical Wikipedia page title.
 * Accepts either a plain title or a full Wikipedia URL and returns the
 * decoded title segment used by the summary endpoint.
 */
function normalizeArticleTitle(articleTitle: string) {
  const trimmedTitle = articleTitle.trim();
  if (!trimmedTitle) {
    return "";
  }

  if (URL.canParse(trimmedTitle)) {
    const url = new URL(trimmedTitle);
    if (
      url.hostname.endsWith("wikipedia.org") &&
      url.pathname.startsWith("/wiki/")
    ) {
      return decodeURIComponent(url.pathname.slice("/wiki/".length));
    }
  }

  return trimmedTitle;
}

/**
 * Fetches a page summary from Wikipedia REST and maps it to ArticlePreview.
 * Throws when the request is not successful so callers can surface errors.
 */
async function fetchArticlePreview(
  articleTitle: string,
): Promise<ArticlePreview> {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(articleTitle)}`,
    {
      headers: {
        "Api-User-Agent": "battle-map/1.0",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Article preview failed with status ${response.status}.`);
  }

  const data = (await response.json()) as WikipediaSummaryResponse;
  return {
    title: data.title,
    extract: data.extract,
    thumbnail: data.thumbnail,
  };
}

/**
 * React Query hook for retrieving and caching Wikipedia article previews.
 * It normalizes incoming input, conditionally fetches when non-empty, and
 * returns both query status flags and the mapped preview payload.
 */
export function useArticlePreview(articleTitle: string) {
  const normalizedArticleTitle = useMemo(
    () => normalizeArticleTitle(articleTitle),
    [articleTitle],
  );
  const canFetch = normalizedArticleTitle.length > 0;

  const queryState = useQuery({
    queryKey: ["article-preview", normalizedArticleTitle],
    queryFn: () => fetchArticlePreview(normalizedArticleTitle),
    enabled: canFetch,
    staleTime: ARTICLE_PREVIEW_STALE_TIME_MS,
  });

  return {
    data: canFetch ? (queryState.data ?? null) : null,
    isLoading: queryState.isPending,
    isFetching: queryState.isFetching,
    isError: queryState.isError,
    isSuccess: queryState.isSuccess,
    error: queryState.error,
    refetch: queryState.refetch,
  };
}
