const CHEMISTRY_MULT = { high: 1.03, mid: 1.0, low: 0.97 };
const HOME_COURT = 3;

export function calcTeamStrength(team, isHome = false) {
  const starters = team.starters || [];
  if (starters.length === 0) return 65;

  const starterAvg = starters.reduce((sum, p) => sum + (p.overall || 60), 0) / Math.max(starters.length, 5);

  const chemMult = team.chemistry >= 70 ? CHEMISTRY_MULT.high
    : team.chemistry < 40 ? CHEMISTRY_MULT.low
    : CHEMISTRY_MULT.mid;

  const bestCoachLevel = Math.max(...(team.coaches || []).map(c => c.level || 1), 1);
  const coachBonus = (bestCoachLevel / 5) * 2;

  const homeBonus = isHome ? HOME_COURT : 0;

  return (starterAvg * chemMult) + coachBonus + homeBonus;
}

export function simGame(homeTeam, awayTeam) {
  const homeStr = calcTeamStrength(homeTeam, true);
  const awayStr = calcTeamStrength(awayTeam, false);

  const homeVariance = (Math.random() * 20) - 10;
  const awayVariance = (Math.random() * 20) - 10;

  const homeScore = Math.round(98 + (homeStr - 65) * 1.5 + homeVariance);
  const awayScore = Math.round(98 + (awayStr - 65) * 1.5 + awayVariance);

  return {
    homeScore: Math.max(82, Math.min(128, homeScore)),
    awayScore: Math.max(82, Math.min(128, awayScore)),
    winner: homeScore > awayScore ? homeTeam.id : awayTeam.id
  };
}

export function generateKeyMoments(homeTeam, awayTeam, homeScore, awayScore) {
  const moments = [];
  const scoreDiff = Math.abs(homeScore - awayScore);
  const allPlayers = [...(homeTeam.starters || []), ...(awayTeam.starters || [])];

  if (Math.random() < 0.4) {
    moments.push({
      event_type: 'momentum_swing',
      is_key_moment: true,
      description: Math.random() > 0.5
        ? `${homeTeam.name} goes on a 12-2 run!`
        : `${awayTeam.name} responds with a 10-0 spurt!`
    });
  }

  if (scoreDiff <= 5) {
    moments.push({
      event_type: 'clutch_moment',
      is_key_moment: true,
      description: 'Both teams trading baskets in the final minutes!'
    });
  }

  allPlayers.forEach(p => {
    if (!p.trait_tags) return;
    const hasClutchTrait = p.trait_tags.includes('Ice in his Veins') || p.trait_tags.includes('Clutch');
    const prob = (hasClutchTrait && scoreDiff <= 5) ? 0.7 : 0.15;
    if (Math.random() < prob) {
      moments.push({
        event_type: 'persona_moment',
        is_key_moment: true,
        player_id: p.id,
        player_name: p.name,
        description: `${p.name} takes over in crunch time!`
      });
    }
  });

  allPlayers.forEach(p => {
    if (Math.random() < 0.02) {
      moments.push({
        event_type: 'injury_scare',
        player_id: p.id,
        player_name: p.name,
        description: `${p.name} grabs his knee after the play...`
      });
    }
  });

  allPlayers.forEach(p => {
    const potentialThreshold = ((p.potential || 80) * 0.9);
    if (p.overall > potentialThreshold && Math.random() < 0.5) {
      moments.push({
        event_type: 'breakout_alert',
        is_key_moment: true,
        player_id: p.id,
        player_name: p.name,
        description: `${p.name} is having a career night!`
      });
    }
  });

  return moments;
}

export function simAllAIGames(teams) {
  const results = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length - 1; i += 2) {
    if (i + 1 >= shuffled.length) break;
    const home = shuffled[i];
    const away = shuffled[i + 1];

    const homeStr = calcTeamStrength(home, true);
    const awayStr = calcTeamStrength(away, false);

    const homeVariance = (Math.random() * 20) - 10;
    const awayVariance = (Math.random() * 20) - 10;

    const homeScore = Math.round(98 + (homeStr - 65) * 1.5 + homeVariance);
    const awayScore = Math.round(98 + (awayStr - 65) * 1.5 + awayVariance);

    const homeWin = homeScore > awayScore;
    results.push({
      home_team_id: home.id,
      away_team_id: away.id,
      home_score: Math.max(82, Math.min(128, homeScore)),
      away_score: Math.max(82, Math.min(128, awayScore)),
      winner_id: homeWin ? home.id : away.id,
      home_wins: homeWin ? 1 : 0,
      away_wins: homeWin ? 0 : 1
    });
  }

  return results;
}

export function applyGMIntervention(type, moment, gameState) {
  switch (type) {
    case 'substitution':
      return { ...gameState, interventionEffect: 'fresh_player', interventionTurns: 3 };
    case 'timeout':
      return { ...gameState, momentum: 0, interventionEffect: 'reset_run' };
    case 'play_call':
      return { ...gameState, focusedPlayer: moment.player_id, interventionEffect: 1.08 };
    case 'double_team':
      return { ...gameState, interventionEffect: 'opponent_penalty', penaltyAmount: 0.4 };
    default:
      return gameState;
  }
}
