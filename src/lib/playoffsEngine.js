import { supabase } from '../lib/supabase';
import { simGame } from './simEngine';

export async function computeStandings(seasonId) {
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, city, wins, losses, conference, division')
    .order('wins', { ascending: false });

  if (!teams) return [];

  return teams.map((t, i) => ({
    ...t,
    seed: i + 1,
    winPct: (t.wins + t.losses) > 0 ? t.wins / (t.wins + t.losses) : 0.5
  }));
}

export async function generatePlayoffBracket(seasonId) {
  const standings = await computeStandings(seasonId);
  const top6 = standings.slice(0, 6);

  return {
    round1: [
      { id: 1, seed: 1, team: top6[0], opponent: top6[5], round: 1 },
      { id: 2, seed: 2, team: top6[1], opponent: top6[4], round: 1 },
      { id: 3, seed: 3, team: top6[2], opponent: top6[3], round: 1 },
    ],
    semifinals: [],
    finals: [],
    standings
  };
}

function getTeamStrength(team) {
  return {
    ...team,
    strength: Math.max(60, (team.wins / Math.max(1, team.wins + team.losses)) * 40 + 70)
  };
}

function simBestOfSeries(homeTeam, awayTeam) {
  let homeWins = 0;
  let awayWins = 0;
  const maxGames = 3;
  const results = [];

  for (let game = 1; game <= maxGames && homeWins < 2 && awayWins < 2; game++) {
    const isHome = game % 2 === 1;
    const result = simGame(
      getTeamStrength(isHome ? homeTeam : awayTeam),
      getTeamStrength(isHome ? awayTeam : homeTeam)
    );
    const homeWon = result.home_score > result.away_score;
    if (isHome) {
      homeWon ? homeWins++ : awayWins++;
    } else {
      homeWon ? awayWins++ : homeWins++;
    }
    results.push({
      game,
      homeTeam: homeTeam.id,
      awayTeam: awayTeam.id,
      homeScore: result.home_score,
      awayScore: result.away_score,
      winner: homeWon ? homeTeam.id : awayTeam.id
    });
  }

  return {
    winner: homeWins >= 2 ? homeTeam : awayTeam,
    homeWins,
    awayWins,
    results
  };
}

export async function runPlayoffs(bracket) {
  const { round1 } = bracket;
  const semifinals = [];
  const finals = [];

  const round1Results = [];
  for (const series of round1) {
    const result = simBestOfSeries(series.team, series.opponent);
    round1Results.push({ seriesId: series.id, ...result });
  }

  const semisTeams = round1Results.map(r => r.winner);
  const semisResult = simBestOfSeries(semisTeams[0], semisTeams[1]);
  semifinals.push({ seriesId: 'semis-1', ...semisResult });

  const finalsResult = simBestOfSeries(semisTeams[2], semisTeams[3]);
  const thirdPlaceResult = simBestOfSeries(
    round1Results[0].winner,
    round1Results[1].winner
  );
  finals.push({ seriesId: 'finals', ...finalsResult });

  const champion = finalsResult.winner;
  const runnerUp = finalsResult.homeWins >= 2
    ? round1Results[2].winner
    : semisResult.winner;

  return {
    round1: round1Results,
    semifinals,
    finals,
    champion,
    runnerUp,
    thirdPlace: thirdPlaceResult.winner,
    mvp: semisResult.winner
  };
}

export async function savePlayoffResults(seasonId, results, playerTeamId) {
  const narrative = {
    season_id: seasonId,
    event_type: 'playoffs',
    description: `${results.champion.name} are the champions!`,
    triggered_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('narrative_events')
    .insert(narrative)
    .select()
    .single();

  if (error) console.warn('Could not save playoff narrative:', error);
  return data;
}
