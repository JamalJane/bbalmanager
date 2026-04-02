const HOF_CRITERIA = {
  championships: { min: 1, weight: 3 },
  all_star_selections: { min: 3, weight: 2 },
  peak_overall: { min: 88, weight: 2 },
  career_wins_above_replacement: { min: 20, weight: 2 },
  years_played: { min: 8, weight: 1 },
  finals_mvp: { min: 1, weight: 3 },
  season_mvp: { min: 1, weight: 3 },
  all_defensive: { min: 2, weight: 1 }
};

export async function awardLegacyPoints(supabase, gmProfileId, event, points) {
  const { data, error } = await supabase
    .from('legacy_score_log')
    .insert({
      gm_profile_id: gmProfileId,
      event_type: event.type,
      description: event.description,
      points: points,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;

  await supabase.rpc('increment_legacy_score', {
    gm_id: gmProfileId,
    delta: points
  });

  return data;
}

export function checkFranchiseRecords(gmProfileId, seasonData) {
  const brokenRecords = [];

  const { teamRecord, leagueRecord } = seasonData;

  const recordTypes = [
    { key: 'most_wins', value: seasonData.wins, threshold: teamRecord?.most_wins || 0 },
    { key: 'most_points', value: seasonData.points_for, threshold: teamRecord?.most_points || 0 },
    { key: 'best_offense', value: seasonData.ortg, threshold: teamRecord?.best_offense || 0 },
    { key: 'best_defense', value: seasonData.drtg, threshold: teamRecord?.best_defense || 0 },
    { key: 'most_3pt', value: seasonData.threes_made, threshold: teamRecord?.most_3pt || 0 }
  ];

  for (const record of recordTypes) {
    if (record.value > record.threshold) {
      brokenRecords.push({
        gm_profile_id: gmProfileId,
        season_id: seasonData.seasonId,
        record_type: record.key,
        value: record.value,
        previous_record: record.threshold,
        broken_at: new Date().toISOString()
      });
    }
  }

  return brokenRecords;
}

export function evaluateHOFNominees(players) {
  const nominees = [];

  for (const player of players) {
    let criteriaMet = 0;
    const details = {};

    if (player.championships >= HOF_CRITERIA.championships.min) {
      criteriaMet += HOF_CRITERIA.championships.weight;
      details.championships = player.championships;
    }
    if (player.all_star_selections >= HOF_CRITERIA.all_star_selections.min) {
      criteriaMet += HOF_CRITERIA.all_star_selections.weight;
      details.all_star_selections = player.all_star_selections;
    }
    if (player.peak_overall >= HOF_CRITERIA.peak_overall.min) {
      criteriaMet += HOF_CRITERIA.peak_overall.weight;
      details.peak_overall = player.peak_overall;
    }
    if (player.career_war >= HOF_CRITERIA.career_wins_above_replacement.min) {
      criteriaMet += HOF_CRITERIA.career_wins_above_replacement.weight;
      details.career_war = player.career_war;
    }
    if (player.years_played >= HOF_CRITERIA.years_played.min) {
      criteriaMet += HOF_CRITERIA.years_played.weight;
      details.years_played = player.years_played;
    }
    if (player.finals_mvp >= HOF_CRITERIA.finals_mvp.min) {
      criteriaMet += HOF_CRITERIA.finals_mvp.weight;
      details.finals_mvp = player.finals_mvp;
    }
    if (player.mvp >= HOF_CRITERIA.season_mvp.min) {
      criteriaMet += HOF_CRITERIA.season_mvp.weight;
      details.mvp = player.mvp;
    }
    if (player.all_defensive >= HOF_CRITERIA.all_defensive.min) {
      criteriaMet += HOF_CRITERIA.all_defensive.weight;
      details.all_defensive = player.all_defensive;
    }

    if (criteriaMet >= 5) {
      nominees.push({
        player_id: player.id,
        player_name: player.name,
        criteria_met: criteriaMet,
        details,
        eligibility: 'immediate'
      });
    } else if (criteriaMet >= 3) {
      nominees.push({
        player_id: player.id,
        player_name: player.name,
        criteria_met: criteriaMet,
        details,
        eligibility: 'wait_period'
      });
    }
  }

  return nominees.sort((a, b) => b.criteria_met - a.criteria_met);
}

export function calculateLegacyScore(gmProfile) {
  const { seasons, championships, mvp, finals_mvp, all_star_selections, franchise_records } = gmProfile;

  const championshipPoints = (championships || 0) * 500;
  const seasonPoints = (seasons || 0) * 50;
  const mvpPoints = (mvp || 0) * 300;
  const finalsPoints = (finals_mvp || 0) * 400;
  const allStarPoints = (all_star_selections || 0) * 100;
  const recordPoints = (franchise_records || 0) * 150;

  return championshipPoints + seasonPoints + mvpPoints + finalsPoints + allStarPoints + recordPoints;
}
