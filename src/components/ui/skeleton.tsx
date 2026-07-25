import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div
      className={twMerge(
        "h-20 w-full animate-pulse rounded bg-stone-300/70",
        className,
      )}
    />
  );
}
