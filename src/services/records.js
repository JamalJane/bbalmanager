import { supabase } from '../lib/supabase';

export async function getAwards(seasonId) {
  const { data, error } = await supabase
    .from('awards')
    .select(`
      *,
      player:players (name, position, team_id),
      team:teams (name, city)
    `)
    .eq('season_id', seasonId);
  if (error) throw error;
  return data;
}

export async function getSeasonRecap(seasonId) {
  const { data: recap, error: recapError } = await supabase
    .from('season_recaps')
    .select('*')
    .eq('season_id', seasonId)
    .single();
  if (recapError) throw recapError;

  const { data: awards, error: awardsError } = await supabase
    .from('awards')
    .select(`
      *,
      player:players (name, position)
    `)
    .eq('season_id', seasonId);
  if (awardsError) throw awardsError;

  const { data: topScorers, error: scorersError } = await supabase
    .from('player_season_stats')
    .select(`
      *,
      player:players (name, position)
    `)
    .eq('season_id', seasonId)
    .order('points_per_game', { ascending: false })
    .limit(5);
  if (scorersError) throw scorersError;

  return { ...recap, awards, topScorers };
}

export async function getFranchiseRecords() {
  const { data, error } = await supabase
    .from('franchise_records')
    .select(`
      *,
      player:players (name),
      team:teams (name, city)
    `)
    .order('category', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getLegacyLog(gmProfileId) {
  const { data, error } = await supabase
    .from('legacy_score_log')
    .select('*')
    .eq('gm_profile_id', gmProfileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getHallOfFame(gmProfileId) {
  const { data, error } = await supabase
    .from('hall_of_fame')
    .select(`
      *,
      player:players (name, position, overall),
      inducted_by_gm:gm_profiles (name)
    `)
    .eq('gm_profile_id', gmProfileId)
    .order('inducted_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function inductIntoHallOfFame(playerId, gmProfileId, reason) {
  const { data, error } = await supabase
    .from('hall_of_fame')
    .insert({
      player_id: playerId,
      gm_profile_id: gmProfileId,
      inducted_at: new Date().toISOString(),
      reason
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
