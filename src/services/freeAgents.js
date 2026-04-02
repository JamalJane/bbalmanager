import { supabase } from '../lib/supabase';

export async function getFreeAgents(seasonId) {
  const { data, error } = await supabase
    .from('free_agent_pool')
    .select(`
      *,
      player:players (name, age, position, overall, potential, persona_category, persona_sub)
    `)
    .eq('season_id', seasonId)
    .is('signed_by_team_id', null)
    .order('demand_salary', { ascending: false });
  if (error) throw error;
  return data;
}

export async function signFreeAgent(playerId, teamId, seasonId, years, salary) {
  const { data: rosterData, error: rosterError } = await supabase
    .from('rosters')
    .insert({
      player_id: playerId,
      team_id: teamId,
      is_dev_league: false,
      role: 'rotation',
      minutes_avg: 15,
    })
    .select()
    .single();
  if (rosterError) throw rosterError;

  await supabase
    .from('free_agent_pool')
    .update({ signed_by_team_id: teamId, signed_at: new Date().toISOString() })
    .eq('player_id', playerId)
    .eq('season_id', seasonId);

  await supabase.from('contracts').insert({
    player_id: playerId,
    team_id: teamId,
    season_id: seasonId,
    salary: salary,
    total_years: years,
    years_remaining: years,
    is_active: true,
  });

  await supabase
    .from('players')
    .update({ contract_years: years, salary: salary })
    .eq('id', playerId);

  return rosterData;
}

export async function extendContract(playerId, additionalYears, newSalary) {
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('years_remaining, total_years, salary')
    .eq('player_id', playerId)
    .eq('is_active', true)
    .single();
  if (contractError) throw contractError;

  const newYears = contract.years_remaining + additionalYears;

  const { data: updatedContract, error: updateError } = await supabase
    .from('contracts')
    .update({
      years_remaining: newYears,
      salary: newSalary,
      total_years: newYears,
    })
    .eq('player_id', playerId)
    .eq('is_active', true)
    .select()
    .single();
  if (updateError) throw updateError;

  await supabase
    .from('players')
    .update({ contract_years: newYears, salary: newSalary })
    .eq('id', playerId);

  return updatedContract;
}

export async function getContracts(teamId) {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      player:players (name, position, age, overall)
    `)
    .eq('team_id', teamId)
    .eq('is_active', true)
    .order('salary', { ascending: false });
  if (error) throw error;
  return data;
}

const FA_PLAYER_TEMPLATES = [
  { name: 'Marcus Webb', position: 'PG', age: 27, overall: 74, potential: 82, persona_category: 'quiet_assassin', persona_sub: 'clutch_performer' },
  { name: 'Tony Franklin', position: 'SG', age: 29, overall: 76, potential: 78, persona_category: 'raw_diamond', persona_sub: 'athletic_burst' },
  { name: 'Andre Mitchell', position: 'SF', age: 25, overall: 72, potential: 85, persona_category: 'late_bloomer', persona_sub: 'late_developer' },
  { name: 'Derek Simmons', position: 'PF', age: 31, overall: 70, potential: 72, persona_category: 'fading_legend', persona_sub: 'veteran_leader' },
  { name: 'Chris Porter', position: 'C', age: 24, overall: 68, potential: 80, persona_category: 'underdog', persona_sub: 'hard_worker' },
  { name: 'James Holloway', position: 'PG', age: 26, overall: 73, potential: 79, persona_category: 'mercenary', persona_sub: 'opportunist' },
  { name: 'Brandon Okafor', position: 'SF', age: 28, overall: 75, potential: 77, persona_category: 'quiet_assassin', persona_sub: 'lockdown_defender' },
  { name: 'Mike Turner', position: 'PF', age: 30, overall: 71, potential: 73, persona_category: 'fading_legend', persona_sub: 'locker_room_guy' },
];

const PATHWAY_POOL = ['slasher', 'sharpshooter', 'floor_general', 'lockdown', 'stretch_big', 'enforcer', 'facilitator', 'two_way'];

export async function seedFreeAgentPool(seasonId) {
  const { count } = await supabase
    .from('free_agent_pool')
    .select('id', { count: 'exact', head: true })
    .eq('season_id', seasonId)
    .is('signed_by_team_id', null);
  
  if ((count || 0) >= 4) {
    return { success: true, message: 'Free agent pool already has players' };
  }

  const faPlayers = FA_PLAYER_TEMPLATES.slice(0, 8);
  const results = [];

  for (const template of faPlayers) {
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        name: template.name,
        position: template.position,
        age: template.age,
        overall: template.overall,
        potential: template.potential,
        persona_category: template.persona_category,
        persona_sub: template.persona_sub,
        is_revealed: true,
      })
      .select()
      .single();

    if (playerError) {
      console.warn('Player insert failed:', playerError);
      continue;
    }

    const demand_salary = Math.floor((template.overall * 120000) + (Math.random() * 400000));
    const demand_years = Math.floor(Math.random() * 3) + 1;
    const demand_role = ['starter', 'rotation', 'bench'][Math.floor(Math.random() * 3)];
    const demand_pathway = PATHWAY_POOL[Math.floor(Math.random() * PATHWAY_POOL.length)];

    const { error: faError } = await supabase
      .from('free_agent_pool')
      .insert({
        season_id: seasonId,
        player_id: player.id,
        reason: 'contract_expired',
        demand_salary,
        demand_years,
        demand_role,
        demand_pathway,
        has_pathway_clause: Math.random() > 0.7,
        window_open: true,
        window_closes_week: 8,
      });

    if (!faError) {
      results.push({ name: template.name, player_id: player.id });
    }
  }

  return { success: true, count: results.length, players: results };
}
