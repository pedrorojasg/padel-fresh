import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, saveTournament, deleteTournament } from '../../storage/localStorage';
import { generateSchedule } from '../../algorithm/americano';
import ScoreInput from './ScoreInput';
import type { Tournament, Round } from '../../types';

/** Pick rounds from a fresh schedule in a round-robin fashion */
function buildExtraRounds(tournament: Tournament, count: number): Round[] {
  const schedule = generateSchedule(tournament.players, tournament.courts.length);
  if (!schedule.length) return [];
  const extra: Round[] = [];
  for (let i = 0; i < count; i++) {
    const template = schedule[(tournament.rounds.length + i) % schedule.length];
    extra.push({
      ...template,
      roundNumber: tournament.rounds.length + i + 1,
      completed: false,
      matches: template.matches.map((m) => ({ ...m, score1: 0, score2: 0, completed: false })),
    });
  }
  return extra;
}

/** Bottom sheet: pick how many rounds to add */
function AddRoundsSheet({ onAdd, onClose }: { onAdd: (n: number) => void; onClose: () => void }) {
  const [count, setCount] = useState(1);
  const options = [1, 2, 3, 4, 5, 6, 8, 10];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-lg bg-[#1c1c1e] rounded-t-3xl pt-3 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 bg-[#48484a] rounded-full" />
        </div>
        <h2 className="text-white font-bold text-lg text-center mt-3 mb-5">Add Rounds</h2>

        <div className="grid grid-cols-4 gap-2 px-4 mb-6">
          {options.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`py-3 rounded-2xl text-base font-bold transition-all active:scale-95 ${
                count === n ? 'bg-primary text-white' : 'bg-[#2c2c2e] text-white'
              }`}
            >
              +{n}
            </button>
          ))}
        </div>

        <div className="px-4">
          <button
            onClick={() => { onAdd(count); onClose(); }}
            className="w-full py-4 rounded-2xl bg-primary text-white font-semibold text-base active:opacity-80"
          >
            Add {count} Round{count > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeRound, setActiveRound] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showAddRounds, setShowAddRounds] = useState(false);

  useEffect(() => {
    if (!id) return;
    const t = getTournament(id);
    if (!t) { navigate('/'); return; }
    setTournament(t);
    const firstIncomplete = t.rounds.findIndex((r) => !r.completed);
    setActiveRound(firstIncomplete >= 0 ? firstIncomplete : t.rounds.length - 1);
  }, [id]);

  const save = useCallback((updated: Tournament) => {
    setTournament(updated);
    saveTournament(updated);
  }, []);

  if (!tournament) return null;

  const isFinished = tournament.status === 'completed';
  const round = tournament.rounds[activeRound];

  // Scores are locked only when the tournament is officially finished
  const scoresLocked = isFinished;

  const handleScoreChange = (matchIdx: number, s1: number, s2: number) => {
    if (scoresLocked) return;
    const updated = { ...tournament };
    updated.rounds = updated.rounds.map((r, ri) => {
      if (ri !== activeRound) return r;
      return {
        ...r,
        matches: r.matches.map((m, mi) => mi !== matchIdx ? m : { ...m, score1: s1, score2: s2 }),
      };
    });
    save(updated);
  };

  const handleMarkMatchComplete = (matchIdx: number) => {
    if (scoresLocked) return;
    const updated = { ...tournament };
    updated.rounds = updated.rounds.map((r, ri) => {
      if (ri !== activeRound) return r;
      return {
        ...r,
        matches: r.matches.map((m, mi) => mi !== matchIdx ? m : { ...m, completed: !m.completed }),
      };
    });
    save(updated);
  };

  const handleCompleteRound = () => {
    if (scoresLocked) return;
    const updated = { ...tournament };
    updated.rounds = updated.rounds.map((r, ri) => {
      if (ri !== activeRound) return r;
      return { ...r, completed: true, matches: r.matches.map((m) => ({ ...m, completed: true })) };
    });
    save(updated);
    // Advance to next round if available
    if (activeRound < updated.rounds.length - 1) {
      setActiveRound(activeRound + 1);
    }
  };

  const handleFinishTournament = () => {
    const updated: Tournament = {
      ...tournament,
      status: 'completed',
      // Mark all rounds and matches as completed
      rounds: tournament.rounds.map((r) => ({
        ...r,
        completed: true,
        matches: r.matches.map((m) => ({ ...m, completed: true })),
      })),
    };
    save(updated);
    setShowFinishConfirm(false);
  };

  const handleAddRounds = (count: number) => {
    const extra = buildExtraRounds(tournament, count);
    const updated: Tournament = {
      ...tournament,
      status: 'active',
      rounds: [...tournament.rounds, ...extra],
    };
    save(updated);
    setActiveRound(tournament.rounds.length); // jump to first new round
  };

  const handleDelete = () => {
    if (!id) return;
    deleteTournament(id);
    navigate('/');
  };

  const dateStr = new Date(tournament.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const currentRoundDone = round?.completed ?? false;

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-black sticky top-0 z-30">
        <button onClick={() => navigate('/')} className="text-white text-xl p-1">←</button>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/tournament/${id}/leaderboard`)} aria-label="Leaderboard">
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
              <div className="absolute right-0 top-8 bg-[#3a3a3c] rounded-xl overflow-hidden z-50 shadow-xl w-44">
                <button
                  onClick={() => { setShowMenu(false); navigate(`/tournament/${id}/edit`); }}
                  className="block w-full text-left px-4 py-3 text-white text-sm border-b border-border/30 active:bg-white/10"
                >
                  Edit
                </button>
                {!isFinished && (
                  <button
                    onClick={() => { setShowMenu(false); setShowFinishConfirm(true); }}
                    className="block w-full text-left px-4 py-3 text-green-400 text-sm border-b border-border/30 active:bg-white/10"
                  >
                    Finish Tournament
                  </button>
                )}
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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white">{tournament.name}</h1>
          {isFinished && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
              Finished
            </span>
          )}
        </div>
        <div className="text-sm text-muted">Classic Americano</div>
        <div className="flex items-center gap-3 mt-1 text-muted text-sm">
          <span>{dateStr}</span>
          <span className="ml-auto">{tournament.pointsPerRound} ⊙</span>
          <span>{tournament.players.length} 👤</span>
        </div>
      </div>

      {/* Round tabs + add button */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide items-center">
        {tournament.rounds.map((r, i) => (
          <button
            key={i}
            onClick={() => setActiveRound(i)}
            className={`shrink-0 w-12 h-12 rounded-xl font-semibold text-sm transition-colors relative ${
              i === activeRound
                ? 'bg-primary text-white'
                : r.completed
                ? 'bg-card text-muted'
                : 'bg-card text-white'
            }`}
          >
            {i + 1}
            {r.completed && i !== activeRound && (
              <span className="absolute top-1 right-1 text-[9px] text-green-400">✓</span>
            )}
          </button>
        ))}

        {/* Add rounds button — only when not finished */}
        {!isFinished && (
          <button
            onClick={() => setShowAddRounds(true)}
            className="shrink-0 w-12 h-12 rounded-xl bg-card border border-dashed border-border text-muted font-bold text-xl flex items-center justify-center active:opacity-60"
            aria-label="Add rounds"
          >
            +
          </button>
        )}

        <span className="text-xs text-muted shrink-0 ml-1">Rounds</span>
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
                completed={scoresLocked}
              />
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </svg>
                <span>{tournament.courts[match.courtIndex] ?? `Court ${match.courtIndex + 1}`}</span>
              </div>
              {!scoresLocked && (
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

      {/* Bottom action */}
      {!isFinished && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
          {currentRoundDone ? (
            <div className="w-full py-4 rounded-2xl text-center font-semibold text-base bg-card text-muted border border-border/40">
              ✓ Round {activeRound + 1} Complete
            </div>
          ) : (
            <button
              onClick={handleCompleteRound}
              className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white active:opacity-80"
            >
              Complete Round {activeRound + 1}
            </button>
          )}
        </div>
      )}
      {isFinished && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="w-full py-4 rounded-2xl text-center font-semibold text-base bg-green-500/10 text-green-400 border border-green-500/30">
            🏆 Tournament Finished
          </div>
        </div>
      )}

      {/* Add Rounds sheet */}
      {showAddRounds && (
        <AddRoundsSheet onAdd={handleAddRounds} onClose={() => setShowAddRounds(false)} />
      )}

      {/* Finish tournament confirmation */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border/40">
            <h3 className="text-white font-bold text-lg mb-2">Finish Tournament?</h3>
            <p className="text-muted text-sm mb-6">
              All rounds will be marked as complete and scores will be locked. This cannot be undone.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleFinishTournament}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold active:opacity-80"
              >
                Yes, Finish Tournament
              </button>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="w-full py-3 rounded-xl text-primary font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
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
