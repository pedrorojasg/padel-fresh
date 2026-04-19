import { useState, useEffect } from 'react';
import { getSuggestedPlayers } from '../../storage/localStorage';
import PlayerRow from '../../components/PlayerRow';
import type { WizardState } from './index';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<any>;
  onClose: () => void;
}

export default function StepPlayers({ state, dispatch, onClose }: Props) {
  const [input, setInput] = useState('');
  const [suggested, setSuggested] = useState<string[]>([]);
  const canNext = state.players.length >= 4;

  useEffect(() => {
    setSuggested(getSuggestedPlayers());
  }, []);

  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_PLAYER', payload: trimmed });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addPlayer(input);
  };

  const notYetAdded = suggested.filter((p) => !state.players.includes(p));

  return (
    <div className="flex flex-col min-h-screen bg-black px-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <button onClick={() => dispatch({ type: 'PREV_STEP' })} className="text-primary text-xl">←</button>
        <div className="text-center">
          <div className="font-semibold text-white">{state.name}</div>
          <div className="text-xs text-muted">Classic Americano</div>
        </div>
        <button onClick={onClose} className="text-primary text-base font-normal">Close</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Add Player */}
        <div className="mt-5">
          <h2 className="font-bold text-white text-lg mb-3">Add Player</h2>
          <div className="flex items-center bg-card rounded-xl px-4 py-3 border border-border/40">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Player Name"
              className="flex-1 bg-transparent text-white placeholder:text-muted outline-none text-base"
            />
            {input.trim() && (
              <button
                onClick={() => addPlayer(input)}
                className="text-primary font-semibold ml-2 text-sm"
              >
                Add
              </button>
            )}
          </div>
        </div>

        {/* Selected Players */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span className="font-bold text-white text-lg">Selected Players</span>
            </div>
            <div className="flex items-center gap-1 text-muted text-sm">
              <span>{state.players.length}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>

          {state.players.length === 0 ? (
            <div className="text-muted text-sm text-center py-6">No players added yet</div>
          ) : (
            <div className="bg-card rounded-2xl px-4 border border-border/40">
              {state.players.map((p) => (
                <PlayerRow
                  key={p}
                  name={p}
                  actionIcon="remove"
                  onAction={() => dispatch({ type: 'REMOVE_PLAYER', payload: p })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Suggested Players */}
        {notYetAdded.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted">💡</span>
              <span className="font-bold text-white text-lg">Suggested Players</span>
            </div>
            <div className="bg-card rounded-2xl px-4 border border-border/40">
              {notYetAdded.map((p) => (
                <PlayerRow
                  key={p}
                  name={p}
                  actionIcon="add"
                  onAction={() => dispatch({ type: 'ADD_PLAYER', payload: p })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
        <button
          onClick={() => canNext && dispatch({ type: 'NEXT_STEP' })}
          disabled={!canNext}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-opacity ${
            canNext ? 'bg-primary text-white active:opacity-80' : 'bg-primary/40 text-white/40 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
