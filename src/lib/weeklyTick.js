import { supabase } from '../lib/supabase';
import { simGame, simAllAIGames, generateKeyMoments } from './simEngine';
import { growthRoll } from './devEngine';
import { updateChemistryPairs, calcTeamChemistry } from './chemistryEngine';
import { checkStoryTriggers, generateStoryBeat, saveStoryBeat } from './storyBeats';

async function incrementTeamWins(teamId) {
  const { data } = await supabase.from('teams').select('wins').eq('id', teamId).single();
  await supabase.from('teams').update({ wins: (data?.wins || 0) + 1 }).eq('id', teamId);
}

async function incrementTeamLosses(teamId) {
  const { data } = await supabase.from('teams').select('losses').eq('id', teamId).single();
  await supabase.from('teams').update({ losses: (data?.losses || 0) + 1 }).eq('id', teamId);
}

export async function runWeeklyTick({ teamId, seasonId, weekNumber, addStoryBeat }) {
  const { data: season } = await supabase
    .from('seasons')
    .select('games_per_season')
    .eq('id', seasonId)
    .single();

  const newWeek = weekNumber + 1;

  await simAIGamesForWeek(teamId, seasonId, newWeek);
  await runDevLeagueTicks(teamId);
  await updateChemistry(teamId);
  await checkAndFireStoryBeats({ teamId, seasonId, weekNumber: newWeek, addStoryBeat });

  return { success: true, weekNumber: newWeek, seasonComplete: newWeek > (season?.games_per_season || 12) };
}

async function simAIGamesForWeek(teamId, seasonId, weekNumber) {
  const { data: allTeams } = await supabase
    .from('teams')
    .select('id, name, city, wins, losses')
    .neq('id', teamId);

  if (!allTeams || allTeams.length < 2) return;

  const enrichedTeams = await Promise.all(allTeams.map(async (t) => {
      const { data: starters } = await supabase
        .from('rosters')
        .select('players(id, overall, potential, trait_tags)')
        .eq('team_id', t.id)
        .eq('role', 'starter')
        .limit(5);
    const { data: coaches } = await supabase
      .from('coaching_staff')
      .select('level, specialty')
      .eq('team_id', t.id);
    return {
      ...t,
      starters: (starters || []).map(r => r.players).filter(Boolean),
      coaches: coaches || []
    };
  }));

  const results = simAllAIGames(enrichedTeams);

  for (const result of results) {
    const { data: existingGame } = await supabase
      .from('game_log')
      .select('id')
      .or(`and(home_team_id.eq.${result.home_team_id},away_team_id.eq.${result.away_team_id}),and(home_team_id.eq.${result.away_team_id},away_team_id.eq.${result.home_team_id})`)
      .eq('season_id', seasonId)
      .is('home_score', null)
      .limit(1)
      .single();

    if (existingGame) {
      const winnerId = result.home_score > result.away_score ? result.home_team_id : result.away_team_id;
      await supabase
        .from('game_log')
        .update({
          home_score: result.home_score,
          away_score: result.away_score
        })
        .eq('id', existingGame.id);

      await incrementTeamWins(winnerId);
      const loserId = winnerId === result.home_team_id ? result.away_team_id : result.home_team_id;
      await incrementTeamLosses(loserId);
    }
  }
}

async function runDevLeagueTicks(teamId) {
  const { data: devRoster } = await supabase
    .from('rosters')
    .select('*, players(*)')
    .eq('team_id', teamId)
    .eq('is_dev_league', true);

  if (!devRoster) return;

  const { data: coaches } = await supabase
    .from('coaching_staff')
    .select('level, specialty')
    .eq('team_id', teamId);

  for (const entry of devRoster) {
    const player = entry.players;
    if (!player) continue;

    const result = growthRoll(player, entry, coaches || []);
    if (result && player[result.attribute] !== undefined) {
      const newValue = Math.max(1, player[result.attribute] + result.delta);
      await supabase
        .from('players')
        .update({ [result.attribute]: newValue })
        .eq('id', player.id);
    }
  }
}

async function updateChemistry(teamId) {
  const { data: existingPairs } = await supabase
    .from('player_chemistry')
    .select('*')
    .eq('team_id', teamId);

  const { data: roster } = await supabase
    .from('rosters')
    .select('*, players(*)')
    .eq('team_id', teamId);

  const { data: recentEvents } = await supabase
    .from('play_by_play')
    .select('id, player_id, event_type')
    .order('created_at', { ascending: false })
    .limit(50);

  const weekEvents = (recentEvents || []).map(e => ({ ...e, type: e.event_type }));
  const updatedPairs = updateChemistryPairs(teamId, weekEvents, existingPairs || []);

  for (const pair of updatedPairs) {
    const existing = existingPairs?.find(p => p.id === pair.id);
    if (existing && pair.chemistry_score !== existing.chemistry_score) {
      await supabase
        .from('player_chemistry')
        .update({
          chemistry_score: pair.chemistry_score,
          relationship_type: pair.relationship_type
        })
        .eq('id', pair.id);
    }
  }

  // Chemistry is now calculated dynamically, no need to store in teams table
  // const teamChem = calcTeamChemistry(teamId, updatedPairs, roster || []);
  // await supabase
  //   .from('teams')
  //   .update({ chemistry_rating: teamChem })
  //   .eq('id', teamId);
}

async function checkAndFireStoryBeats({ teamId, seasonId, weekNumber, addStoryBeat }) {
  const { data: devPlayers } = await supabase
    .from('rosters')
    .select('*, players(*)')
    .eq('team_id', teamId)
    .eq('is_dev_league', true);

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, wins, losses')
    .eq('id', teamId)
    .single();

  if (devPlayers) {
    for (const entry of devPlayers) {
      const player = entry.players;
      if (!player) continue;

      const weeksInDev = entry.assigned_at
        ? Math.floor((Date.now() - new Date(entry.assigned_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
        : 0;

      const playerData = {
        ...player,
        weeks_in_dev: weeksInDev,
        dev_pathway: entry.dev_pathway,
        assigned_at: entry.assigned_at,
        readiness_score: 50
      };

      const beats = checkStoryTriggers({
        player: playerData,
        team,
        week: weekNumber
      });

      for (const beat of beats) {
        try {
          const saved = await saveStoryBeat(supabase, beat, { teamId, seasonId });
          if (addStoryBeat) addStoryBeat(saved);
        } catch (err) {
          console.warn('Story beat save failed:', err);
        }
      }
    }
  }

  if (weekNumber === 1) {
    const beat = generateStoryBeat('season_start', {
      team: team?.name || 'Your Team',
      wins: team?.wins || 0,
      losses: team?.losses || 0
    });
    try {
      const saved = await saveStoryBeat(supabase, beat, { teamId, seasonId });
      if (addStoryBeat) addStoryBeat(saved);
    } catch (err) {
      console.warn('Story beat save failed:', err);
    }
  }
}
