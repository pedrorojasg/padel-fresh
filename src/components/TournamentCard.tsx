import { useNavigate } from 'react-router-dom';
import type { Tournament } from '../types';

interface Props {
  tournament: Tournament;
}

const TYPE_LABELS: Record<string, string> = {
  classic_americano: 'Classic Americano',
};

export default function TournamentCard({ tournament }: Props) {
  const navigate = useNavigate();
  const date = new Date(tournament.createdAt);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  const completedRounds = tournament.rounds.filter((r) => r.completed).length;

  return (
    <button
      onClick={() => navigate(`/tournament/${tournament.id}`)}
      className="w-full text-left bg-card rounded-2xl p-4 border border-border/40 active:opacity-70"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-muted mb-1">{TYPE_LABELS[tournament.type] ?? tournament.type}</div>
          <div className="font-semibold text-white text-base leading-tight">{tournament.name}</div>
        </div>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <span className="text-xs text-muted">{dateStr}</span>
          {tournament.status === 'completed' && (
            <span className="text-green-400 text-sm">✓</span>
          )}
          {tournament.status === 'draft' && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">Draft</span>
          )}
        </div>
      </div>
      <div className="mt-2 flex gap-3 text-sm text-muted">
        <span>{tournament.players.length} Players</span>
        <span>·</span>
        <span>{completedRounds} Rounds</span>
      </div>
    </button>
  );
}
