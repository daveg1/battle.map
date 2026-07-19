import { useEffect, useState } from "react";

const SPLASH_FADE_MS = 250;

interface Props {
  onDismiss(): void;
}

function Key({ children }: { children: string }) {
  return (
    <kbd className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[0.72rem] font-semibold tracking-wide text-white uppercase shadow-sm">
      {children}
    </kbd>
  );
}

export function SplashScreen({ onDismiss }: Props) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isExiting) {
      return;
    }

    const timeoutId = window.setTimeout(onDismiss, SPLASH_FADE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isExiting, onDismiss]);

  function handleContinue() {
    setIsExiting(true);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-stone-950/30 px-6 py-8 text-white ${
        isExiting ? "splash-fade-out" : "splash-fade-in"
      }`}
    >
      <div className="absolute inset-0 bg-stone-950/15" />

      <section className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-stone-950/70 p-6 shadow-2xl backdrop-blur-sm">
        <h1
          className="mt-4 mb-3 text-4xl leading-8 font-semibold tracking-tight"
          style={{ fontFamily: "AnironBold" }}
        >
          BattleMap
        </h1>

        <p className="max-w-xl text-sm leading-6 text-stone-200 italic">
          Searching Europe's greatest battles
        </p>

        <div className="mt-6 grid gap-3 text-sm text-stone-100 sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold">1. Search or drop a point</p>
            <p className="mt-1 leading-6 text-stone-300">
              Search a place name or press <Key>Alt+C</Key> to drop a point on
              the map.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold">2. Adjust the search radius</p>
            <p className="mt-1 leading-6 text-stone-300">
              Drag the slider or <Key>Alt</Key>+drag to resize the radius.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold">3. Use shortcuts</p>
            <p className="mt-1 leading-6 text-stone-300">
              <Key>Alt+Enter</Key> fits the radius. <Key>Alt+C</Key> clears it.{" "}
              <Key>Escape</Key> closes popups.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold">4. Explore and save</p>
            <p className="mt-1 leading-6 text-stone-300">
              Click markers to inspect battles and save the ones you want.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            className="cursor-pointer rounded-full bg-white px-5 py-2 text-sm font-semibold text-stone-950 hover:bg-stone-200"
            onClick={handleContinue}
          >
            For glory!
          </button>
        </div>
      </section>
    </div>
  );
}
