import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ControlPanelSection({ title, children, className }: Props) {
  return (
    <section
      className={twMerge(
        "min-h-48 shrink-0 rounded-lg border border-stone-700 bg-stone-900/40 p-2 lg:p-3",
        className,
      )}
    >
      <h3 className="text-lg">{title}</h3>
      {children}
    </section>
  );
}
