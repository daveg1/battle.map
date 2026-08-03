import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

interface MobileMenuButtonProps {
  title: string;
  onClick(): void;
  disabled?: boolean;
  ariaLabel?: string;
  isActive?: boolean;
  split?: {
    isOpen: boolean;
    controlsId?: string;
  };
  children?: ReactNode;
}

const MENU_BUTTON_BASE_CLASS =
  "cursor-pointer rounded bg-stone-700 text-sm enabled:hover:bg-stone-700/60 disabled:cursor-not-allowed disabled:opacity-50";

export function MobileMenuButton({
  title,
  onClick,
  disabled = false,
  ariaLabel,
  isActive = false,
  split,
  children,
}: MobileMenuButtonProps) {
  if (split) {
    return (
      <button
        type="button"
        className={`flex items-stretch overflow-hidden text-left text-xs ${MENU_BUTTON_BASE_CLASS}`}
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel}
        aria-expanded={split.isOpen}
        aria-controls={split.controlsId}
      >
        <span className="px-3 py-2">{children}</span>
        <span className="grid place-items-center border-l border-stone-700/70 px-2">
          {split.isOpen ? (
            <ChevronUpIcon className="size-4" />
          ) : (
            <ChevronDownIcon className="size-4" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`grid w-12 place-items-center py-2 ${MENU_BUTTON_BASE_CLASS}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      style={isActive ? { backgroundColor: "rgb(68 64 60 / 0.9)" } : undefined}
    >
      {children}
    </button>
  );
}
