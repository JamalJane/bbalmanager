import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useNarrativeEvents(teamId, seasonId, limit = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!teamId || !seasonId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('narrative_events')
        .select(`
          *,
          player:players (name, persona_sub)
        `)
        .eq('team_id', teamId)
        .eq('season_id', seasonId)
        .eq('is_resolved', false)
        .order('triggered_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId, seasonId, limit]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
