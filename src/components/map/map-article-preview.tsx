import { useArticlePreview } from "../../hooks/use-article-preview";

interface Props {
  articleTitle: string;
}

export function MapArticlePreview({ articleTitle }: Props) {
  const { data: preview, isLoading, isError } = useArticlePreview(articleTitle);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-32 w-70 animate-pulse rounded bg-stone-300/70" />
        <div className="h-12 w-70 animate-pulse rounded bg-stone-300/70" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-xs text-stone-500">Could not load article preview.</p>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {preview.thumbnail && (
        <img
          src={preview.thumbnail.source}
          alt={preview.title}
          width={preview.thumbnail.width}
          height={preview.thumbnail.height}
          className="max-h-32 w-full rounded object-cover"
          loading="lazy"
          decoding="async"
        />
      )}
      <p className="text-xs text-stone-700">{preview.extract}</p>
    </div>
  );
}
