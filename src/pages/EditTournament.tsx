import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, saveTournament } from '../storage/localStorage';
import PlayerRow from '../components/PlayerRow';
import type { Tournament } from '../types';

export default function EditTournament() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [name, setName] = useState('');
  const [courts, setCourts] = useState<string[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState('');

  const hasScores = tournament?.rounds.some((r) => r.matches.some((m) => m.completed)) ?? false;

  useEffect(() => {
    if (!id) return;
    const t = getTournament(id);
    if (!t) { navigate('/'); return; }
    setTournament(t);
    setName(t.name);
    setCourts([...t.courts]);
    setPlayers([...t.players]);
  }, [id]);

  if (!tournament) return null;

  const handleSave = () => {
    const updated: Tournament = {
      ...tournament,
      name,
      courts,
      players,
    };
    saveTournament(updated);
    navigate(`/tournament/${id}`);
  };

  const addPlayer = () => {
    const trimmed = newPlayer.trim();
    if (!trimmed || players.includes(trimmed)) return;
    setPlayers([...players, trimmed]);
    setNewPlayer('');
  };

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-black sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="text-primary text-base">Cancel</button>
        <h1 className="text-lg font-bold text-white">Edit Tournament</h1>
        <button onClick={handleSave} className="text-primary text-base font-semibold">Save</button>
      </div>

      <div className="px-4 space-y-5 mt-4">
        {/* Name */}
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium block mb-2">Tournament Name</label>
          <div className="flex items-center bg-card rounded-xl px-4 py-3 border border-border/40">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none text-base"
            />
          </div>
        </div>

        {/* Courts */}
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium block mb-2">Court Names</label>
          <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
            {courts.map((court, i) => (
              <div key={i} className="flex items-center px-4 py-3 border-b border-border/30 last:border-0">
                <input
                  type="text"
                  value={court}
                  onChange={(e) => {
                    const updated = [...courts];
                    updated[i] = e.target.value;
                    setCourts(updated);
                  }}
                  className="flex-1 bg-transparent text-white outline-none text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Players */}
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium block mb-2">Players</label>

          {!hasScores && (
            <div className="flex items-center bg-card rounded-xl px-4 py-3 border border-border/40 mb-3">
              <input
                type="text"
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Add player..."
                className="flex-1 bg-transparent text-white placeholder:text-muted outline-none text-sm"
              />
              {newPlayer.trim() && (
                <button onClick={addPlayer} className="text-primary text-sm font-semibold ml-2">Add</button>
              )}
            </div>
          )}

          {hasScores && (
            <p className="text-xs text-amber-400 mb-3 px-1">Player list is locked after scores have been entered.</p>
          )}

          <div className="bg-card rounded-2xl border border-border/40 px-4">
            {players.map((p) => (
              <PlayerRow
                key={p}
                name={p}
                actionIcon={hasScores ? undefined : 'remove'}
                onAction={hasScores ? undefined : () => setPlayers(players.filter((pl) => pl !== p))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
