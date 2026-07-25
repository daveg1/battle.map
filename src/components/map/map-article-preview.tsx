import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useArticlePreview } from "../../hooks/use-article-preview";
import { Skeleton } from "../ui/skeleton";
import clsx from "clsx";

interface Props {
  articleTitle: string;
  showMediaRow: boolean;
}

export function MapArticlePreview({ articleTitle, showMediaRow }: Props) {
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
        {showMediaRow && <Skeleton className="h-32" />}
        <Skeleton className="h-20" />
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
  const isMediaRowVisible = showMediaRow || !!preview.thumbnail;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={clsx(
          `w-full overflow-hidden transition-all duration-300 ease-in-out`,
          isMediaRowVisible ? "h-32 opacity-100" : "h-0 opacity-0",
        )}
      >
        {preview.thumbnail ? (
          <button
            type="button"
            className="group relative h-full w-full cursor-zoom-in rounded"
            onClick={() => setIsImageOverlayOpen(true)}
            aria-label={`Expand image for ${preview.title}`}
          >
            <img
              src={preview.thumbnail.source}
              alt={preview.title}
              width={preview.thumbnail.width}
              height={preview.thumbnail.height}
              className="h-full w-full rounded object-cover select-none"
              loading="lazy"
              decoding="async"
              draggable={false}
            />

            <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-black/0 text-sm font-semibold text-white opacity-0 transition-all duration-200 group-hover:bg-black/60 group-hover:opacity-100">
              Click to expand
            </span>
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-stone-200/45 text-xs text-stone-500">
            No image for this battle
          </div>
        )}
      </div>

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
