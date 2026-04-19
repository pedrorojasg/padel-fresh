import type { WizardState } from './index';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<any>;
  onClose: () => void;
}

export default function StepName({ state, dispatch, onClose }: Props) {
  const canNext = state.name.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-black px-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="w-10" />
        <div className="text-center">
          <div className="font-semibold text-white">{state.name || 'New Tournament'}</div>
        </div>
        <button onClick={onClose} className="text-primary text-base font-normal">Close</button>
      </div>

      <div className="flex flex-col items-center mt-12 flex-1">
        <div className="text-5xl mb-6">🏆</div>
        <h1 className="text-3xl font-bold text-white mb-8">Tournament Name</h1>

        <div className="w-full">
          <div className="flex items-center bg-card rounded-xl px-4 py-3 border border-border/40">
            <input
              type="text"
              value={state.name}
              onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
              placeholder="Tournament Name"
              className="flex-1 bg-transparent text-white placeholder:text-muted outline-none text-base"
              autoFocus
            />
            {state.name && (
              <button
                onClick={() => dispatch({ type: 'SET_NAME', payload: '' })}
                className="text-muted ml-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="pb-8 mt-auto">
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
