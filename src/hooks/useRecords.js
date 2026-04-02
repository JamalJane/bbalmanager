import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAwards(seasonId) {
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
        .from('season_awards')
        .select(`
          *,
          player:players (name, position),
          team:teams (name, city)
        `)
        .eq('season_id', seasonId);
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

export function useSeasonRecap(seasonId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!seasonId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: recap } = await supabase
        .from('season_recaps')
        .select('*')
        .eq('season_id', seasonId)
        .maybeSingle();

      const { data: awards } = await supabase
        .from('season_awards')
        .select(`
          *,
          player:players (name, position)
        `)
        .eq('season_id', seasonId);

      setData({ ...recap, awards: awards || [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useFranchiseRecords() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('franchise_records')
        .select(`
          *,
          player:players (name),
          team:teams (name, city)
        `)
        .order('set_at', { ascending: false });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useLegacyLog(gmProfileId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!gmProfileId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('legacy_score_log')
        .select('*')
        .eq('gm_profile_id', gmProfileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [gmProfileId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useHallOfFame(gmProfileId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!gmProfileId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .select(`
          *,
          player:players (name, position, overall)
        `)
        .eq('gm_profile_id', gmProfileId)
        .order('inducted_at', { ascending: false });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [gmProfileId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useEligibleForHOF(gmProfileId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!gmProfileId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: hofIds } = await supabase
        .from('hall_of_fame')
        .select('player_id')
        .eq('gm_profile_id', gmProfileId);

      const inductedIds = (hofIds || []).map(h => h.player_id);

      const { data: players, error: playerError } = await supabase
        .from('players')
        .select('id, name, position, overall, age')
        .gte('age', 32)
        .gte('overall', 75)
        .limit(50);
      if (playerError) throw playerError;

      const eligible = (players || []).filter(p => !inductedIds.includes(p.id));
      setData(eligible);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [gmProfileId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
