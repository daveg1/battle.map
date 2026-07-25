export function ControlPanelLogo() {
  return (
    <header className="relative">
      <img
        src="/arrow.png"
        alt="arrow"
        className="arrow-1 absolute bottom-2 left-2 hidden w-18 select-none lg:block"
        draggable={false}
      />

      <img
        src="/arrow.png"
        alt="arrow"
        className="arrow-2 sm:none absolute bottom-4 left-3 hidden w-18 select-none lg:block"
        draggable={false}
      />

      <h1
        className="nudge-title flex items-center justify-center gap-2 text-lg font-semibold text-shadow-md lg:text-2xl"
        style={{ fontFamily: "AnironBold", letterSpacing: "-0.15em" }}
      >
        Battle Map
      </h1>
    </header>
  );
}
