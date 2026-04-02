import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useChemistry(teamId) {
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
      const { data, error } = await supabase
        .from('player_chemistry')
        .select(`
          *,
          player_a:players (name, position),
          player_b:players (name, position)
        `)
        .eq('team_id', teamId);
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

export function useTeamChemistry(teamId) {
  const [data, setData] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!teamId) {
      setData(50);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: chemistry, error } = await supabase
        .from('player_chemistry')
        .select('chemistry_score')
        .eq('team_id', teamId);
      if (error) throw error;
      if (chemistry && chemistry.length > 0) {
        const avg = chemistry.reduce((sum, c) => sum + (c.chemistry_score || 50), 0) / chemistry.length;
        setData(Math.round(avg));
      } else {
        setData(50);
      }
    } catch (err) {
      setError(err.message);
      setData(50);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
