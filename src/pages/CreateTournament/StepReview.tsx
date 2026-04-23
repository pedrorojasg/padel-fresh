import { defaultRounds } from '../../algorithm/americano';
import type { WizardState } from './index';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<any>;
  onClose: () => void;
  onSaveDraft: () => void;
  onCreate: () => void;
}

function estimateDuration(rounds: number, pointsPerRound: number): string {
  const minutesPerRound = pointsPerRound * 0.5; // ~30s per point
  const total = Math.round(rounds * minutesPerRound);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function StepReview({ state, dispatch, onClose, onSaveDraft, onCreate }: Props) {
  const totalRounds = defaultRounds(state.players.length, state.courts.length);
  const matchesPerRound = state.courts.length;
  const totalMatches = totalRounds * matchesPerRound;
  const duration = estimateDuration(totalRounds, state.pointsPerRound);

  return (
    <div className="flex flex-col min-h-screen bg-black px-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <button onClick={() => dispatch({ type: 'PREV_STEP' })} className="text-primary text-xl">←</button>
        <div className="text-center">
          <div className="font-semibold text-white">Review Details</div>
        </div>
        <button onClick={onClose} className="text-primary text-base font-normal">Close</button>
      </div>

      <div className="flex flex-col items-center mt-8 flex-1 pb-44">
        <div className="text-5xl mb-4">🎾</div>
        <h1 className="text-3xl font-bold text-white mb-6">{state.name}</h1>

        <div className="w-full bg-card rounded-2xl p-5 border border-border/40 text-sm text-white space-y-2">
          <p>• Playing the Classic Americano variant.</p>
          <p>• {state.players.length} players play on {state.courts.length} court(s).</p>
          <p>• Players are paired up in the unique teams until everyone has played with everyone and against everyone.</p>
          <p>• Each round is played up to {state.pointsPerRound} points. Each ball won gives a point to the winning pair. After playing {state.pointsPerRound} balls, you enter the results.</p>
          <p>• Rounds to play: {totalRounds}</p>
          <p>• Total Matches: {totalMatches}</p>
          <p>• Estimated duration: {duration}</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent space-y-2">
        <button
          onClick={onSaveDraft}
          className="w-full py-3 text-primary font-semibold text-base"
        >
          Save Draft
        </button>
        <button
          onClick={onCreate}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white active:opacity-80"
        >
          Create Tournament
        </button>
      </div>
    </div>
  );
}
