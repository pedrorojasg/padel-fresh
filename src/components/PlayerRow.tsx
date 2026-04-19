interface Props {
  name: string;
  onAction?: () => void;
  actionIcon?: 'add' | 'remove';
}

export default function PlayerRow({ name, onAction, actionIcon }: Props) {
  return (
    <div className="flex items-center justify-between py-3.5 px-0 border-b border-border/40 last:border-0">
      <span className="text-white text-base">{name}</span>
      {onAction && (
        <button
          onClick={onAction}
          className="text-muted hover:text-white transition-colors p-1 -mr-1"
          aria-label={actionIcon === 'add' ? 'Add player' : 'Remove player'}
        >
          {actionIcon === 'add' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
