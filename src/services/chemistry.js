import { supabase } from '../lib/supabase';

export async function getChemistry(teamId) {
  const { data, error } = await supabase
    .from('player_chemistry')
    .select(`
      *,
      player_a:players!player_chemistry_player_a_id_fkey (name, position),
      player_b:players!player_chemistry_player_b_id_fkey (name, position)
    `)
    .eq('team_id', teamId);
  if (error) throw error;
  return data;
}

export async function getTeamChemistry(teamId) {
  const { data, error } = await supabase
    .from('player_chemistry')
    .select('chemistry_score')
    .eq('team_id', teamId);
  if (error) throw error;
  if (!data || data.length === 0) return 50;
  const avg = data.reduce((sum, c) => sum + c.chemistry_score, 0) / data.length;
  return Math.round(avg);
}

export async function updateChemistry(playerAId, playerBId, teamId, delta) {
  const { data: existing, error: fetchError } = await supabase
    .from('player_chemistry')
    .select('chemistry_score')
    .eq('player_a_id', playerAId)
    .eq('player_b_id', playerBId)
    .single();
  if (fetchError) throw fetchError;

  const newScore = Math.max(0, Math.min(100, existing.chemistry_score + delta));

  const { data, error } = await supabase
    .from('player_chemistry')
    .update({ chemistry_score: newScore })
    .eq('player_a_id', playerAId)
    .eq('player_b_id', playerBId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
