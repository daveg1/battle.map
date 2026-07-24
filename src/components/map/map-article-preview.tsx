import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useArticlePreview } from "../../hooks/use-article-preview";

interface Props {
  articleTitle: string;
}

export function MapArticlePreview({ articleTitle }: Props) {
  const { data: preview, isLoading, isError } = useArticlePreview(articleTitle);
  const [isImageOverlayOpen, setIsImageOverlayOpen] = useState(false);

  useEffect(() => {
    setIsImageOverlayOpen(false);
  }, [articleTitle]);

  useEffect(() => {
    if (!isImageOverlayOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setIsImageOverlayOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isImageOverlayOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-32 w-full animate-pulse rounded bg-stone-300/70" />
        <div className="h-20 w-full animate-pulse rounded bg-stone-300/70" />
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

  const expandedImageSource = preview.thumbnail?.source.replace(
    /\/\d+px-/,
    "/960px-",
  );

  return (
    <div className="flex flex-col gap-2">
      {preview.thumbnail && (
        <button
          type="button"
          className="group relative cursor-zoom-in rounded"
          onClick={() => setIsImageOverlayOpen(true)}
          aria-label={`Expand image for ${preview.title}`}
        >
          <img
            src={preview.thumbnail.source}
            alt={preview.title}
            width={preview.thumbnail.width}
            height={preview.thumbnail.height}
            className="max-h-32 w-full rounded object-cover select-none"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-black/0 text-sm font-semibold text-white opacity-0 transition-all duration-200 group-hover:bg-black/60 group-hover:opacity-100">
            Click to expand
          </span>
        </button>
      )}
      <p className="line-clamp-5 h-20 text-xs text-stone-700">
        {preview.extract}
      </p>

      {isImageOverlayOpen &&
        expandedImageSource &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"
            onClick={() => setIsImageOverlayOpen(false)}
            role="presentation"
          >
            <img
              src={expandedImageSource}
              alt={preview.title}
              className="max-h-[85vh] max-w-[85vw] rounded object-contain select-none"
              draggable={false}
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
