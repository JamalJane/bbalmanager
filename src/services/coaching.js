import { supabase } from '../lib/supabase';

export async function getCoachingStaff(teamId) {
  const { data, error } = await supabase
    .from('coaching_staff')
    .select('*')
    .eq('team_id', teamId)
    .order('level', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateCoach(coachId, updates) {
  const { data, error } = await supabase
    .from('coaching_staff')
    .update(updates)
    .eq('id', coachId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function hireCoach(teamId, coach) {
  const { data, error } = await supabase
    .from('coaching_staff')
    .insert({ ...coach, team_id: teamId, hired_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fireCoach(coachId) {
  const { error } = await supabase
    .from('coaching_staff')
    .delete()
    .eq('id', coachId);
  if (error) throw error;
}

export async function upgradeCoach(coachId) {
  const { data: coach, error: fetchError } = await supabase
    .from('coaching_staff')
    .select('level, salary, upgraded_this_season')
    .eq('id', coachId)
    .single();
  if (fetchError) throw fetchError;

  if (coach.upgraded_this_season) {
    throw new Error('Coach has already been upgraded this season');
  }

  const newLevel = coach.level + 1;
  const newSalary = Math.round(coach.salary * 1.3);

  const { data, error } = await supabase
    .from('coaching_staff')
    .update({ level: newLevel, salary: newSalary, upgraded_this_season: true })
    .eq('id', coachId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
