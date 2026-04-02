const PROSPECT_BLURB_TEMPLATES = [
  "Shows flashes of {strength} but needs refinement in {weakness}.",
  "Athletic specimen with {strength}. The jumpshot needs work.",
  "High-IQ player who makes up for {weakness} with elite {strength}.",
  "Projects as a {projection} with continued development.",
  "Intriguing tools: {strength}. Consistency is the question.",
  "Floor spacer with {strength}. Defensive limitations are a concern.",
  "Versatile player who can {strength}. Three-point shooting is suspect.",
  "Defense-first prospect with {strength}. Offense is a work in progress.",
  "Point guard vision with {strength}. Scoring needs polish.",
  "Scoring instinct with {strength}. Playmaking is a question mark.",
  "Physical tools pop: {strength}. Basketball IQ is developing.",
  "Late bloomer with {strength}. Raw but intriguing ceiling."
];

const STRENGTHS = ['elite handles', 'quick first step', 'defensive instincts', 'shooting stroke', 'court vision', 'rebounding instincts', 'athletic burst', 'length', 'footwork', 'high basketball IQ'];
const WEAKNESSES = ['three-point shooting', 'defensive awareness', 'ball handling', 'strength', 'decision making', 'consistency', 'lateral quickness', 'finishing', 'court vision'];
const PROJECTIONS = ['3-and-D wing', 'point forward', 'stretch big', 'two-way guard', 'rim protector', 'secondary playmaker', 'scoring wing', 'athletic big'];

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
const PERSONA_CATEGORIES = ['scorer', 'playmaker', 'defender', 'athletic', 'versatile'];
const PERSONA_SUBS = ['shot_creator', 'floor_general', 'point_forward', 'stretch_big', 'rim_protector', 'glue_guy', 'isolation_star', 'catch_shoot', 'athletic_big', 'defensive_stopper'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAge() {
  const weights = [0.05, 0.10, 0.15, 0.20, 0.20, 0.15, 0.10, 0.05];
  let r = Math.random();
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return 19 + i;
  }
  return 22;
}

function generateBlurb(prospect) {
  const template = randomFrom(PROSPECT_BLURB_TEMPLATES);
  return template
    .replace('{strength}', randomFrom(STRENGTHS))
    .replace('{weakness}', randomFrom(WEAKNESSES))
    .replace('{projection}', randomFrom(PROJECTIONS));
}

function generateAttributes(position, age, isElite = false) {
  const base = isElite ? 65 : 55;
  const variance = isElite ? 15 : 10;

  const getAttr = (min, max) => Math.min(max, Math.max(min, base + Math.floor(Math.random() * variance)));

  const positionDefaults = {
    'PG': { handling: 75, speed: 70, shooting_mid: 65, shooting_3pt: 60, defense: 55 },
    'SG': { shooting_mid: 75, shooting_3pt: 70, speed: 68, handling: 60, defense: 58 },
    'SF': { shooting_mid: 65, speed: 70, defense: 65, shooting_3pt: 62, jump: 65 },
    'PF': { rebounding: 72, strength: 70, shooting_mid: 58, defense: 62, jump: 68 },
    'C': { rebounding: 78, strength: 75, defense: 68, shooting_mid: 45, jump: 65 }
  };

  const defaults = positionDefaults[position] || positionDefaults['SF'];

  return {
    speed: getAttr(defaults.speed, defaults.speed + 10),
    strength: getAttr(defaults.strength, defaults.strength + 10),
    jump: getAttr(defaults.jump, defaults.jump + 10),
    stamina: 70 + Math.floor(Math.random() * 20),
    handling: getAttr(defaults.handling, defaults.handling + 10),
    shooting_mid: getAttr(defaults.shooting_mid, defaults.shooting_mid + 10),
    shooting_3pt: getAttr(defaults.shooting_3pt, defaults.shooting_3pt + 10),
    defense: getAttr(defaults.defense, defaults.defense + 10),
    rebounding: getAttr(defaults.rebounding, defaults.rebounding + 10)
  };
}

export function generateDraftClass(draftClassId, count = 90) {
  const prospects = [];
  const eliteCount = Math.floor(count * 0.1);
  const lotteryCount = Math.floor(count * 0.2);
  const midFirstCount = Math.floor(count * 0.3);

  for (let i = 0; i < count; i++) {
    const age = generateAge();
    const position = randomFrom(POSITIONS);
    const isElite = i < eliteCount;
    const isLottery = i >= eliteCount && i < eliteCount + lotteryCount;
    const isMidFirst = i >= eliteCount + lotteryCount && i < eliteCount + lotteryCount + midFirstCount;

    let baseOverall;
    if (isElite) baseOverall = 72 + Math.floor(Math.random() * 8);
    else if (isLottery) baseOverall = 65 + Math.floor(Math.random() * 7);
    else if (isMidFirst) baseOverall = 58 + Math.floor(Math.random() * 7);
    else baseOverall = 50 + Math.floor(Math.random() * 8);

    const attributes = generateAttributes(position, age, isElite);
    const potential = Math.min(99, baseOverall + 10 + Math.floor(Math.random() * 15));
    const personaCategory = randomFrom(PERSONA_CATEGORIES);

    const prospect = {
      draft_class_id: draftClassId,
      name: `Prospect ${i + 1}`,
      age,
      position,
      overall: baseOverall,
      potential,
      persona_category: personaCategory,
      persona_sub: randomFrom(PERSONA_SUBS),
      ...attributes,
      scouting_report: generateBlurb({ position, age }),
      overall_revealed: false,
      skills_revealed: false,
      potential_revealed: false,
      persona_revealed: false,
      physicals_revealed: false,
      rank: i + 1
    };

    prospects.push(prospect);
  }

  return prospects;
}

export function revealProspectAttributes(prospect, weeksAssigned) {
  const updated = { ...prospect };

  if (weeksAssigned >= 1) updated.overall_revealed = true;
  if (weeksAssigned >= 2) updated.skills_revealed = true;
  if (weeksAssigned >= 3) updated.potential_revealed = true;
  if (weeksAssigned >= 4) updated.persona_revealed = true;

  return updated;
}

export function runCombine(prospects) {
  return prospects.map(p => {
    const combineScore = (p.speed + p.jump + p.strength) / 3;
    const isSurprise = combineScore > 80 && p.overall < 60;
    const isDisappointment = combineScore < 50 && p.overall > 65;

    return {
      ...p,
      physicals_revealed: true,
      combine_height: 72 + Math.floor(Math.random() * 8),
      combine_weight: 190 + Math.floor(Math.random() * 60),
      combine_wingspan: 74 + Math.floor(Math.random() * 6),
      vertical_leap: 28 + Math.floor(Math.random() * 15),
      sprint_time: (10 + Math.random() * 2).toFixed(2),
      bench_press: 8 + Math.floor(Math.random() * 12),
      is_surprise: isSurprise,
      is_disappointment: isDisappointment
    };
  });
}

export function draftPlayer(prospect, teamId, round, pickNumber) {
  return {
    draft_class_id: prospect.draft_class_id,
    team_id: teamId,
    name: prospect.name,
    age: prospect.age,
    position: prospect.position,
    overall: prospect.overall,
    potential: prospect.potential,
    persona_category: prospect.persona_category,
    persona_sub: prospect.persona_sub,
    speed: prospect.speed,
    strength: prospect.strength,
    jump: prospect.jump,
    stamina: prospect.stamina,
    handling: prospect.handling,
    shooting_mid: prospect.shooting_mid,
    shooting_3pt: prospect.shooting_3pt,
    defense: prospect.defense,
    rebounding: prospect.rebounding,
    morale: 70,
    is_revealed: false,
    trait_tags: [],
    contract_years: 4,
    salary: prospect.overall * 100000,
    drafted_round: round,
    drafted_pick: pickNumber
  };
}
