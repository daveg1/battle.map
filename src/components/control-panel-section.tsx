import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ControlPanelSection({ title, children, className }: Props) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-stone-700 bg-stone-900/40 p-3",
        className,
      )}
    >
      <h3 className="text-lg">{title}</h3>
      {children}
    </section>
  );
}
