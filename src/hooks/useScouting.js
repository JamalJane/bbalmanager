import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useScoutingAssignments(teamId, draftClassId) {
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
      const { data: assignments, error: assignError } = await supabase
        .from('scouting_assignments')
        .select(`
          *,
          scout:coaching_staff (id, name, level, specialty),
          prospect:prospects (id, name, position, overall, potential)
        `)
        .eq('team_id', teamId);
      if (assignError) throw assignError;
      setData(assignments || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, draftClassId]);

  useEffect(() => { fetch(); }, [fetch]);

  const assignScout = useCallback(async (scoutId, prospectId, draftClassId) => {
    const { data: result, error } = await supabase
      .from('scouting_assignments')
      .upsert({
        team_id: teamId,
        scout_id: scoutId,
        prospect_id: prospectId,
        draft_class_id: draftClassId,
        weeks_assigned: 0,
        is_active: true,
      }, { onConflict: 'team_id,scout_id,prospect_id' })
      .select()
      .single();
    if (error) throw error;
    fetch();
    return result;
  }, [teamId, draftClassId, fetch]);

  const removeAssignment = useCallback(async (assignmentId) => {
    const { error } = await supabase
      .from('scouting_assignments')
      .delete()
      .eq('id', assignmentId);
    if (error) throw error;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch, assignScout, removeAssignment };
}
