import { useState } from 'react';
import ScorePicker from './ScorePicker';

interface Props {
  team1: [string, string];
  team2: [string, string];
  score1: number;
  score2: number;
  max: number;
  onChange: (s1: number, s2: number) => void;
  completed: boolean;
}

export default function ScoreInput({ team1, team2, score1, score2, max, onChange, completed }: Props) {
  const [picker, setPicker] = useState<'team1' | 'team2' | null>(null);

  const selectTeam1 = (v: number) => {
    const s2 = Math.max(0, max - v);
    onChange(v, s2);
  };

  const selectTeam2 = (v: number) => {
    const s1 = Math.max(0, max - v);
    onChange(s1, v);
  };

  const ScoreBox = ({
    score,
    isWinner,
    onTap,
  }: { score: number; isWinner: boolean; onTap: () => void }) => (
    <button
      onClick={onTap}
      disabled={completed}
      className={`w-20 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
        completed
          ? isWinner
            ? 'bg-primary/30 cursor-default'
            : 'bg-[#2c2c2e] cursor-default'
          : isWinner
          ? 'bg-primary/20 border border-primary/50'
          : 'bg-[#2c2c2e] border border-border/30'
      }`}
    >
      <span
        className={`text-3xl font-bold tabular-nums ${
          completed
            ? isWinner
              ? 'text-primary'
              : 'text-muted'
            : 'text-white'
        }`}
      >
        {String(score).padStart(2, '0')}
      </span>
    </button>
  );

  const team1Label = team1.join(' & ');
  const team2Label = team2.join(' & ');
  const isDraw = score1 === score2;
  const team1Wins = score1 > score2;
  const team2Wins = score2 > score1;

  return (
    <>
      {/* Score display row */}
      <div className="flex items-center justify-between px-2">
        {/* Team 1 names */}
        <div className="flex-1 text-sm text-white pr-3 space-y-1.5">
          <div className={team1Wins ? 'font-semibold' : ''}>{team1[0]}</div>
          <div className={team1Wins ? 'font-semibold' : ''}>{team1[1]}</div>
        </div>

        {/* Score boxes */}
        <div className="flex items-center gap-2 shrink-0">
          <ScoreBox
            score={score1}
            isWinner={!isDraw && team1Wins}
            onTap={() => !completed && setPicker('team1')}
          />
          <span className="text-muted text-lg font-light">–</span>
          <ScoreBox
            score={score2}
            isWinner={!isDraw && team2Wins}
            onTap={() => !completed && setPicker('team2')}
          />
        </div>

        {/* Team 2 names */}
        <div className="flex-1 text-sm text-white text-right pl-3 space-y-1.5">
          <div className={team2Wins ? 'font-semibold' : ''}>{team2[0]}</div>
          <div className={team2Wins ? 'font-semibold' : ''}>{team2[1]}</div>
        </div>
      </div>

      {/* Picker bottom sheets */}
      {picker === 'team1' && (
        <ScorePicker
          teamName={team1Label}
          current={score1}
          max={max}
          onSelect={selectTeam1}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'team2' && (
        <ScorePicker
          teamName={team2Label}
          current={score2}
          max={max}
          onSelect={selectTeam2}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}
