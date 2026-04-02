const AGE_MULTIPLIERS = {
  18: 1.2, 19: 1.3, 20: 1.4, 21: 1.45,
  22: 1.5, 23: 1.5, 24: 1.45,
  25: 1.35, 26: 1.25, 27: 1.15, 28: 1.05,
  29: 0.95, 30: 0.85
};

const AGE_MULTIPLIER_31_PLUS = 0.75;

const MINUTES_MULTIPLIERS = {
  high: { min: 28, mult: 1.2 },
  med: { min: 18, max: 27, mult: 1.0 },
  low: { min: 0, max: 17, mult: 0.8 }
};

const ATTRIBUTES = ['speed', 'defense', 'points', 'assists', 'rebounds'];

const PATHWAY_ATTRIBUTES = {
  'slasher': ['speed', 'points', 'athleticism'],
  'sharpshooter': ['points', 'shooting_3pt', 'shooting_mid'],
  'floor_general': ['assists', 'speed', 'iq'],
  'lockdown': ['defense', 'speed', 'athleticism'],
  'stretch_big': ['points', 'shooting_3pt', 'rebounds'],
  'enforcer': ['rebounds', 'defense', 'strength'],
  'facilitator': ['assists', 'hustle', 'speed'],
  'two_way': ['defense', 'points', 'speed']
};

const PATHWAY_TAGS = {
  'slasher': ['Relentless', 'Foul Magnet'],
  'sharpshooter': ['Hot Hand', 'Corner Specialist'],
  'floor_general': ['Dimer', 'Court Vision'],
  'lockdown': ['Pest', 'Stopper'],
  'stretch_big': ['Floor Spacer', 'Face-Up Threat'],
  'enforcer': ['Brick Wall', 'Rim Protector'],
  'facilitator': ['Glue Guy', 'Secondary Playmaker'],
  'two_way': ['Swiss Army', 'Two-Way Player']
};

const PERSONA_PATHWAY_COMPAT = {
  'raw_diamond': {
    'slasher': 1.4, 'sharpshooter': 1.2, 'floor_general': 1.0, 'lockdown': 1.0,
    'stretch_big': 1.1, 'enforcer': 1.3, 'facilitator': 1.2, 'two_way': 1.3
  },
  'quiet_assassin': {
    'slasher': 1.3, 'sharpshooter': 1.5, 'floor_general': 1.0, 'lockdown': 1.2,
    'stretch_big': 1.0, 'enforcer': 0.8, 'facilitator': 1.0, 'two_way': 1.2
  },
  'locker_room_cancer': {
    'slasher': 1.2, 'sharpshooter': 1.1, 'floor_general': 0.7, 'lockdown': 1.0,
    'stretch_big': 1.0, 'enforcer': 1.2, 'facilitator': 0.5, 'two_way': 0.8
  },
  'underdog': {
    'slasher': 1.4, 'sharpshooter': 1.2, 'floor_general': 1.3, 'lockdown': 1.4,
    'stretch_big': 1.2, 'enforcer': 1.3, 'facilitator': 1.3, 'two_way': 1.4
  },
  'fading_legend': {
    'slasher': 0.7, 'sharpshooter': 1.1, 'floor_general': 1.3, 'lockdown': 1.0,
    'stretch_big': 1.0, 'enforcer': 0.9, 'facilitator': 1.2, 'two_way': 0.9
  },
  'franchise_cornerstone': {
    'slasher': 1.3, 'sharpshooter': 1.3, 'floor_general': 1.5, 'lockdown': 1.2,
    'stretch_big': 1.3, 'enforcer': 1.2, 'facilitator': 1.3, 'two_way': 1.4
  },
  'mercenary': {
    'slasher': 1.3, 'sharpshooter': 1.3, 'floor_general': 1.1, 'lockdown': 1.1,
    'stretch_big': 1.2, 'enforcer': 1.0, 'facilitator': 0.8, 'two_way': 1.1
  },
  'late_bloomer': {
    'slasher': 1.2, 'sharpshooter': 1.4, 'floor_general': 1.3, 'lockdown': 1.1,
    'stretch_big': 1.4, 'enforcer': 1.1, 'facilitator': 1.3, 'two_way': 1.3
  }
};

export function getAgeMultiplier(age) {
  if (AGE_MULTIPLIERS[age]) return AGE_MULTIPLIERS[age];
  return AGE_MULTIPLIER_31_PLUS;
}

export function getMinutesMultiplier(minutes) {
  if (minutes >= MINUTES_MULTIPLIERS.high.min) return MINUTES_MULTIPLIERS.high.mult;
  if (minutes >= MINUTES_MULTIPLIERS.med.min && minutes <= (MINUTES_MULTIPLIERS.med.max || Infinity)) return MINUTES_MULTIPLIERS.med.mult;
  return MINUTES_MULTIPLIERS.low.mult;
}

export function getCompatMult(personaCategory, pathway) {
  if (!personaCategory || !pathway) return 1.0;
  const compat = PERSONA_PATHWAY_COMPAT[personaCategory];
  if (!compat) return 1.0;
  return compat[pathway] ?? 1.0;
}

export function getPathwayTags(pathway) {
  return PATHWAY_TAGS[pathway] || [];
}

export function getAllPathways() {
  return [
    { id: 'slasher', name: 'Slasher', description: 'Finishing, speed, athleticism', tags: ['Relentless', 'Foul Magnet'] },
    { id: 'sharpshooter', name: 'Sharpshooter', description: 'Shooting, off-ball movement', tags: ['Hot Hand', 'Corner Specialist'] },
    { id: 'floor_general', name: 'Floor General', description: 'Playmaking, IQ', tags: ['Dimer', 'Court Vision'] },
    { id: 'lockdown', name: 'Lockdown', description: 'Defense, any position', tags: ['Pest', 'Stopper'] },
    { id: 'stretch_big', name: 'Stretch Big', description: 'Shooting for bigs', tags: ['Floor Spacer', 'Face-Up Threat'] },
    { id: 'enforcer', name: 'Enforcer', description: 'Interior, rebounding', tags: ['Brick Wall', 'Rim Protector'] },
    { id: 'facilitator', name: 'Facilitator', description: 'Passing, hustle', tags: ['Glue Guy', 'Secondary Playmaker'] },
    { id: 'two_way', name: 'Two-Way', description: 'Balanced growth', tags: ['Swiss Army', 'Two-Way Player'] }
  ];
}

export function growthRoll(player, rosterEntry, coaches = []) {
  const age = player.age || 25;
  const potential = player.potential || 70;
  const minutes = rosterEntry?.minutes_avg || 0;
  const pathway = rosterEntry?.dev_pathway || null;
  const personaCategory = player.persona_category || null;

  const ageMult = getAgeMultiplier(age);
  const minMult = getMinutesMultiplier(minutes);
  const compatMult = getCompatMult(personaCategory, pathway);

  const coachBoost = coaches
    .filter(c => pathway && c.specialty === pathway)
    .reduce((sum, c) => sum + (c.level || 1) * 0.02, 0);

  const baseChance = (potential / 100) * ageMult * minMult * compatMult + coachBoost;

  const roll = Math.random();
  const breakoutThreshold = baseChance * 0.05;
  const normalThreshold = baseChance * 0.40;
  const regressionThreshold = baseChance * 0.42;

  if (roll < breakoutThreshold) {
    const attr = getAttributeToImprove(pathway, ATTRIBUTES);
    return { attribute: attr, delta: 2 };
  }

  if (roll < normalThreshold) {
    const attr = getAttributeToImprove(pathway, ATTRIBUTES);
    return { attribute: attr, delta: 1 };
  }

  if (roll < regressionThreshold) {
    const attr = getAttributeToImprove(pathway, ATTRIBUTES);
    return { attribute: attr, delta: -1 };
  }

  return null;
}

function getAttributeToImprove(pathway, attributes) {
  if (pathway && PATHWAY_ATTRIBUTES[pathway]) {
    const pathwayAttrs = PATHWAY_ATTRIBUTES[pathway];
    return pathwayAttrs[Math.floor(Math.random() * pathwayAttrs.length)];
  }
  return attributes[Math.floor(Math.random() * attributes.length)];
}

export function checkPersonaEvolution(player, seasonEvents) {
  const clutchMoments = (seasonEvents || []).filter(e => e.type === 'clutch_moment').length;
  const totalAssists = (seasonEvents || []).filter(e => e.type === 'assist').length;

  if (clutchMoments >= 5 && player.overall >= 80) {
    return 'evolved';
  }

  if (totalAssists >= 300 && player.assists >= 80) {
    return 'evolved';
  }

  return null;
}

export function checkTraitTagUnlock(player, pathway) {
  const traitThresholds = {
    'slasher': { speed: 85, points: 80, threshold: 2 },
    'sharpshooter': { shooting_3pt: 85, shooting_mid: 80, threshold: 2 },
    'floor_general': { assists: 85, iq: 80, threshold: 2 },
    'lockdown': { defense: 85, speed: 80, threshold: 2 },
    'stretch_big': { shooting_3pt: 80, rebounds: 75, threshold: 2 },
    'enforcer': { strength: 85, rebounding: 80, threshold: 2 },
    'facilitator': { assists: 85, hustle: 80, threshold: 2 },
    'two_way': { defense: 85, points: 70, threshold: 2 }
  };

  if (!pathway || !traitThresholds[pathway]) return null;

  const thresholds = traitThresholds[pathway];
  let metCount = 0;

  for (const [attr, threshold] of Object.entries(thresholds)) {
    if (attr === 'threshold') continue;
    if ((player[attr] || 0) >= threshold) metCount++;
  }

  if (metCount >= thresholds.threshold) {
    const traitMap = {
      'slasher': 'Relentless Finisher',
      'sharpshooter': 'Elite Marksman',
      'floor_general': 'Floor General',
      'lockdown': 'Lockdown Defender',
      'stretch_big': 'Floor Spacer',
      'enforcer': 'Interior Force',
      'facilitator': 'Team Engine',
      'two_way': 'Two-Way Threat'
    };
    return traitMap[pathway];
  }

  return null;
}

export function getReadinessScore(player, rosterEntry) {
  const overallScore = Math.max(0, (player.overall - 60)) * 2;
  const potentialScore = (player.potential || 0) * 0.3;
  const moraleScore = (player.morale || 50) * 0.2;
  const ageBonus = player.age <= 22 ? 15 : player.age <= 25 ? 10 : player.age <= 28 ? 5 : 0;

  const baseScore = overallScore + potentialScore + moraleScore + ageBonus;

  if (rosterEntry?.minutes_avg >= 25 && player.overall >= 72) {
    return baseScore + 20;
  }

  return Math.min(100, baseScore);
}

export function applyMidSeasonSwitchPenalty(player) {
  return {
    ...player,
    morale: Math.max(30, (player.morale || 50) - 15),
    dev_pause_weeks: 2
  };
}
