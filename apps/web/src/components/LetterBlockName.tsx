const LETTERS = ["M", "I", "H", "I", "R", "A"] as const;

const TILTS = [-3.5, 2.2, -1.8, 3.1, -2.4, 1.6];

export function LetterBlockName() {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Mihira">
      {LETTERS.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          className={`letter-block ${i === 2 ? "!bg-accent-blush !text-ink" : ""}`}
          style={{ transform: `rotate(${TILTS[i]}deg)` }}
        >
          {letter}
        </span>
      ))}
      <span
        className="ml-1 inline-flex h-8 w-8 items-center justify-center text-accent sm:h-9 sm:w-9"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
