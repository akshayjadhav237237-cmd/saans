export interface AskExampleChipsProps {
  readonly examples: readonly string[];
  readonly label: string;
  readonly onSelect: (text: string) => void;
}

/** Renders selectable example question chips for quick exploration. */
export function AskExampleChips({ examples, label, onSelect }: AskExampleChipsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(ex)}
            className="text-xs bg-bg-elevated hover:bg-bg-surface border border-border text-text-main px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus text-left"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
