import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useFreeAgents(seasonId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!seasonId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('free_agent_pool')
        .select(`
          *,
          player:players (name, age, position, overall, potential, persona_category, persona_sub)
        `)
        .eq('season_id', seasonId)
        .eq('signed_by_team_id', null)
        .order('demand_salary', { ascending: false });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useContracts(teamId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!teamId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: rosterData } = await supabase
        .from('rosters')
        .select('player_id')
        .eq('team_id', teamId)
        .eq('is_dev_league', false);

      const playerIds = (rosterData || []).map(r => r.player_id);

      if (playerIds.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          player:players (name, position, age, overall)
        `)
        .in('player_id', playerIds)
        .eq('is_active', true)
        .order('salary', { ascending: false });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
