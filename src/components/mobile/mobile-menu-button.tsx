import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface MobileMenuButtonProps {
  title: string;
  disabled?: boolean;
  isActive?: boolean;
  isSplit?: boolean;
  isSplitOpen?: boolean;
  onClick(): void;
}

const MENU_BUTTON_BASE_CLASS =
  "cursor-pointer rounded bg-stone-700 text-sm enabled:hover:bg-stone-700/60 disabled:cursor-not-allowed disabled:opacity-50";

export function MobileMenuButton({
  title,
  disabled = false,
  isActive = false,
  isSplit = false,
  isSplitOpen = false,
  children,
  onClick,
}: PropsWithChildren<MobileMenuButtonProps>) {
  return (
    <button
      type="button"
      className={twMerge(
        MENU_BUTTON_BASE_CLASS,
        !isSplit && isActive && "bg-stone-700/90",
        isSplit
          ? "flex items-stretch overflow-hidden text-left text-xs"
          : "grid w-12 place-items-center py-2",
      )}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      <span>{children}</span>

      {isSplit && (
        <span className="grid place-items-center border-l border-stone-700/70 px-2">
          {isSplitOpen ? (
            <ChevronUpIcon className="size-4" />
          ) : (
            <ChevronDownIcon className="size-4" />
          )}
        </span>
      )}
    </button>
  );
}
