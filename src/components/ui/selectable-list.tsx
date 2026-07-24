import clsx from "clsx";
import {
  type KeyboardEvent,
  type ReactNode,
  type Key,
} from "react";

interface ItemRenderProps<TItem> {
  item: TItem;
  index: number;
  isSelected: boolean;
}

interface Props<TItem> {
  items: TItem[];
  selectedIndex: number;
  onSelectedIndexChange(index: number): void;
  getItemKey?(item: TItem, index: number): Key;
  className?: string;
  itemClassName?:
    | string
    | ((props: ItemRenderProps<TItem>) => string | undefined);
  orientation?: "horizontal" | "vertical";
  children(props: ItemRenderProps<TItem>): ReactNode;
}

export function SelectableList<TItem>({
  items,
  selectedIndex,
  onSelectedIndexChange,
  getItemKey,
  className,
  itemClassName,
  orientation = "vertical",
  children,
}: Props<TItem>) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (items.length === 0) {
      return;
    }

    if (
      (orientation === "vertical" && event.key === "ArrowDown") ||
      (orientation === "horizontal" && event.key === "ArrowRight")
    ) {
      event.preventDefault();
      onSelectedIndexChange(Math.min(items.length - 1, selectedIndex + 1));
      return;
    }

    if (
      (orientation === "vertical" && event.key === "ArrowUp") ||
      (orientation === "horizontal" && event.key === "ArrowLeft")
    ) {
      event.preventDefault();
      onSelectedIndexChange(Math.max(0, selectedIndex - 1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      onSelectedIndexChange(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      onSelectedIndexChange(items.length - 1);
    }
  }

  return (
    <div
      role="listbox"
      tabIndex={0}
      aria-orientation={orientation}
      className={className}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const isSelected = selectedIndex === index;
        const renderedItemClassName =
          typeof itemClassName === "function"
            ? itemClassName({ item, index, isSelected })
            : itemClassName;

        return (
          <button
            key={getItemKey ? getItemKey(item, index) : index}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelectedIndexChange(index)}
            className={clsx("cursor-pointer", renderedItemClassName)}
          >
            {children({ item, index, isSelected })}
          </button>
        );
      })}
    </div>
  );
}
