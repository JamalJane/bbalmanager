import { supabase } from '../lib/supabase';

export async function getDraftClass(draftClassId) {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('draft_class_id', draftClassId)
    .order('draft_pick_number', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getActiveDraftClass() {
  const { data: draftClass, error: classError } = await supabase
    .from('draft_classes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (classError) throw classError;
  return draftClass;
}

export async function getDraftBoard(teamId, draftClassId) {
  const { data, error } = await supabase
    .from('draft_board')
    .select(`
      *,
      prospects (*)
    `)
    .eq('team_id', teamId)
    .eq('draft_class_id', draftClassId)
    .order('rank', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateDraftBoardRank(entryId, newRank) {
  const { data, error } = await supabase
    .from('draft_board')
    .update({ rank: newRank })
    .eq('id', entryId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBoardRankings(boardEntries) {
  const updates = boardEntries.map(e => ({ id: e.id, rank: e.rank }));
  const { data, error } = await supabase.from('draft_board').upsert(updates);
  if (error) throw error;
  return data;
}

export async function getProspect(prospectId) {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', prospectId)
    .single();
  if (error) throw error;
  return data;
}

export async function getDraftPicks(teamId) {
  const { data, error } = await supabase
    .from('draft_picks')
    .select(`
      *,
      original_team:teams (name, city),
      current_team:teams (name, city)
    `)
    .eq('current_team_id', teamId)
    .order('round', { ascending: true })
    .order('pick_number', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAllDraftPicks(seasonId) {
  const { data, error } = await supabase
    .from('draft_picks')
    .select(`
      *,
      original_team:teams (id, name, city),
      current_team:teams (id, name, city)
    `)
    .eq('season_id', seasonId)
    .order('round', { ascending: true })
    .order('pick_number', { ascending: true });
  if (error) throw error;
  return data;
}

export async function generateDraftClass(seasonId) {
  const { data, error } = await supabase.rpc('generate_draft_class', {
    p_season_id: seasonId
  });
  if (error) throw error;
  return data;
}

export async function runCombine(draftClassId) {
  const { data, error } = await supabase.rpc('run_combine', {
    draft_class_id: draftClassId
  });
  if (error) throw error;
  return data;
}

export async function draftPlayer(prospectId, teamId, round, pickNumber) {
  const { data, error } = await supabase.rpc('draft_player', {
    prospect_id: prospectId,
    team_id: teamId,
    round,
    pick_number: pickNumber
  });
  if (error) throw error;
  return data;
}
