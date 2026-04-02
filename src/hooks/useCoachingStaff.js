import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCoachingStaff(teamId) {
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
        .from('coaching_staff')
        .select('*')
        .eq('team_id', teamId)
        .order('level', { ascending: false });
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { fetch(); }, [fetch]);
  const setCoaches = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev || []) : updater;
      return next;
    });
  }, []);

  return { data, loading, error, refetch: fetch, setCoaches };
}
