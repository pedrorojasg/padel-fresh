import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, saveTournament, deleteTournament } from '../../storage/localStorage';
import { generateSchedule } from '../../algorithm/americano';
import ScoreInput from './ScoreInput';
import type { Tournament } from '../../types';

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeRound, setActiveRound] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const t = getTournament(id);
    if (!t) { navigate('/'); return; }
    setTournament(t);
    // Jump to first incomplete round
    const firstIncomplete = t.rounds.findIndex((r) => !r.completed);
    setActiveRound(firstIncomplete >= 0 ? firstIncomplete : t.rounds.length - 1);
  }, [id]);

  const save = useCallback((updated: Tournament) => {
    setTournament(updated);
    saveTournament(updated);
  }, []);

  if (!tournament) return null;

  const round = tournament.rounds[activeRound];
  const isLastRound = activeRound === tournament.rounds.length - 1;

  const handleScoreChange = (matchIdx: number, s1: number, s2: number) => {
    const updated = { ...tournament };
    updated.rounds = updated.rounds.map((r, ri) => {
      if (ri !== activeRound) return r;
      return {
        ...r,
        matches: r.matches.map((m, mi) => {
          if (mi !== matchIdx) return m;
          return { ...m, score1: s1, score2: s2 };
        }),
      };
    });
    save(updated);
  };

  const handleMarkMatchComplete = (matchIdx: number) => {
    const updated = { ...tournament };
    updated.rounds = updated.rounds.map((r, ri) => {
      if (ri !== activeRound) return r;
      return {
        ...r,
        matches: r.matches.map((m, mi) => {
          if (mi !== matchIdx) return m;
          return { ...m, completed: !m.completed };
        }),
      };
    });
    save(updated);
  };

  const handleCompleteRound = () => {
    const updated = { ...tournament };
    updated.rounds = updated.rounds.map((r, ri) => {
      if (ri !== activeRound) return r;
      return { ...r, completed: true, matches: r.matches.map((m) => ({ ...m, completed: true })) };
    });

    if (isLastRound && tournament.status !== 'completed') {
      // Check if we should finish or add another round
      updated.status = 'completed';
    }

    save(updated);

    if (!isLastRound) {
      setActiveRound(activeRound + 1);
    }
  };

  const handleAddRound = () => {
    const newRounds = generateSchedule(tournament.players, tournament.courts.length);
    const nextRound = newRounds[tournament.rounds.length % newRounds.length];
    if (!nextRound) return;
    const updated = {
      ...tournament,
      status: 'active' as const,
      rounds: [
        ...tournament.rounds,
        { ...nextRound, roundNumber: tournament.rounds.length + 1, completed: false },
      ],
    };
    save(updated);
    setActiveRound(updated.rounds.length - 1);
  };

  const handleFinish = () => {
    handleCompleteRound();
  };

  const handleDelete = () => {
    if (!id) return;
    deleteTournament(id);
    navigate('/');
  };

  const dateStr = new Date(tournament.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-black sticky top-0 z-30">
        <button onClick={() => navigate('/')} className="text-white text-xl p-1">←</button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/tournament/${id}/leaderboard`)}
            aria-label="Leaderboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-white text-xl px-1">⋮</button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-[#3a3a3c] rounded-xl overflow-hidden z-50 shadow-xl w-40">
                <button
                  onClick={() => { setShowMenu(false); navigate(`/tournament/${id}/edit`); }}
                  className="block w-full text-left px-4 py-3 text-white text-sm border-b border-border/30 active:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                  className="block w-full text-left px-4 py-3 text-red-400 text-sm active:bg-white/10"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tournament info */}
      <div className="px-4 pb-2">
        <h1 className="text-xl font-bold text-white">{tournament.name}</h1>
        <div className="text-sm text-muted">Classic Americano</div>
        <div className="flex items-center gap-3 mt-1 text-muted text-sm">
          <span>{dateStr}</span>
          <span className="ml-auto flex items-center gap-1">
            <span>{tournament.pointsPerRound} ⊙</span>
          </span>
          <span className="flex items-center gap-1">
            <span>{tournament.players.length} 👤</span>
          </span>
        </div>
      </div>

      {/* Round tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {tournament.rounds.map((r, i) => (
          <button
            key={i}
            onClick={() => setActiveRound(i)}
            className={`shrink-0 w-12 h-12 rounded-xl font-semibold text-sm transition-colors ${
              i === activeRound
                ? 'bg-primary text-white'
                : r.completed
                ? 'bg-card text-muted'
                : 'bg-card text-white'
            }`}
          >
            {i + 1}
          </button>
        ))}
        {tournament.rounds.length > 0 && (
          <div className="shrink-0 self-center ml-1">
            <span className="text-xs text-muted">Rounds</span>
          </div>
        )}
      </div>

      {/* Match cards */}
      {round && (
        <div className="px-4 space-y-4">
          {round.matches.map((match, mi) => (
            <div key={mi} className="bg-card rounded-2xl p-4 border border-border/40">
              <ScoreInput
                team1={match.team1}
                team2={match.team2}
                score1={match.score1}
                score2={match.score2}
                max={tournament.pointsPerRound}
                onChange={(s1, s2) => handleScoreChange(mi, s1, s2)}
                completed={match.completed}
              />
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </svg>
                <span>{tournament.courts[match.courtIndex] ?? `Court ${match.courtIndex + 1}`}</span>
              </div>
              {!round.completed && (
                <button
                  onClick={() => handleMarkMatchComplete(mi)}
                  className={`mt-3 w-full py-2 rounded-xl text-xs font-medium border transition-colors ${
                    match.completed
                      ? 'border-green-500/50 text-green-400 bg-green-500/10'
                      : 'border-border/40 text-muted'
                  }`}
                >
                  {match.completed ? '✓ Saved' : 'Mark as done'}
                </button>
              )}
            </div>
          ))}

          {/* Resting Players */}
          {round.restingPlayers.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1 text-sm text-muted">
                <span>🪑</span>
                <span className="font-semibold">Resting Players</span>
              </div>
              <p className="text-sm text-white">{round.restingPlayers.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent space-y-2">
        {tournament.status === 'completed' ? (
          <button
            onClick={handleAddRound}
            className="w-full py-4 rounded-2xl font-semibold text-base border border-primary text-primary active:opacity-80"
          >
            + Add Round
          </button>
        ) : isLastRound ? (
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white active:opacity-80"
          >
            Finish Tournament
          </button>
        ) : (
          <button
            onClick={handleCompleteRound}
            className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white active:opacity-80"
          >
            Complete Round
          </button>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border/40">
            <h3 className="text-white font-bold text-lg mb-2">Delete Tournament?</h3>
            <p className="text-muted text-sm mb-6">This action cannot be undone. All tournament data will be lost.</p>
            <div className="space-y-2">
              <button
                onClick={handleDelete}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold active:opacity-80"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 rounded-xl text-primary font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
