import { supabase } from '../lib/supabase';

const AWARD_TYPES = ['mvp', 'dpoy', 'mip'];

export async function computeSeasonAwards(seasonId) {
  const [standingsResult, startersResult] = await Promise.all([
    supabase.from('teams').select('id, name, wins, losses').order('wins', { ascending: false }),
    supabase
      .from('rosters')
      .select('player_id, team_id, role, players(id, name, position, points, assists, rebounds, defense, overall, potential, age, speed)')
      .eq('is_dev_league', false)
      .eq('role', 'starter')
  ]);

  const standings = standingsResult.data || [];
  const starters = startersResult.data || [];

  const teamWinPct = {};
  for (const t of standings) {
    teamWinPct[t.id] = (t.wins + t.losses) > 0 ? t.wins / (t.wins + t.losses) : 0.5;
  }

  const allPlayers = starters
    .map(r => r.players)
    .filter(Boolean)
    .map(p => ({
      ...p,
      team_id: starters.find(r => r.player_id === p.id)?.team_id,
      winPct: teamWinPct[starters.find(r => r.player_id === p.id)?.team_id] || 0.5
    }));

  const mvp = allPlayers
    .map(p => ({
      ...p,
      mvp_score: p.overall * p.winPct * (1 + (p.points + p.assists + p.rebounds) / 300)
    }))
    .sort((a, b) => b.mvp_score - a.mvp_score)[0];

  const dpoy = allPlayers
    .map(p => ({
      ...p,
      dpoy_score: p.defense * p.winPct * (1 + p.speed / 200)
    }))
    .sort((a, b) => b.dpoy_score - a.dpoy_score)[0];

  const mip = allPlayers
    .map(p => ({
      ...p,
      mip_score: ((p.potential - p.overall) / p.overall) * p.speed * (p.age < 25 ? 1.5 : 1)
    }))
    .sort((a, b) => b.mip_score - a.mip_score)[0];

  return [
    buildAward('mvp', mvp),
    buildAward('dpoy', dpoy),
    buildAward('mip', mip)
  ].filter(Boolean);
}

function buildAward(type, player) {
  if (!player) return null;
  return {
    player_id: player.id,
    team_id: player.team_id,
    award_type: type,
    stat_line: `${player.points} PPG · ${player.assists} APG · ${player.rebounds} RPG`,
    is_player_team: false
  };
}

export async function saveSeasonAwards(seasonId, awards) {
  await supabase.from('season_awards').delete().eq('season_id', seasonId);

  const toInsert = awards.map(a => ({
    ...a,
    season_id: seasonId
  }));

  const { error } = await supabase.from('season_awards').insert(toInsert);
  if (error) console.warn('Failed to save season awards:', error);
  return awards;
}

export async function computeAndSaveAwards(seasonId) {
  const awards = await computeSeasonAwards(seasonId);
  return saveSeasonAwards(seasonId, awards);
}
