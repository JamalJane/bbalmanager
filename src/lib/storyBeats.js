const STORY_TEMPLATES = {
  pathway_switch: [
    "{player} has been in the development league for {weeks} weeks without assignment. Time to choose a pathway.",
    "The coaching staff recommends assigning {player} to a specific development pathway.",
    "{player} is ready for pathway assignment. Their play style suggests {suggestion}.",
    "Development bottleneck detected: {player} needs direction. Consider assigning them to a pathway.",
    "{player}'s potential is being wasted in limbo. A pathway choice is imminent.",
    "Scouts report: {player} shows promise but lacks focus. Pathway assignment recommended."
  ],
  breakout_game: [
    "{player} drops {points} points in their best performance of the season!",
    "A career night from {player} - {points} points, {assists} assists!",
    "{player} emerges as a go-to option with a {points}-point explosion.",
    "{player} puts on a show with {points} points, silencing all doubters.",
    "From the shadows to the spotlight: {player} explodes for {points}.",
    "{player}'s {points}-point performance draws attention from league scouts.",
    "The breakout game everyone expected from {player} finally arrives.",
    "{player} takes over the game with {points} points in a statement performance."
  ],
  persona_conflict: [
    "Tensions rising between {player1} and {player2} on the court. Chemistry at stake.",
    "{player1} is frustrated with {player2}'s playing style. The locker room feels it.",
    "Personality clash detected: {player1} (the {persona1}) vs {player2} (the {persona2}).",
    "{player1} and {player2} nearly come to blows during practice.",
    "Sources say {player1} demanded a trade, pointing fingers at {player2}.",
    "{player1}'s patience with {player2} has officially run out.",
    "The {player1}-{player2} pairing has become toxic. Immediate action required."
  ],
  position_shift: [
    "{player} could thrive at a different position. Staff suggests trying {newPosition}.",
    "The coaching staff sees {player} as a future {newPosition}. Worth testing?",
    "{player}'s skill set is better suited for {newPosition}. Consider a switch.",
    "Position experiment: {player} tested at {newPosition} in practice today.",
    "The {newPosition} experiment for {player} shows promise in early results.",
    "Tactical shift: {player} transitions to {newPosition} role."
  ],
  controversial_trade: [
    "Fan reaction to the {player} trade is mixed. Some call it genius, others question it.",
    "Former {player} speaks out about the trade: 'I never saw it coming.'",
    "The {player} trade is still being debated. Only time will tell.",
    "NBA Twitter erupts over the {player} blockbuster. Analysts are split.",
    "{player}'s former teammates react to the trade on social media.",
    "Trade grade: Experts give the {player} deal a {grade}.",
    "Inside the deal: How the {player} trade came together in the final hours."
  ],
  dev_league_ready: [
    "{player} is showing all the signs of being ready for the main roster.",
    "Ready for a call-up: {player}'s readiness score has hit {score}.",
    "Development complete for {player}. Time to bring them up?",
    "{player}'s progression has been remarkable. Promotion imminent?",
    "The G-League has done its job: {player} is NBA-ready.",
    "{player} dominates another development league game. Call him up.",
    "Scouts recommend promoting {player} to the main roster.",
    "{player} shows elite potential. Ready for the big stage."
  ],
  momentum_swing: [
    "{team} goes on a {points}-2 run to take control of the game!",
    "The momentum has shifted. {team} is feeling it.",
    "{player} sparks a crucial run with back-to-back baskets.",
    "{team} wakes up with a 15-5 run that changes everything.",
    "The crowd roars as {team} goes on a furious rally.",
    "{player} can't miss! {team} on a 10-0 run.",
    "Momentum lost: {team} watches their lead evaporate with a {points}-0 run.",
    "{team} recaptures the spark with an unexpected offensive surge."
  ],
  clutch_moment: [
    "This one is for all the marbles. {player} calls for the ball.",
    "Crunch time. {player} has the ball in their hands.",
    "Pressure moment for {player}. The season could hang in the balance.",
    "{player} rises up for the potentially game-winning shot...",
    "Down to the wire. {player} has a chance to be the hero.",
    "The crowd holds its breath. {player} brings the ball up.",
    "{player} delivers in the clutch with a step-back jumper!",
    "Clutch gene: {player} sinks the free throws to seal it."
  ],
  injury_scare: [
    "{player} grabs their leg after the play. Medical staff is on the court.",
    "Scary moment as {player} goes down. They'll need to be checked.",
    "{player} looks shaken up. Hopefully just a scare.",
    "{player} limps off the court but signals he's okay.",
    "A collective gasp as {player} stays down. Update pending.",
    "{player} appears to have tweaked something. Trainers checking.",
    "Injury timeout: {player} receives attention from the medical team.",
    "{player} shakes it off and stays in the game. Crisis averted."
  ],
  persona_revealed: [
    "After weeks of observation, {player}'s true persona is clear: {persona}.",
    "The scouting report on {player} is complete. They're a {persona}.",
    "{player} has revealed their identity on the court: {persona}.",
    "Persona analysis complete: {player} is officially a {persona}.",
    "What we've suspected is now confirmed: {player} is a {persona}.",
    "{player}'s playing style has crystallized. The label fits: {persona}.",
    "Long-term scouting pays off: {player} unveiled as a {persona}.",
    "The {persona} tag for {player} explains everything about their game."
  ],
  season_start: [
    "The season begins. {team} has {wins} wins and {losses} losses so far.",
    "New season, new challenges. {team} is aiming for the playoffs.",
    "The grind starts now. {team} has 24 weeks to prove themselves.",
    "Season tip-off! {team} kicks off their campaign tonight.",
    "24-game gauntlet begins. {team} targets a championship run.",
    "The journey to glory starts here. {team} is locked and loaded.",
    "Can {team} capture lightning in a bottle this season?",
    "{team} opens training camp with championship aspirations."
  ],
  playoff_push: [
    "The final stretch. {team} needs to win {needed} of {remaining} to secure a playoff spot.",
    "Playoff race heating up. {team} is in the {seed} seed.",
    "Crunch time for {team}. The postseason is within reach.",
    "{team} must win out to clinch home court advantage.",
    "Magic number: {needed}. {team} controls their own destiny.",
    "{team} faces a must-win scenario against {opponent} tonight.",
    "Playoff probability spikes for {team} after recent win streak.",
    "{team} locks up the {seed} seed with clutch victory."
  ],
  championship_win: [
    "{team} captures the championship! {player} named Finals MVP!",
    "Champions! {team} dynasty complete with dominant Finals victory.",
    "The trophy is theirs: {team} wins it all!",
    "{player} delivers legendary performance in clinching game.",
    "History made: {team} celebrates their championship triumph.",
    "Confetti falls as {team} crowns themselves champions.",
    "The city erupts: {team} are your {year} champions!",
    "{team} completes their journey with an unforgettable championship win."
  ],
  trade_demand: [
    "{player} has requested a trade, sources confirm.",
    "Breaking: {player} wants out. Trade discussions underway.",
    "{player}'s camp has informed {team} of his desire to move on.",
    "Tensions boil over: {player} demands to be traded.",
    "The {player} era in {team} appears to be over.",
    "League sources: {player} has list of preferred destinations.",
    "{player} addresses trade rumors: 'I want to compete for a championship.'",
    "{team} navigates {player} trade request as deadline approaches."
  ],
  all_star_selection: [
    "{player} voted as an All-Star for the {nth} time!",
    "Well deserved: {player} earns All-Star nod.",
    "The {year} All-Star reserves announced: {player} makes the cut!",
    "{player} joins elite company with All-Star selection.",
    "Starting Five: {player} selected as {team} representative.",
    "All-Star weekend awaits: {player} receives the call.",
    "Career milestone: {player} named to {year} All-Star team.",
    "{player} continues dominant season, earns All-Star honors."
  ],
  rookie_sensation: [
    "{player} is making history as a rookie. Scout the numbers.",
    "Rookie of the Year race: {player} emerges as frontrunner.",
    "The {year} rookie class has a star: {player} drops career-high.",
    "{player} becomes youngest player to achieve this milestone.",
    "Scouts didn't see this coming: {player} is an overnight sensation.",
    "{player}'s rookie campaign has exceeded all expectations.",
    "Historic start: {player} leads all rookies in scoring.",
    "Future is now: {player} plays like a 10-year veteran."
  ],
  locker_room_issue: [
    "Sources: Chemistry problems plague the {team} locker room.",
    "Internal issues surface for {team} as tensions rise.",
    "Veterans intervene after {team} practice incident.",
    "Reports of discord in {team} camp. Leadership questioned.",
    "{player} addresses rumors: 'We're still united.'",
    "Anonymous source: '{team} has bigger problems than on-court.'",
    "Team meeting called. {team} attempts to patch things up.",
    "{coach} meets individually with players to address concerns."
  ],
  contract_extension: [
    "{player} signs extension! {years}-year deal worth ${amount}.",
    "Deal done: {player} commits future to {team}.",
    "{player} puts pen to paper on lucrative extension.",
    "Security: {player} locks in long-term with {team}.",
    "Big news: {player} becomes highest-paid player in {team} history.",
    "{player} bypasses free agency, signs {years}-year extension.",
    "Loyalty pays: {player} stays with {team} for the long haul.",
    "{player} extension signals {team}'s championship intentions."
  ],
  free_agency_signing: [
    "{player} agrees to terms with {team}!",
    "Blockbuster: {player} picks {team} over other suitors.",
    "{player} makes it official: signing with {team}.",
    "The {player} sweepstakes are over: {team} wins.",
    "{player} brings championship experience to {team}.",
    "Salary cap implications: {player} signing reshapes {team}'s future.",
    "{player} chooses {team} as his preferred destination.",
    "Market analysis: {player} contract a win for {team}."
  ],
  gm_reputation_change: [
    "League insiders note {gm}'s reputation as a {reputation_type} GM.",
    "{gm} praised for {reputation_type} decision-making in recent moves.",
    "Analysts weigh in: {gm} improving {reputation_type} standing.",
    "{gm}'s {reputation_type} approach winning league respect.",
    "Executive survey: {gm} rated among top {reputation_type} GMs.",
    "{gm} continues to build {reputation_type} legacy with smart moves.",
    "Rumor mill: {gm} becoming known for {reputation_type} tactics.",
    "{gm}'s {reputation_type} reputation opens doors in trade talks."
  ]
};

export function generateStoryBeat(eventType, data = {}) {
  const templates = STORY_TEMPLATES[eventType];
  if (!templates) return null;

  const template = templates[Math.floor(Math.random() * templates.length)];
  const description = interpolateTemplate(template, data);

  return {
    event_type: eventType,
    description,
    ...data
  };
}

function interpolateTemplate(template, data) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

export async function saveStoryBeat(supabase, beat, context) {
  const { data, error } = await supabase
    .from('narrative_events')
    .insert({
      season_id: context.seasonId,
      team_id: context.teamId,
      player_id: context.playerId || null,
      event_type: beat.event_type,
      description: beat.description,
      triggered_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function checkStoryTriggers(weekData) {
  const beats = [];
  const { player, team, week } = weekData;

  const weeksInDev = player?.assigned_at
    ? Math.floor((Date.now() - new Date(player.assigned_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 0;

  if (player && !player.dev_pathway && weeksInDev >= 3) {
    beats.push(generateStoryBeat('pathway_switch', {
      player: player.name,
      weeks: weeksInDev,
      suggestion: player.persona_sub || 'a balanced approach'
    }));
  }

  if (player && player.breakout_game) {
    beats.push(generateStoryBeat('breakout_game', {
      player: player.name,
      points: player.points_scored || Math.floor(Math.random() * 20) + 25,
      assists: Math.floor(Math.random() * 10) + 5
    }));
  }

  if (player && player.morale < 30 && Math.random() < 0.3) {
    beats.push(generateStoryBeat('persona_conflict', {
      player1: player.name,
      player2: 'another starter',
      persona1: player.persona_sub || 'vocal leader',
      persona2: 'quiet professional'
    }));
  }

  if (player && !player.in_main_roster && weeksInDev >= 4 && player.overall >= 70) {
    beats.push(generateStoryBeat('dev_league_ready', {
      player: player.name,
      score: Math.round((player.overall || 60) * 0.8 + (player.potential || 70) * 0.2)
    }));
  }

  if (team && week >= 8) {
    const totalGames = (team.wins || 0) + (team.losses || 0);
    const winPct = totalGames > 0 ? (team.wins || 0) / totalGames : 0.5;
    if (winPct > 0.4 && winPct < 0.7) {
      beats.push(generateStoryBeat('playoff_push', {
        team: team.name || 'Your Team',
        seed: winPct > 0.6 ? 'top half' : 'bubble',
        needed: Math.ceil((1 - winPct) * 10),
        remaining: 12 - week,
        opponent: 'a rival team'
      }));
    }
  }

  if (player && weekData.isClutchPerformance) {
    beats.push(generateStoryBeat('clutch_moment', {
      player: player.name,
      team: team?.name || 'Team'
    }));
  }

  if (weekData.injuryOccurred) {
    beats.push(generateStoryBeat('injury_scare', {
      player: player?.name || 'A player'
    }));
  }

  if (player && weekData.personaRevealed) {
    beats.push(generateStoryBeat('persona_revealed', {
      player: player.name,
      persona: player.persona_category?.replace(/_/g, ' ') || 'versatile player'
    }));
  }

  return beats;
}

export function getAllEventTypes() {
  return Object.keys(STORY_TEMPLATES);
}

export function getTemplateCount(eventType) {
  return STORY_TEMPLATES[eventType]?.length || 0;
}

export function getTotalTemplateCount() {
  return Object.values(STORY_TEMPLATES).reduce((sum, templates) => sum + templates.length, 0);
}
