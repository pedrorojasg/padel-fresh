import type { WizardState } from "./index";

interface Props {
  state: WizardState;
  dispatch: React.Dispatch<any>;
  onClose: () => void;
}

const TYPES = [
  {
    id: "classic_americano",
    label: "Classic Americano",
    description:
      "Players team up once and every player will be collecting points individually. ",
    available: true,
  },
  {
    id: "mixed_americano",
    label: "Mixed Americano",
    description:
      "Mixed-gender teams are created, every player will be collecting points individually.",
    available: false,
  },
  {
    id: "team_americano",
    label: "Team Americano",
    description: "All the predetermined teams will play against each other.",
    available: false,
  },
];

export default function StepType({ state, dispatch, onClose }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-black px-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="text-primary text-xl"
        >
          ←
        </button>
        <div className="text-center">
          <div className="font-semibold text-white">{state.name}</div>
        </div>
        <button
          onClick={onClose}
          className="text-primary text-base font-normal"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col items-center mt-10 flex-1">
        <div className="text-5xl mb-4">🎯</div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Choose The Tournament Type
        </h1>
        <p className="text-muted text-sm mb-6 text-center uppercase tracking-widest">
          Americano
        </p>

        <div className="w-full bg-card rounded-2xl overflow-hidden border border-border/40">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                t.available && dispatch({ type: "SET_TYPE", payload: t.id })
              }
              disabled={!t.available}
              className={`w-full text-left px-4 py-4 border-b border-border/30 last:border-0 flex items-start justify-between gap-3 transition-opacity ${
                !t.available ? "opacity-40" : "active:opacity-70"
              }`}
            >
              <div>
                <div
                  className={`font-semibold text-base ${t.available ? "text-white" : "text-muted"}`}
                >
                  {t.label}
                </div>
                <div className="text-sm text-muted mt-0.5">{t.description}</div>
              </div>
              {state.type === t.id && t.available && (
                <span className="text-primary mt-1 shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-8 mt-6">
        <button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white active:opacity-80"
        >
          Next
        </button>
      </div>
    </div>
  );
}
