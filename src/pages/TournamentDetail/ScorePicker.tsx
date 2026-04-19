import { useState } from 'react';

interface Props {
  teamName: string;          // e.g. "Sebastian & Fernando"
  current: number;
  max: number;
  onSelect: (v: number) => void;
  onClose: () => void;
}

export default function ScorePicker({ teamName, current, max, onSelect, onClose }: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const values = Array.from({ length: max + 1 }, (_, i) => i);
  const cols = 5;

  const handleCustomSubmit = () => {
    const n = parseInt(customInput, 10);
    if (!isNaN(n) && n >= 0 && n <= max) {
      onSelect(n);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div
        className="relative w-full max-w-lg bg-[#1c1c1e] rounded-t-3xl pt-3 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 bg-[#48484a] rounded-full" />
        </div>

        {/* Title */}
        <h2 className="text-white font-bold text-lg text-center mt-3 mb-5 px-6 leading-snug">
          Score for {teamName}
        </h2>

        {!customMode ? (
          <>
            {/* Number grid */}
            <div
              className="grid gap-2 px-4 mb-5"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {values.map((v) => (
                <button
                  key={v}
                  onClick={() => { onSelect(v); onClose(); }}
                  className={`py-3 rounded-2xl text-base font-bold transition-all active:scale-95 ${
                    v === current
                      ? 'bg-primary text-white'
                      : 'bg-[#2c2c2e] text-white hover:bg-[#3a3a3c]'
                  }`}
                >
                  {String(v).padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* Enter Custom Score */}
            <button
              onClick={() => setCustomMode(true)}
              className="w-full text-primary font-semibold text-base py-3 active:opacity-60"
            >
              Enter Custom Score
            </button>

            {/* Reset */}
            <div className="px-4 mt-1">
              <button
                onClick={() => { onSelect(0); onClose(); }}
                className="w-full py-4 rounded-2xl bg-[#2c2c2e] text-muted font-semibold text-base active:opacity-70"
              >
                Reset
              </button>
            </div>
          </>
        ) : (
          <div className="px-4 space-y-4">
            <p className="text-muted text-sm text-center">Enter a value between 0 and {max}</p>
            <input
              type="number"
              min={0}
              max={max}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              placeholder="Score"
              autoFocus
              className="w-full bg-[#2c2c2e] text-white text-center text-2xl font-bold rounded-2xl py-4 outline-none border border-border/40 placeholder:text-muted"
            />
            <button
              onClick={handleCustomSubmit}
              className="w-full py-4 rounded-2xl bg-primary text-white font-semibold text-base active:opacity-80"
            >
              Confirm
            </button>
            <button
              onClick={() => setCustomMode(false)}
              className="w-full py-3 text-muted font-medium text-base active:opacity-60"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
