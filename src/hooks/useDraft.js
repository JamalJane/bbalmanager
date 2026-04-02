import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useDraftClass(draftClassId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!draftClassId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('draft_class_id', draftClassId)
        .order('draft_pick_number', { ascending: true });
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [draftClassId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useActiveDraftClass() {
  const [draftClass, setDraftClass] = useState(null);
  const [prospects, setProspects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function doFetch() {
      setLoading(true);
      try {
        const { data: dc } = await supabase
          .from('draft_classes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!dc) {
          setDraftClass(null);
          setProspects([]);
          setLoading(false);
          return;
        }
        
        setDraftClass(dc);

        const { data: ps } = await supabase
          .from('prospects')
          .select('*')
          .eq('draft_class_id', dc.id)
          .order('draft_pick_number', { ascending: true });
        setProspects(ps || []);
      } catch (err) {
        setError(err.message);
        setProspects([]);
      } finally {
        setLoading(false);
      }
    }
    doFetch();
  }, []);

  return { draftClass, prospects, loading, error };
}

export function useDraftBoard(teamId, draftClassId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!teamId || !draftClassId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('draft_board')
        .select(`
          *,
          prospects (*)
        `)
        .eq('team_id', teamId)
        .eq('draft_class_id', draftClassId)
        .order('rank', { ascending: true });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, draftClassId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useProspect(prospectId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!prospectId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .single();
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useDraftPicks(teamId) {
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
        .from('draft_picks')
        .select(`
          *,
          original_team:teams (name, city),
          current_team:teams (name, city)
        `)
        .eq('current_team_id', teamId)
        .order('round', { ascending: true })
        .order('pick_number', { ascending: true });
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
