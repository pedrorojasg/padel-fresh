import type { Match, Round, Tournament, PlayerStats } from '../types';

/**
 * Generate a Classic Americano schedule.
 * Strategy: rotating round-robin with greedy pair deduplication.
 * Total rounds ≈ P-1 (enough for everyone to partner everyone else).
 */
export function generateSchedule(players: string[], courts: number): Round[] {
  const n = players.length;
  if (n < 4) return [];

  const playersPerRound = courts * 4;
  const sitOutCount = n - playersPerRound;

  // Track pair history to minimise repeats
  const pairCount: Record<string, number> = {};
  const sitOutCount2: Record<string, number> = {};
  players.forEach((p) => (sitOutCount2[p] = 0));

  const pairKey = (a: string, b: string) =>
    [a, b].sort().join('|||');

  const getPairCount = (a: string, b: string) =>
    pairCount[pairKey(a, b)] ?? 0;

  const markPair = (a: string, b: string) => {
    const k = pairKey(a, b);
    pairCount[k] = (pairCount[k] ?? 0) + 1;
  };

  // Calculate total rounds: enough for each player to partner each other player
  // For P players each plays with P-1 partners, in pairs that's ceil((P-1)/2) rounds minimum
  // Classic formula: each round reduces unmet pairs by 2*courts, stop when all pairs met or P-1 rounds
  const totalRounds = Math.max(n - 1, Math.ceil(n / 2));

  const rounds: Round[] = [];

  for (let r = 0; r < totalRounds; r++) {
    // Pick sit-out players: prefer those who've sat out least
    let pool = [...players];

    let restingPlayers: string[] = [];
    if (sitOutCount > 0) {
      pool.sort((a, b) => sitOutCount2[a] - sitOutCount2[b]);
      restingPlayers = pool.splice(0, sitOutCount);
      restingPlayers.forEach((p) => sitOutCount2[p]++);
    }

    // pool now has exactly playersPerRound players — assign to courts
    const matches: Match[] = buildMatches(pool, courts, getPairCount, markPair, r);

    rounds.push({
      roundNumber: r + 1,
      matches,
      restingPlayers,
      completed: false,
    });
  }

  return rounds;
}

function buildMatches(
  pool: string[],
  courts: number,
  getPairCount: (a: string, b: string) => number,
  markPair: (a: string, b: string) => void,
  roundIdx: number,
): Match[] {
  const matches: Match[] = [];
  const used = new Set<string>();

  // Rotate pool so different players always end up together
  const rotated = [...pool.slice(roundIdx % pool.length), ...pool.slice(0, roundIdx % pool.length)];

  // Greedy: for each court take 4 players and split into two pairs
  for (let c = 0; c < courts; c++) {
    const quartet = rotated.slice(c * 4, c * 4 + 4);
    if (quartet.length < 4) break;

    // Find the best pairing among the 3 possible splits of 4 into 2×2
    const [t1, t2] = bestSplit(quartet, getPairCount);

    markPair(t1[0], t1[1]);
    markPair(t2[0], t2[1]);
    t1.forEach((p) => used.add(p));
    t2.forEach((p) => used.add(p));

    matches.push({
      courtIndex: c,
      team1: [t1[0], t1[1]],
      team2: [t2[0], t2[1]],
      score1: 0,
      score2: 0,
      completed: false,
    });
  }

  return matches;
}

function bestSplit(
  quartet: string[],
  getPairCount: (a: string, b: string) => number,
): [[string, string], [string, string]] {
  const [a, b, c, d] = quartet;
  // 3 possible splits
  const splits: [[string, string], [string, string]][] = [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ];

  let best = splits[0];
  let bestScore = Infinity;

  for (const split of splits) {
    const score =
      getPairCount(split[0][0], split[0][1]) +
      getPairCount(split[1][0], split[1][1]);
    if (score < bestScore) {
      bestScore = score;
      best = split;
    }
  }

  return best;
}

export function computeLeaderboard(tournament: Tournament): PlayerStats[] {
  const stats: Record<string, PlayerStats> = {};

  tournament.players.forEach((p) => {
    stats[p] = { name: p, points: 0, wins: 0, ties: 0, losses: 0, rank: 0 };
  });

  for (const round of tournament.rounds) {
    // sit-out points
    for (const p of round.restingPlayers) {
      if (stats[p]) stats[p].points += tournament.sitOutPoints;
    }

    for (const match of round.matches) {
      if (!match.completed) continue;

      const { team1, team2, score1, score2 } = match;
      const winBonus = tournament.winBonus ?? 0;
      const drawBonus = tournament.drawBonus ?? 0;

      // Points from match
      team1.forEach((p) => {
        if (stats[p]) {
          stats[p].points += score1;
          if (score1 > score2) {
            stats[p].wins++;
            stats[p].points += winBonus;
          } else if (score1 === score2) {
            stats[p].ties++;
            stats[p].points += drawBonus;
          } else {
            stats[p].losses++;
          }
        }
      });

      team2.forEach((p) => {
        if (stats[p]) {
          stats[p].points += score2;
          if (score2 > score1) {
            stats[p].wins++;
            stats[p].points += winBonus;
          } else if (score1 === score2) {
            stats[p].ties++;
            stats[p].points += drawBonus;
          } else {
            stats[p].losses++;
          }
        }
      });
    }
  }

  const sorted = Object.values(stats).sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  // Assign ranks (tied players share same rank)
  let rank = 1;
  sorted.forEach((s, i) => {
    if (i > 0 && sorted[i - 1].points !== s.points) {
      rank = i + 1;
    }
    s.rank = rank;
  });

  return sorted;
}
