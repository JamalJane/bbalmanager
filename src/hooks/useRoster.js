import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRoster(teamId, isDevLeague = false) {
  const [data, setData] = useState(null);
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
      setData(data);
    } catch (err) {
      console.error('useRoster error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId, isDevLeague]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useDevLeague(teamId) {
  return useRoster(teamId, true);
}

export function usePlayer(playerId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!playerId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();
      if (error) throw error;
      setData(data);
      setError(null);
    } catch (err) {
      console.error('usePlayer error:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
