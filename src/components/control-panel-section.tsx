import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function ControlPanelSection({ children, className }: Props) {
  return (
    <section className={clsx("rounded-lg border border-stone-700 bg-stone-900/40 p-3", className)}>
      {children}
    </section>
  );
}
