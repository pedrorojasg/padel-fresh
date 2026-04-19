import { useState } from 'react';
import type { WizardState } from './index';

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<any>;
  onClose: () => void;
}

const POINTS_OPTIONS = [16, 24, 32];
const COURTS_OPTIONS = [1, 2, 3, 4, 5];
const SIT_OUT_OPTIONS = [0, 1, 2, 3, 5, 7, 10];
const BONUS_OPTIONS = [0, 1, 2, 3, 5];

interface SheetConfig {
  title: string;
  options: (number | string)[];
  current: number | string;
  onSelect: (v: number | string) => void;
}

function OptionSheet({ config, onClose }: { config: SheetConfig; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg bg-[#1c1c1e] rounded-t-2xl pb-8 pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 bg-[#48484a] rounded-full" />
        </div>
        <div className="text-center text-white font-semibold py-3 border-b border-[#3a3a3c] text-sm">
          {config.title}
        </div>
        {config.options.map((opt) => (
          <button
            key={String(opt)}
            onClick={() => { config.onSelect(opt); onClose(); }}
            className={`w-full py-3.5 px-6 text-left text-base border-b border-[#3a3a3c] last:border-0 flex items-center justify-between ${
              config.current === opt ? 'text-primary font-semibold' : 'text-white'
            } active:bg-white/5`}
          >
            <span>{opt}</span>
            {config.current === opt && <span className="text-primary">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingRow({
  icon, label, displayValue, onTap, hint,
}: {
  icon: React.ReactNode;
  label: string;
  displayValue: string | number;
  onTap: () => void;
  hint?: string;
}) {
  return (
    <div>
      <button
        onClick={onTap}
        className="w-full flex items-center justify-between px-4 py-4 active:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <span className="text-muted">{icon}</span>
          <span className="text-white font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-muted text-sm">
          <span className="text-white">{displayValue}</span>
          <span className="text-xs">∨</span>
        </div>
      </button>
      {hint && <p className="text-xs text-muted px-4 pb-3 -mt-2 leading-relaxed">{hint}</p>}
    </div>
  );
}

export default function StepPointsCourts({ state, dispatch, onClose }: Props) {
  const [sheet, setSheet] = useState<SheetConfig | null>(null);

  const courtCount = state.courts.length;

  const setCourts = (count: number) => {
    const newCourts = Array.from({ length: count }, (_, i) => state.courts[i] ?? `Court ${i + 1}`);
    dispatch({ type: 'SET_COURTS', payload: newCourts });
  };

  const openSheet = (config: SheetConfig) => setSheet(config);
  const closeSheet = () => setSheet(null);

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
        <h1 className="text-2xl font-bold text-white mt-6 mb-6 text-center">Points & Courts</h1>

        <div className="space-y-3">
          {/* Points per Round */}
          <div className="bg-card rounded-2xl border border-border/40">
            <SettingRow
              icon={<span>⊙</span>}
              label="Points per Round"
              displayValue={state.pointsPerRound}
              onTap={() => openSheet({
                title: 'Points per Round',
                options: POINTS_OPTIONS,
                current: state.pointsPerRound,
                onSelect: (v) => dispatch({ type: 'SET_POINTS_PER_ROUND', payload: Number(v) }),
              })}
            />
          </div>

          {/* Number of Rounds (auto, not editable) */}
          <div className="bg-card rounded-2xl border border-border/40">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="text-muted">↺</span>
                <span className="text-white font-medium">Number of Rounds</span>
              </div>
              <span className="text-muted text-sm">Auto ∨</span>
            </div>
            <p className="text-xs text-muted px-4 pb-3 -mt-2 leading-relaxed">
              Rounds are calculated automatically for balanced play. You can add more rounds or finish early at any time.
            </p>
          </div>

          {/* Number of Courts */}
          <div className="bg-card rounded-2xl border border-border/40">
            <SettingRow
              icon={<span>◇</span>}
              label="Number of Courts"
              displayValue={courtCount}
              onTap={() => openSheet({
                title: 'Number of Courts',
                options: COURTS_OPTIONS,
                current: courtCount,
                onSelect: (v) => setCourts(Number(v)),
              })}
            />
            {/* Court name rows */}
            <div className="border-t border-border/40">
              {state.courts.map((court, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0">
                  <input
                    type="text"
                    value={court}
                    onChange={(e) => dispatch({ type: 'SET_COURT_NAME', payload: { index: i, name: e.target.value } })}
                    className="bg-transparent text-white outline-none text-sm flex-1"
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Sit Out Points */}
          <div className="bg-card rounded-2xl border border-border/40">
            <SettingRow
              icon={<span>🪑</span>}
              label="Sit Out Points"
              displayValue={state.sitOutPoints}
              onTap={() => openSheet({
                title: 'Sit Out Points',
                options: SIT_OUT_OPTIONS,
                current: state.sitOutPoints,
                onSelect: (v) => dispatch({ type: 'SET_SIT_OUT_POINTS', payload: Number(v) }),
              })}
              hint="Compensate players sitting out with points to keep the scoring competitive. After each round, all resting players receive a specified amount of extra points."
            />
          </div>

          {/* Win Bonus */}
          <div className="bg-card rounded-2xl border border-border/40">
            <SettingRow
              icon={<span>🏆</span>}
              label="Win Bonus"
              displayValue={state.winBonus === 0 ? 'None' : state.winBonus}
              onTap={() => openSheet({
                title: 'Win Bonus',
                options: ['None', ...BONUS_OPTIONS.slice(1)],
                current: state.winBonus === 0 ? 'None' : state.winBonus,
                onSelect: (v) => dispatch({ type: 'SET_WIN_BONUS', payload: v === 'None' ? 0 : Number(v) }),
              })}
            />
          </div>

          {/* Draw Bonus */}
          <div className="bg-card rounded-2xl border border-border/40">
            <SettingRow
              icon={<span>—</span>}
              label="Draw Bonus"
              displayValue={state.drawBonus === 0 ? 'None' : state.drawBonus}
              onTap={() => openSheet({
                title: 'Draw Bonus',
                options: ['None', ...BONUS_OPTIONS.slice(1)],
                current: state.drawBonus === 0 ? 'None' : state.drawBonus,
                onSelect: (v) => dispatch({ type: 'SET_DRAW_BONUS', payload: v === 'None' ? 0 : Number(v) }),
              })}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white active:opacity-80"
        >
          Next
        </button>
      </div>

      {/* Bottom sheet picker */}
      {sheet && <OptionSheet config={sheet} onClose={closeSheet} />}
    </div>
  );
}
