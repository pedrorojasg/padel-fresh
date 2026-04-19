import type { AppData, Tournament } from '../types';

const STORAGE_KEY = 'padelfresh_data';

const DEFAULT_SUGGESTED: string[] = [];

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tournaments: [], suggestedPlayers: DEFAULT_SUGGESTED };
    return JSON.parse(raw) as AppData;
  } catch {
    return { tournaments: [], suggestedPlayers: DEFAULT_SUGGESTED };
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTournaments(): Tournament[] {
  return loadData().tournaments;
}

export function getTournament(id: string): Tournament | undefined {
  return loadData().tournaments.find((t) => t.id === id);
}

export function saveTournament(tournament: Tournament): void {
  const data = loadData();
  const idx = data.tournaments.findIndex((t) => t.id === tournament.id);
  if (idx >= 0) {
    data.tournaments[idx] = tournament;
  } else {
    data.tournaments.unshift(tournament);
  }
  // merge players into suggested list (max 50 unique)
  const allSuggested = new Set([...data.suggestedPlayers, ...tournament.players]);
  data.suggestedPlayers = Array.from(allSuggested).slice(0, 50);
  saveData(data);
}

export function deleteTournament(id: string): void {
  const data = loadData();
  data.tournaments = data.tournaments.filter((t) => t.id !== id);
  saveData(data);
}

export function getSuggestedPlayers(): string[] {
  return loadData().suggestedPlayers;
}
