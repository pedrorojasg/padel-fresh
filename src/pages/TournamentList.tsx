import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TournamentCard from '../components/TournamentCard';
import { getTournaments } from '../storage/localStorage';
import type { Tournament } from '../types';

function groupByMonth(tournaments: Tournament[]): Record<string, Tournament[]> {
  const groups: Record<string, Tournament[]> = {};
  for (const t of tournaments) {
    const d = new Date(t.createdAt);
    const key = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

export default function TournamentList() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    setTournaments(getTournaments());
  }, []);

  const groups = groupByMonth(tournaments);
  const monthKeys = Object.keys(groups);

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <span className="text-muted">∨</span>
        </div>
        <button className="text-muted">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 px-8 text-center">
          <div className="text-5xl mb-4">🏓</div>
          <h2 className="text-xl font-semibold text-white mb-2">No tournaments yet</h2>
          <p className="text-muted text-sm">Create your first Americano tournament and start playing!</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {monthKeys.map((month) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 px-1">{month}</h2>
              <div className="space-y-3">
                {groups[month].map((t) => (
                  <TournamentCard key={t.id} tournament={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-8 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
        <button
          onClick={() => navigate('/tournament/new')}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white flex items-center justify-center gap-2 active:opacity-80"
        >
          <span className="text-xl font-light">+</span> Create Tournament
        </button>
      </div>
    </div>
  );
}
