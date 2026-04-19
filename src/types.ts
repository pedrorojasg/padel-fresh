export interface Match {
  courtIndex: number;
  team1: [string, string];
  team2: [string, string];
  score1: number;
  score2: number;
  completed: boolean;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  restingPlayers: string[];
  completed: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'classic_americano';
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
  players: string[];
  courts: string[];
  pointsPerRound: number;
  sitOutPoints: number;
  winBonus: number;
  drawBonus: number;
  rounds: Round[];
}

export interface AppData {
  tournaments: Tournament[];
  suggestedPlayers: string[];
}

export interface PlayerStats {
  name: string;
  points: number;
  wins: number;
  ties: number;
  losses: number;
  rank: number;
}
