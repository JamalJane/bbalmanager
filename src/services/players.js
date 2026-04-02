import { supabase } from '../lib/supabase';

export async function getPlayers(filters = {}) {
  let query = supabase
    .from('players')
    .select(`
      *,
      rosters (id, role, is_dev_league, minutes_avg, dev_pathway, team_id),
      contracts (years_remaining, salary, annual_value)
    `);

  if (filters.teamId) query = query.eq('rosters.team_id', filters.teamId);
  if (filters.position) query = query.eq('position', filters.position);
  if (filters.isDevLeague !== undefined) query = query.eq('rosters.is_dev_league', filters.isDevLeague);

  const { data, error } = await query.order('overall', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPlayer(playerId) {
  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      rosters (*),
      contracts (*),
      persona_definitions (*)
    `)
    .eq('id', playerId)
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlayer(playerId, updates) {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getRoster(teamId, isDevLeague = false) {
  const { data, error } = await supabase
    .from('rosters')
    .select(`
      *,
      players (
        id, name, age, position, overall, potential, morale,
        persona_category, persona_sub, is_revealed, trait_tags,
        speed, defense, points, assists, rebounds,
        contract_years, salary
      )
    `)
    .eq('team_id', teamId)
    .eq('is_dev_league', isDevLeague)
    .order('role', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateRoster(rosterId, updates) {
  const { data, error } = await supabase
    .from('rosters')
    .update(updates)
    .eq('id', rosterId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function assignPathway(rosterId, pathway) {
  return updateRoster(rosterId, { dev_pathway: pathway });
}

export async function callUpPlayer(rosterId, teamId) {
  const { data, error } = await supabase
    .from('rosters')
    .update({ is_dev_league: false, team_id: teamId })
    .eq('id', rosterId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function sendToDevLeague(rosterId) {
  const { data, error } = await supabase
    .from('rosters')
    .update({ is_dev_league: true })
    .eq('id', rosterId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
