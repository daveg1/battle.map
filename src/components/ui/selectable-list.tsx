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
  onItemClick?(item: TItem, index: number): void;
  onItemMouseEnter?(item: TItem, index: number): void;
  getItemKey?(item: TItem, index: number): Key;
  className?: string;
  itemClassName?:
    | string
    | ((props: ItemRenderProps<TItem>) => string | undefined);
  orientation?: "horizontal" | "vertical";
  enableKeyboardNavigation?: boolean;
  tabIndex?: number;
  children(props: ItemRenderProps<TItem>): ReactNode;
}

export function SelectableList<TItem>({
  items,
  selectedIndex,
  onSelectedIndexChange,
  onItemClick,
  onItemMouseEnter,
  getItemKey,
  className,
  itemClassName,
  orientation = "vertical",
  enableKeyboardNavigation = true,
  tabIndex = 0,
  children,
}: Props<TItem>) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!enableKeyboardNavigation) {
      return;
    }

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
      tabIndex={tabIndex}
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
            onMouseEnter={() => onItemMouseEnter?.(item, index)}
            onClick={() => {
              onSelectedIndexChange(index);
              onItemClick?.(item, index);
            }}
            className={clsx("cursor-pointer", renderedItemClassName)}
          >
            {children({ item, index, isSelected })}
          </button>
        );
      })}
    </div>
  );
}
