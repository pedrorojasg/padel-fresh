import type { Match, Round, Tournament, PlayerStats } from '../types';

// ─── Pair / Opponent Key ─────────────────────────────────────────────────────

const pairKey = (a: string, b: string): string =>
  a < b ? `${a}|||${b}` : `${b}|||${a}`;

// ─── Perfect-matching enumeration ───────────────────────────────────────────
//
// Returns every way to partition `players` into disjoint pairs.
// Count: n! / (2^(n/2) × (n/2)!)
//   n=4 →  3   n=6 → 15   n=8 → 105   n=10 → 945   n=12 → 10 395
//
// We cap enumeration at 12 active players for performance; larger sets fall
// back to the greedy path inside findBestRoundMatches.

function enumPerfectMatchings(players: string[]): Array<Array<[string, string]>> {
  if (players.length === 0) return [[]];
  if (players.length === 2) return [[[players[0], players[1]]]];

  const [first, ...rest] = players;
  const results: Array<Array<[string, string]>> = [];

  for (let i = 0; i < rest.length; i++) {
    const partner = rest[i];
    const remaining = rest.filter((_, idx) => idx !== i);
    for (const sub of enumPerfectMatchings(remaining)) {
      results.push([[first, partner], ...sub]);
    }
  }

  return results;
}

// ─── Court-split enumeration ─────────────────────────────────────────────────
//
// Given pairs.length == courts * 2, return all ways to assign 2 pairs to each
// court (ordered list of [team1, team2] per court).
// For 4 pairs → 2 courts: 3 ways.  For 6 pairs → 3 courts: 15 ways.

function enumCourtSplits(
  pairs: Array<[string, string]>,
  courts: number,
): Array<Array<[[string, string], [string, string]]>> {
  if (courts === 1) {
    return [[[pairs[0], pairs[1]]]];
  }

  const results: Array<Array<[[string, string], [string, string]]>> = [];

  // Fix the first pair always in the first court to avoid equivalent permutations
  for (let j = 1; j < pairs.length; j++) {
    const courtPair: [[string, string], [string, string]] = [pairs[0], pairs[j]];
    const remaining = pairs.filter((_, idx) => idx !== 0 && idx !== j);
    for (const sub of enumCourtSplits(remaining, courts - 1)) {
      results.push([courtPair, ...sub]);
    }
  }

  return results;
}

// ─── Greedy fallback for large active counts (>12 players) ──────────────────

function greedyMatching(
  active: string[],
  courts: number,
  pairCount: Record<string, number>,
): Match[] {
  const matches: Match[] = [];
  const used = new Set<string>();
  const pool = [...active];

  for (let c = 0; c < courts; c++) {
    const available = pool.filter((p) => !used.has(p));
    if (available.length < 4) break;

    // Pick best 4-player group for this court using least-used pairs heuristic
    // Fix first player, greedily pick the partner with fewest shared history
    const [p1] = available;
    used.add(p1);
    const rest = available.filter((p) => p !== p1);

    const p2 = rest.sort((a, b) => (pairCount[pairKey(p1, a)] ?? 0) - (pairCount[pairKey(p1, b)] ?? 0))[0];
    used.add(p2);

    const rest2 = rest.filter((p) => p !== p2);
    const [p3] = rest2;
    used.add(p3);
    const p4 = rest2
      .filter((p) => p !== p3)
      .sort((a, b) => (pairCount[pairKey(p3, a)] ?? 0) - (pairCount[pairKey(p3, b)] ?? 0))[0];
    used.add(p4);

    matches.push({ courtIndex: c, team1: [p1, p2], team2: [p3, p4], score1: 0, score2: 0, completed: false });
  }

  return matches;
}

// ─── Find the best matches for one round ────────────────────────────────────
//
// Strategy (Social Golfer Problem / 1-factorisation):
//   1. Enumerate ALL perfect matchings of active players into pairs.
//   2. For each matching, enumerate all court splits.
//   3. Score each candidate:
//        partnerRepeats  = Σ pairCount[pair] over all partner pairs  (primary)
//        opponentRepeats = Σ opponentCount[pair] over all opponent pairs (secondary)
//   4. Return the candidate with the lowest combined score.

function findBestRoundMatches(
  active: string[],
  courts: number,
  pairCount: Record<string, number>,
  opponentCount: Record<string, number>,
): Match[] {
  // Fallback for uncommon large counts
  if (active.length > 12) return greedyMatching(active, courts, pairCount);

  const allMatchings = enumPerfectMatchings(active);

  let bestPartner = Infinity;
  let bestOpponent = Infinity;
  let best: Match[] = greedyMatching(active, courts, pairCount); // safe default

  for (const matching of allMatchings) {
    const partnerScore = matching.reduce(
      (acc, [a, b]) => acc + (pairCount[pairKey(a, b)] ?? 0),
      0,
    );

    // Prune: skip if already worse on primary criterion
    if (partnerScore > bestPartner) continue;

    const courtSplits = enumCourtSplits(matching, courts);

    for (const split of courtSplits) {
      // Secondary score: opponent pair repetitions
      let opponentScore = 0;
      for (const [team1, team2] of split) {
        for (const p1 of team1) {
          for (const p2 of team2) {
            opponentScore += opponentCount[pairKey(p1, p2)] ?? 0;
          }
        }
      }

      if (
        partnerScore < bestPartner ||
        (partnerScore === bestPartner && opponentScore < bestOpponent)
      ) {
        bestPartner = partnerScore;
        bestOpponent = opponentScore;
        best = split.map(([team1, team2], ci) => ({
          courtIndex: ci,
          team1,
          team2,
          score1: 0,
          score2: 0,
          completed: false,
        }));
      }
    }
  }

  return best;
}

// ─── Systematic sit-out rotation ─────────────────────────────────────────────
//
// Advance the sit-out window by `sitOutCount` positions each round so that:
//   • Every player sits out the same number of times (±1).
//   • The difference in games played between any two players is at most 1.
//
// Example – 10 players, 2 sit out, 9 rounds (18 total sit-outs ÷ 10 = 1.8):
//   8 players sit out twice (play 7 rounds), 2 sit out once (play 8 rounds).
//   Max difference = 1 game. ✓

function sitOutForRound(players: string[], sitOutCount: number, round: number): string[] {
  if (sitOutCount <= 0) return [];
  const n = players.length;
  const resting: string[] = [];
  for (let i = 0; i < sitOutCount; i++) {
    resting.push(players[(round * sitOutCount + i) % n]);
  }
  return resting;
}

// ─── Main schedule generator ─────────────────────────────────────────────────

export function generateSchedule(players: string[], courts: number): Round[] {
  const n = players.length;
  if (n < 4) return [];

  const activeCount = Math.min(courts * 4, n);
  const effectiveCourts = Math.floor(activeCount / 4);
  if (effectiveCourts === 0) return [];

  const sitOutCount = n - effectiveCourts * 4;

  // Classic Americano: n-1 rounds ensures every player has faced every other
  // at least as partner or opponent (theoretical maximum without repetition).
  const totalRounds = n - 1;

  const pairCount: Record<string, number> = {};      // partner-pair history
  const opponentCount: Record<string, number> = {};  // opponent-pair history
  const rounds: Round[] = [];

  for (let r = 0; r < totalRounds; r++) {
    // 1. Determine resting players via systematic rotation
    const restingPlayers = sitOutForRound(players, sitOutCount, r);
    const restingSet = new Set(restingPlayers);
    const active = players.filter((p) => !restingSet.has(p));

    // 2. Find best matching
    const matches = findBestRoundMatches(active, effectiveCourts, pairCount, opponentCount);

    // 3. Update history
    for (const m of matches) {
      const k = pairKey(m.team1[0], m.team1[1]);
      pairCount[k] = (pairCount[k] ?? 0) + 1;

      const k2 = pairKey(m.team2[0], m.team2[1]);
      pairCount[k2] = (pairCount[k2] ?? 0) + 1;

      // Opponent pairs
      for (const p1 of m.team1) {
        for (const p2 of m.team2) {
          const ok = pairKey(p1, p2);
          opponentCount[ok] = (opponentCount[ok] ?? 0) + 1;
        }
      }
    }

    rounds.push({ roundNumber: r + 1, matches, restingPlayers, completed: false });
  }

  return rounds;
}

// ─── Leaderboard computation ─────────────────────────────────────────────────

export function computeLeaderboard(tournament: Tournament): PlayerStats[] {
  const stats: Record<string, PlayerStats> = {};

  tournament.players.forEach((p) => {
    stats[p] = { name: p, points: 0, gamesPlayed: 0, wins: 0, ties: 0, losses: 0, rank: 0 };
  });

  for (const round of tournament.rounds) {
    // Sit-out points
    for (const p of round.restingPlayers) {
      if (stats[p]) stats[p].points += tournament.sitOutPoints;
    }

    for (const match of round.matches) {
      if (!match.completed) continue;

      const { team1, team2, score1, score2 } = match;
      const winBonus = tournament.winBonus ?? 0;
      const drawBonus = tournament.drawBonus ?? 0;

      team1.forEach((p) => {
        if (!stats[p]) return;
        stats[p].points += score1;
        stats[p].gamesPlayed++;
        if (score1 > score2) { stats[p].wins++; stats[p].points += winBonus; }
        else if (score1 === score2) { stats[p].ties++; stats[p].points += drawBonus; }
        else { stats[p].losses++; }
      });

      team2.forEach((p) => {
        if (!stats[p]) return;
        stats[p].points += score2;
        stats[p].gamesPlayed++;
        if (score2 > score1) { stats[p].wins++; stats[p].points += winBonus; }
        else if (score1 === score2) { stats[p].ties++; stats[p].points += drawBonus; }
        else { stats[p].losses++; }
      });
    }
  }

  const sorted = Object.values(stats).sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name),
  );

  let rank = 1;
  sorted.forEach((s, i) => {
    if (i > 0 && sorted[i - 1].points !== s.points) rank = i + 1;
    s.rank = rank;
  });

  return sorted;
}
