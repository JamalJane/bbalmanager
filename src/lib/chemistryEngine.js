const COMPATIBILITY_CEILINGS = {
  'shot_creator': 75,
  'floor_general': 80,
  'point_forward': 75,
  'stretch_big': 70,
  'rim_protector': 70,
  'glue_guy': 90,
  'isolation_star': 65,
  'catch_shoot': 75,
  'athletic_big': 70,
  'defensive_stopper': 75
};

const COACH_MODIFIERS = {
  'veteran_presence': 5,
  'player_development': 4,
  'motivator': 4,
  'x_and_o': 2,
  'player_coach': 6,
  'shooting': 4,
  'defense': 4,
  'playmaking': 3,
  'conditioning': 3,
  'iq': 5,
  'development': 4
};

function getCompatibilityCeiling(personaA, personaB) {
  const ceilA = COMPATIBILITY_CEILINGS[personaA] || 65;
  const ceilB = COMPATIBILITY_CEILINGS[personaB] || 65;
  return Math.min(ceilA, ceilB);
}

export function initChemistryPairs(teamId, newPlayerId, newPlayerCategory, existingRoster) {
  const pairs = [];
  const ceiling = COMPATIBILITY_CEILINGS[newPlayerCategory] || 65;

  for (const existing of existingRoster) {
    const pairCeiling = getCompatibilityCeiling(newPlayerCategory, existing.persona_sub || 'glue_guy');
    const initialScore = Math.round(pairCeiling * 0.5);

    pairs.push({
      team_id: teamId,
      player_a_id: newPlayerId,
      player_b_id: existing.player_id,
      chemistry_score: initialScore,
      ceiling: pairCeiling,
      relationship_type: 'teammate'
    });

    pairs.push({
      team_id: teamId,
      player_a_id: existing.player_id,
      player_b_id: newPlayerId,
      chemistry_score: initialScore,
      ceiling: pairCeiling,
      relationship_type: 'teammate'
    });
  }

  return pairs;
}

export function updateChemistryPairs(teamId, weekEvents, existingPairs = []) {
  const updatedPairs = [];

  for (const pair of existingPairs) {
    if (pair.team_id !== teamId) continue;

    let newScore = pair.chemistry_score;
    const timeDrift = 1;
    newScore += timeDrift;

    const relevantEvents = weekEvents.filter(e =>
      (e.player_id === pair.player_a_id || e.player_id === pair.player_b_id)
    );

    for (const event of relevantEvents) {
      if (event.type === 'clutch_moment') {
        const bonus = pair.chemistry_score > 60 ? 3 : -2;
        newScore += bonus;
      }
      if (event.type === 'good_play') {
        newScore += 2;
      }
      if (event.type === 'mistake') {
        newScore -= 1;
      }
    }

    const roleA = relevantEvents.find(e => e.player_id === pair.player_a_id)?.role || 'rotation';
    const roleB = relevantEvents.find(e => e.player_id === pair.player_b_id)?.role || 'rotation';
    if (roleA === 'starter' && roleB === 'starter') {
      newScore += 1;
    }

    newScore = Math.max(0, Math.min(pair.ceiling || 80, newScore));

    let relationshipType = 'teammate';
    if (newScore >= 85) relationshipType = 'close_chemistry';
    else if (newScore >= 70) relationshipType = 'good_fit';
    else if (newScore >= 50) relationshipType = 'teammate';
    else if (newScore >= 30) relationshipType = 'friction';
    else relationshipType = 'conflict';

    updatedPairs.push({
      ...pair,
      chemistry_score: newScore,
      relationship_type: relationshipType
    });
  }

  return updatedPairs;
}

export function calcTeamChemistry(teamId, pairs = [], roster = []) {
  if (pairs.length === 0 || roster.length === 0) return 50;

  const starters = roster.filter(r => r.role === 'starter' || r.minutes_avg >= 25);
  const starterIds = new Set(starters.map(s => s.player_id));

  let totalWeight = 0;
  let weightedSum = 0;

  for (const pair of pairs) {
    if (pair.team_id !== teamId) continue;

    const pairWeight = starterIds.has(pair.player_a_id) && starterIds.has(pair.player_b_id) ? 2 : 1;
    weightedSum += pair.chemistry_score * pairWeight;
    totalWeight += pairWeight;
  }

  if (totalWeight === 0) return 50;

  return Math.round(weightedSum / totalWeight);
}

export function getChemistryRating(chemistryScore) {
  if (chemistryScore >= 80) return 'elite';
  if (chemistryScore >= 65) return 'high';
  if (chemistryScore >= 45) return 'average';
  if (chemistryScore >= 30) return 'low';
  return 'problem';
}

export function applyCoachModifier(baseChange, coaches = []) {
  let modifier = 0;

  for (const coach of coaches) {
    if (coach.specialty && COACH_MODIFIERS[coach.specialty]) {
      const boost = COACH_MODIFIERS[coach.specialty] * (coach.level / 5);
      modifier += boost;
    }
  }

  return Math.round(baseChange * (1 + modifier / 100));
}
