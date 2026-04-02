import { supabase } from '../lib/supabase';

export async function getSeason(seasonId) {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', seasonId)
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveSeason() {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
}

export async function updateSeason(seasonId, updates) {
  const { data, error } = await supabase
    .from('seasons')
    .update(updates)
    .eq('id', seasonId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStandings(seasonId) {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, city, wins, losses, color_primary, conference, division')
    .order('wins', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getGameState(gameLogId) {
  const { data, error } = await supabase
    .from('game_log')
    .select(`
      *,
      home_team:teams (id, name, city),
      away_team:teams (id, name, city)
    `)
    .eq('id', gameLogId)
    .single();
  if (error) throw error;
  return data;
}

export async function getPlayByPlay(gameLogId) {
  const { data, error } = await supabase
    .from('play_by_play')
    .select(`
      *,
      player:players (name, position)
    `)
    .eq('game_log_id', gameLogId)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertPlayMoment(gameLogId, moment) {
  const { data, error } = await supabase
    .from('play_by_play')
    .insert({ game_log_id: gameLogId, ...moment })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGameLog(gameLogId, updates) {
  const { data, error } = await supabase
    .from('game_log')
    .update(updates)
    .eq('id', gameLogId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTeamGames(teamId, seasonId) {
  const { data, error } = await supabase
    .from('game_log')
    .select('*')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq('season_id', seasonId)
    .order('played_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getNextGame(teamId, seasonId) {
  const { data, error } = await supabase
    .from('game_log')
    .select(`
      *,
      home_team:teams (id, name, city, color_primary),
      away_team:teams (id, name, city, color_primary)
    `)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq('season_id', seasonId)
    .is('home_score', null)
    .order('played_at', { ascending: true })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

export async function getNarrativeEvents(teamId, seasonId, limit = 10) {
  const { data, error } = await supabase
    .from('narrative_events')
    .select(`
      *,
      player:players (name, persona_sub)
    `)
    .eq('team_id', teamId)
    .eq('season_id', seasonId)
    .eq('is_resolved', false)
    .order('triggered_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function resolveNarrativeEvent(eventId, choice) {
  const { data, error } = await supabase
    .from('narrative_events')
    .update({ is_resolved: true, chosen_option: choice, resolved_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createGameLog(gameLog) {
  const { data, error } = await supabase
    .from('game_log')
    .insert(gameLog)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getGMProfile(gmId) {
  const { data, error } = await supabase
    .from('gm_profiles')
    .select(`
      *,
      teams (*)
    `)
    .eq('id', gmId)
    .single();
  if (error) throw error;
  return data;
}

export async function getCurrentGMProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('gm_profiles')
    .select(`
      *,
      teams (*)
    `)
    .eq('user_id', user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function createGMProfile(profile) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('gm_profiles')
    .insert({ ...profile, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGMProfile(gmId, updates) {
  const { data, error } = await supabase
    .from('gm_profiles')
    .update(updates)
    .eq('id', gmId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function incrementLegacyScore(gmId, delta) {
  const { data: profile } = await supabase.from('gm_profiles').select('legacy_score').eq('id', gmId).single();
  const newScore = (profile?.legacy_score || 0) + delta;
  const { data, error } = await supabase.from('gm_profiles').update({ legacy_score: newScore }).eq('id', gmId).select().single();
  if (error) throw error;
  return data;
}
