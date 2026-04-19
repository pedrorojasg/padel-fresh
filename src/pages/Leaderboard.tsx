import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament } from '../storage/localStorage';
import { computeLeaderboard } from '../algorithm/americano';
import type { Tournament, PlayerStats } from '../types';

const RANK_COLORS = ['#f59e0b', '#f59e0b', '#f59e0b'];

export default function Leaderboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const t = getTournament(id);
    if (!t) { navigate('/'); return; }
    setTournament(t);
    setStats(computeLeaderboard(t));
  }, [id]);

  if (!tournament) return null;

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const { exportTournamentPdf } = await import('../utils/exportPdf');
      exportTournamentPdf(tournament, stats);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-black sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="text-white text-xl p-1">←</button>
        <h1 className="text-lg font-bold text-white">Leaderboard</h1>
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="flex items-center gap-1.5 text-primary text-sm font-medium disabled:opacity-40 active:opacity-60"
          aria-label="Download PDF"
        >
          {exporting ? (
            <span className="text-xs">Generating…</span>
          ) : (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Table header */}
      <div className="px-4 py-2">
        <div className="flex items-center text-xs text-muted font-medium uppercase tracking-wider px-3">
          <div className="w-10" />
          <div className="flex-1" />
          <div className="w-12 text-right">P</div>
          <div className="w-16 text-right">W-T-L</div>
        </div>
      </div>

      {/* Leaderboard rows */}
      <div className="px-4">
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
          {stats.map((s) => {
            const isTopRank = s.rank <= 3;
            return (
              <div
                key={s.name}
                className="flex items-center px-3 py-4 border-b border-border/30 last:border-0"
              >
                <div className="w-10 flex flex-col items-center">
                  <span className="text-white font-bold text-sm">{s.rank}</span>
                  {isTopRank && (
                    <div
                      className="h-0.5 w-6 rounded-full mt-1"
                      style={{ backgroundColor: RANK_COLORS[s.rank - 1] ?? '#f59e0b' }}
                    />
                  )}
                </div>
                <div className="flex-1 text-white font-medium text-base">{s.name}</div>
                <div className="w-12 text-right font-bold text-white">{s.points}</div>
                <div className="w-16 text-right text-muted text-sm">
                  {s.wins}-{s.ties}-{s.losses}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 mt-6 space-y-1 text-xs text-muted">
        <p>• P: Points — The total number of points earned.</p>
        <p>• W-T-L: Wins-Ties-Losses — A record of each participant's performance.</p>
      </div>

      {/* Round Breakdown */}
      <div className="px-4 mt-6">
        <h2 className="text-white font-bold text-lg mb-3">Round Breakdown</h2>
        <div className="space-y-3">
          {tournament.rounds.map((round, ri) => (
            <div key={ri} className="bg-card rounded-2xl border border-border/40 p-4">
              <div className="text-sm font-semibold text-muted mb-2">Round {round.roundNumber}</div>
              {round.matches.map((m, mi) => (
                <div key={mi} className="flex justify-between text-sm text-white py-1.5 border-b border-border/20 last:border-0">
                  <span>{m.team1.join(' & ')}</span>
                  <span className="font-bold text-muted">{m.score1} – {m.score2}</span>
                  <span>{m.team2.join(' & ')}</span>
                </div>
              ))}
              {round.restingPlayers.length > 0 && (
                <div className="mt-2 text-xs text-muted">Resting: {round.restingPlayers.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
