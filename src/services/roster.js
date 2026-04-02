import { supabase } from '../lib/supabase';

export async function getRoster(teamId, isDevLeague = false) {
  const { data, error } = await supabase
    .from('rosters')
    .select(`
      id, role, is_dev_league, minutes_avg, dev_pathway,
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

export async function updateRosterEntry(entryId, updates) {
  const { data, error } = await supabase
    .from('rosters')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function callUpToMainRoster(entry, targetTeamId) {
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('id', entry.players?.id)
    .single();
  if (!player) throw new Error('Player not found');

  const { data: newEntry, error: insertError } = await supabase
    .from('rosters')
    .insert({
      team_id: targetTeamId,
      player_id: player.id,
      role: 'rotation',
      is_dev_league: false,
      minutes_avg: 15,
      dev_pathway: entry.dev_pathway || null
    })
    .select()
    .single();
  if (insertError) throw insertError;

  const { error: deleteError } = await supabase
    .from('rosters')
    .delete()
    .eq('id', entry.id);
  if (deleteError) throw deleteError;

  return newEntry;
}

export async function sendToDevLeague(entryId) {
  const { error } = await supabase
    .from('rosters')
    .update({ is_dev_league: true, role: 'reserve', minutes_avg: 0 })
    .eq('id', entryId);
  if (error) throw error;
}

export async function promoteToStarter(entryId) {
  const { data: entry } = await supabase
    .from('rosters')
    .select('id, team_id')
    .eq('id', entryId)
    .single();
  if (!entry) throw new Error('Roster entry not found');

  await supabase
    .from('rosters')
    .update({ role: 'reserve' })
    .eq('team_id', entry.team_id)
    .eq('role', 'starter')
    .neq('id', entryId);

  const { error } = await supabase
    .from('rosters')
    .update({ role: 'starter', minutes_avg: 30 })
    .eq('id', entryId);
  if (error) throw error;
}
