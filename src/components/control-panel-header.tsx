export function ControlPanelHeader() {
  return (
    <header className="relative">
      <img
        src="/arrow.png"
        alt="arrow"
        className="arrow-1 absolute bottom-2 left-2 w-18 select-none"
        draggable={false}
      />

      <img
        src="/arrow.png"
        alt="arrow"
        className="arrow-2 absolute bottom-4 left-3 w-18 select-none"
        draggable={false}
      />

      <h1
        className="nudge-title flex items-center justify-center gap-2 text-2xl font-semibold text-shadow-md"
        style={{ fontFamily: "AnironBold", letterSpacing: "-0.15em" }}
      >
        Battle Map
      </h1>
    </header>
  );
}
