import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTradeMarket(teamId) {
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
        .from('trade_offers')
        .select(`
          *,
          initiating_team:teams (id, name, city, color_primary),
          receiving_team:teams (id, name, city, color_primary),
          trade_offer_players (
            *,
            player:players (name, position, overall, salary, age)
          ),
          trade_offer_picks (
            *
          )
        `)
        .or(`initiating_team_id.eq.${teamId},receiving_team_id.eq.${teamId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
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

export function useTradeBlock(teamId) {
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
        .from('trade_block')
        .select(`
          *,
          player:players (name, position, overall, age, salary, contract_years)
        `)
        .eq('team_id', teamId)
        .order('listed_at', { ascending: false });
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
