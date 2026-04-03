const CHEMISTRY_MULT = { high: 1.03, mid: 1.0, low: 0.97 };
const HOME_COURT = 3;

export const GAME_SPEEDS = {
  quick: { label: 'Quick', possessions: 12, delay: 100, description: '~5 sec' },
  standard: { label: 'Standard', possessions: 24, delay: 400, description: '~15 sec' },
  detailed: { label: 'Detailed', possessions: 48, delay: 800, description: '~45 sec' },
};

export const PLAYBOOK_CALLS = {
  pick_and_roll: { 
    name: 'Pick and Roll', 
    icon: '🎯', 
    specialty: 'x_and_o',
    offenseBonus: 0.12,
    description: '+12% offensive efficiency'
  },
  zone_defense: { 
    name: 'Zone Defense', 
    icon: '🛡️', 
    specialty: 'x_and_o',
    defenseBonus: 0.15,
    description: '+15% defensive stops'
  },
  motion_offense: { 
    name: 'Motion Offense', 
    icon: '🔄', 
    specialty: 'x_and_o',
    offenseBonus: 0.08,
    description: '+8% assists, +8% efficiency'
  },
  isolation: { 
    name: 'Isolation', 
    icon: '⏱️', 
    specialty: 'player_coach',
    offenseBonus: 0.10,
    focusStar: true,
    description: '+10% when focusing star player'
  },
  fast_break: { 
    name: 'Fast Break', 
    icon: '⚡', 
    specialty: 'player_coach',
    offenseBonus: 0.18,
    requiresRun: true,
    description: '+18% if on fast break'
  },
  extra_pass: { 
    name: 'Extra Pass', 
    icon: '🤝', 
    specialty: 'player_coach',
    offenseBonus: 0.06,
    assistBonus: 0.15,
    description: '+6% efficiency, +15% assists'
  },
  full_court_press: { 
    name: 'Full Court Press', 
    icon: '🏃', 
    specialty: 'motivator',
    defenseBonus: 0.12,
    turnoverRisk: 0.08,
    description: '+12% pressure, 8% turnover risk'
  },
  run_and_gun: { 
    name: 'Run and Gun', 
    icon: '💨', 
    specialty: 'motivator',
    offenseBonus: 0.15,
    defensePenalty: 0.10,
    description: '+15% offense, -10% defense'
  },
  energy_boost: { 
    name: 'Energy Boost', 
    icon: '🔥', 
    specialty: 'motivator',
    momentumBonus: 0.15,
    description: '+15% momentum recovery'
  },
  clock_management: { 
    name: 'Clock Management', 
    icon: '⏰', 
    specialty: 'veteran_presence',
    reduceInjury: 0.15,
    description: '-15% injury chance'
  },
  prevent_defense: { 
    name: 'Prevent Defense', 
    icon: '🛑', 
    specialty: 'veteran_presence',
    reduceBigRun: 0.30,
    description: '-30% opponent runs'
  },
  veteran_composure: { 
    name: 'Veteran Composure', 
    icon: '😌', 
    specialty: 'veteran_presence',
    clutchBonus: 0.12,
    description: '+12% in clutch moments'
  },
  development_mode: { 
    name: 'Development Mode', 
    icon: '🌱', 
    specialty: 'player_development',
    youthBonus: 0.20,
    description: '+20% youth player XP'
  },
  youth_focus: { 
    name: 'Youth Focus', 
    icon: '👶', 
    specialty: 'player_development',
    benchBonus: 0.15,
    description: '+15% bench players'
  },
  experiment: { 
    name: 'Experiment', 
    icon: '🔬', 
    specialty: 'player_development',
    varianceBonus: 0.25,
    description: '+25% variance (risky)'
  },
};

export function getPlaybookForCoach(coachSpecialty) {
  return Object.entries(PLAYBOOK_CALLS)
    .filter(([_, call]) => call.specialty === coachSpecialty)
    .map(([id, call]) => ({ id, ...call }));
}

export function calcTeamStrength(team, isHome = false, opponentModifier = 0) {
  const starters = team.starters || [];
  if (starters.length === 0) return 65;

  const starterAvg = starters.reduce((sum, p) => sum + (p.overall || 60), 0) / Math.max(starters.length, 5);

  const chemMult = team.chemistry >= 70 ? CHEMISTRY_MULT.high
    : team.chemistry < 40 ? CHEMISTRY_MULT.low
    : CHEMISTRY_MULT.mid;

  const bestCoachLevel = Math.max(...(team.coaches || []).map(c => c.level || 1), 1);
  const coachBonus = (bestCoachLevel / 5) * 2;

  const homeBonus = isHome ? HOME_COURT : 0;

  const totalStrength = (starterAvg * chemMult) + coachBonus + homeBonus - opponentModifier;
  
  return Math.max(50, Math.min(110, totalStrength));
}

function rollRandomOpponentBonus() {
  return Math.floor(Math.random() * 9) - 3;
}

export function simPossessions(homeTeam, awayTeam, gameContext = {}) {
  const {
    speed = 'standard',
    interventions = {},
    homeCoachSpecialty = null,
    awayCoachSpecialty = null,
    gmStyle = 'rebuilder',
  } = gameContext;

  const speedConfig = GAME_SPEEDS[speed] || GAME_SPEEDS.standard;
  const possessions = speedConfig.possessions;
  const delay = speedConfig.delay;

  const homeStr = calcTeamStrength(homeTeam, true, 0);
  const awayStr = calcTeamStrength(awayTeam, false, 0);
  
  const opponentBonus = rollRandomOpponentBonus();
  const effectiveAwayStr = Math.max(50, awayStr - opponentBonus);

  let homeScore = 0;
  let awayScore = 0;
  const moments = [];
  const playByPlay = [];
  
  let momentum = 0;
  let homeTimeoutsLeft = 6;
  let awayTimeoutsLeft = 6;
  let homeConsecutiveMakes = 0;
  let awayConsecutiveMakes = 0;
  let homeRunPoints = 0;
  let awayRunPoints = 0;
  let careerNightPlayer = null;
  let careerNightPoints = 0;
  let careerNightTriggered = false;
  
  const allPlayers = [
    ...(homeTeam.starters || []).map(p => ({ ...p, team: homeTeam.id, teamName: homeTeam.name || homeTeam.city })),
    ...(awayTeam.starters || []).map(p => ({ ...p, team: awayTeam.id, teamName: awayTeam.name || awayTeam.city })),
  ];

  const getActiveIntervention = (teamId) => {
    if (teamId === homeTeam.id) {
      return interventions.home;
    }
    return interventions.away;
  };

  const getCoachBonus = (teamId, type) => {
    const specialty = teamId === homeTeam.id ? homeCoachSpecialty : awayCoachSpecialty;
    if (!specialty) return 0;
    
    const plays = getPlaybookForCoach(specialty);
    const play = plays.find(p => p.id === interventions.currentPlay);
    if (!play) return 0;
    
    return type === 'offense' ? (play.offenseBonus || 0) : (play.defenseBonus || 0);
  };

  const baseEfficiency = 0.45;
  
  for (let i = 0; i < possessions; i++) {
    const isHomePossession = i % 2 === 0;
    const offense = isHomePossession ? homeTeam : awayTeam;
    const defense = isHomePossession ? awayTeam : homeTeam;
    const offenseStr = isHomePossession ? homeStr : effectiveAwayStr;
    const defenseStr = isHomePossession ? effectiveAwayStr : homeStr;
    const teamId = offense.id;
    
    let shotQuality = baseEfficiency;
    const strDiff = (offenseStr - 75) / 25;
    shotQuality += strDiff * 0.15;
    
    const momentumMod = momentum > 0 
      ? (isHomePossession ? momentum * -0.02 : momentum * 0.03)
      : (isHomePossession ? momentum * 0.03 : momentum * -0.02);
    shotQuality += momentumMod;
    
    const intervention = getActiveIntervention(teamId);
    if (intervention) {
      if (intervention.focusedPlayer) shotQuality += 0.10;
      if (intervention.offenseBoost) shotQuality += intervention.offenseBoost;
    }
    
    shotQuality = Math.max(0.25, Math.min(0.65, shotQuality));
    
    const roll = Math.random();
    let points = 0;
    let playType = 'missed_shot';
    let player = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    
    if (roll < shotQuality) {
      points = 2;
      if (Math.random() < 0.08) points = 3;
      
      const playerMod = (player.overall || 70) / 85;
      if (Math.random() < playerMod * 0.4) {
        points = 3;
      }
      
      if (points === 2) playType = Math.random() < 0.4 ? 'dunk' : 'jump_shot';
      else playType = 'three_pointer';
      
      if (isHomePossession) {
        homeConsecutiveMakes++;
        awayConsecutiveMakes = 0;
        awayRunPoints = 0;
        homeRunPoints += points;
        
        if (homeRunPoints >= 3 && !careerNightTriggered) {
          careerNightPlayer = player;
        }
      } else {
        awayConsecutiveMakes++;
        homeConsecutiveMakes = 0;
        homeRunPoints = 0;
        awayRunPoints += points;
      }
      
      momentum += isHomePossession ? 1 : -1;
    } else if (roll < shotQuality + 0.15) {
      playType = 'turnover';
      momentum += isHomePossession ? -1 : 1;
    } else {
      playType = Math.random() < 0.3 ? 'blocked_shot' : 'missed_shot';
      momentum += isHomePossession ? -0.5 : 0.5;
    }
    
    if (isHomePossession) homeScore += points;
    else awayScore += points;
    
    momentum = Math.max(-5, Math.min(5, momentum));
    
    const quarter = Math.floor(i / (possessions / 4)) + 1;
    const timeRemaining = 12 - (i % (possessions / 4)) * (12 / (possessions / 4));
    
    if (playType !== 'missed_shot' && playType !== 'blocked_shot') {
      playByPlay.push({
        possession: i + 1,
        quarter,
        time: `${Math.floor(timeRemaining)}:${String(Math.floor((timeRemaining % 1) * 60)).padStart(2, '0')}`,
        team: player.teamName,
        player: player.name,
        playType,
        points,
        homeScore,
        awayScore,
        momentum,
      });
    }
    
    if (!careerNightTriggered && careerNightPlayer && careerNightPoints < 10) {
      careerNightPoints += points;
      if (careerNightPoints >= 10) {
        careerNightTriggered = true;
        moments.push({
          event_type: 'career_night',
          is_key_moment: true,
          player_id: careerNightPlayer.id,
          player_name: careerNightPlayer.name,
          team_name: careerNightPlayer.teamName,
          description: `${careerNightPlayer.name} is having a career night! ${careerNightPoints} points already!`,
          quarter,
        });
      }
    }
    
    const absMomentum = Math.abs(momentum);
    if (absMomentum >= 3 && moments.length < 6) {
      const alreadyHadMomentum = moments.some(m => m.event_type === 'momentum_swing' && m.quarter === quarter);
      if (!alreadyHadMomentum) {
        moments.push({
          event_type: 'momentum_swing',
          is_key_moment: true,
          description: momentum > 0 
            ? `${homeTeam.name || homeTeam.city} goes on a ${absMomentum + 2}-0 run!`
            : `${awayTeam.name || awayTeam.city} goes on a ${absMomentum + 2}-0 run!`,
          momentum,
          quarter,
        });
        homeRunPoints = 0;
        awayRunPoints = 0;
      }
    }
    
    const isClutch = (possessions - i) <= 4 && Math.abs(homeScore - awayScore) <= 5;
    if (isClutch && !moments.some(m => m.event_type === 'clutch_moment')) {
      moments.push({
        event_type: 'clutch_moment',
        is_key_moment: true,
        description: 'Crunch time! Both teams fighting for every point!',
        homeScore,
        awayScore,
        quarter,
      });
    }
    
    if (Math.random() < 0.02 && moments.length < 6) {
      const alreadyHadInjury = moments.some(m => m.event_type === 'injury_scare');
      if (!alreadyHadInjury) {
        const injuredPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
        moments.push({
          event_type: 'injury_scare',
          is_key_moment: true,
          player_id: injuredPlayer.id,
          player_name: injuredPlayer.name,
          description: `${injuredPlayer.name} grabs his knee after the play...`,
          quarter,
        });
      }
    }
  }
  
  const winner = homeScore > awayScore ? homeTeam.id : awayTeam.id;
  
  const quarterScores = {
    home: [
      Math.round(homeScore * 0.28),
      Math.round(homeScore * 0.26),
      Math.round(homeScore * 0.24),
      homeScore - Math.round(homeScore * 0.28) - Math.round(homeScore * 0.26) - Math.round(homeScore * 0.24),
    ],
    away: [
      Math.round(awayScore * 0.28),
      Math.round(awayScore * 0.26),
      Math.round(awayScore * 0.24),
      awayScore - Math.round(awayScore * 0.28) - Math.round(awayScore * 0.26) - Math.round(awayScore * 0.24),
    ],
  };

  return {
    homeScore,
    awayScore,
    winner,
    moments,
    playByPlay,
    quarterScores,
    opponentBonus,
    finalMomentum: momentum,
  };
}

export function simGame(homeTeam, awayTeam, gameContext = {}) {
  const result = simPossessions(homeTeam, awayTeam, gameContext);
  return {
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    winner: result.winner,
  };
}

export function generateKeyMoments(homeTeam, awayTeam, homeScore, awayScore, quarter = 4) {
  const moments = [];
  const scoreDiff = Math.abs(homeScore - awayScore);
  const allPlayers = [...(homeTeam.starters || []), ...(awayTeam.starters || [])];

  if (Math.random() < 0.3 && scoreDiff <= 10) {
    moments.push({
      event_type: 'momentum_swing',
      is_key_moment: true,
      description: Math.random() > 0.5
        ? `${homeTeam.name} goes on a run!`
        : `${awayTeam.name} responds!`
    });
  }

  if (scoreDiff <= 5 && Math.random() < 0.5) {
    moments.push({
      event_type: 'clutch_moment',
      is_key_moment: true,
      description: 'Both teams trading baskets in the final minutes!'
    });
  }

  if (!careerNightTriggered) {
    const potentialPlayers = allPlayers.filter(p => (p.potential || 80) > 85);
    if (potentialPlayers.length > 0 && Math.random() < 0.25) {
      const star = potentialPlayers[Math.floor(Math.random() * potentialPlayers.length)];
      moments.push({
        event_type: 'career_night',
        is_key_moment: true,
        player_id: star.id,
        player_name: star.name,
        description: `${star.name} is having a career night!`
      });
    }
  }

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
    
    const opponentBonus = rollRandomOpponentBonus();
    const effectiveAwayStr = Math.max(50, awayStr - opponentBonus);

    const homeVariance = (Math.random() * 20) - 10;
    const awayVariance = (Math.random() * 20) - 10;

    const homeScore = Math.round(98 + (homeStr - 65) * 1.5 + homeVariance);
    const awayScore = Math.round(98 + (effectiveAwayStr - 65) * 1.5 + awayVariance);

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

export function applyGMIntervention(type, gameState, playbookCall = null) {
  const newState = { ...gameState };
  
  switch (type) {
    case 'timeout':
      newState.momentum = 0;
      newState.timeoutsLeft = Math.max(0, (gameState.timeoutsLeft || 6) - 1);
      newState.interventionEffect = 'momentum_reset';
      break;
    case 'substitution':
      newState.freshPlayerTurns = 3;
      newState.interventionEffect = 'fresh_player';
      break;
    case 'play_call':
      if (playbookCall) {
        newState.currentPlay = playbookCall.id;
        newState.offenseBoost = playbookCall.offenseBonus || 0.10;
      }
      newState.interventionEffect = 'play_called';
      break;
    case 'double_team':
      newState.opponentPenalty = 0.25;
      newState.interventionEffect = 'defense_boost';
      break;
    default:
      break;
  }
  
  return newState;
}

export function checkAutoTimeoutNeeded(gameState) {
  const { momentum, opponentRunPoints } = gameState;
  
  if (momentum <= -4 || momentum >= 4) {
    if (Math.abs(opponentRunPoints || 0) >= 6) {
      return {
        needed: true,
        direction: momentum > 0 ? 'against' : 'favor',
        runPoints: opponentRunPoints,
        message: momentum > 0 
          ? `Opponent on a ${opponentRunPoints}-0 run! Use Timeout?`
          : `You're on a ${Math.abs(opponentRunPoints)}-0 run! Keep going?`,
      };
    }
  }
  
  return { needed: false };
}
