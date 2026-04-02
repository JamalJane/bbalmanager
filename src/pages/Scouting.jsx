import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveDraftClass, useDraftPicks, useCoachingStaff, useScoutingAssignments } from '../hooks';
import { useGame } from '../context/GameContext';
import { revealProspectAttributes } from '../lib/draftEngine';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';

function ScoutAssignmentCard({ scout, onAssign, isActive }) {
  return (
    <div className={`p-3 rounded-lg border ${isActive ? 'border-gold bg-gold/5' : 'border-ink bg-ink'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-cream">{scout.name}</span>
        <span className="text-xs font-mono text-muted/60">Level {scout.level}</span>
      </div>
      <p className="text-xs text-muted/60 font-mono mb-2">{scout.specialty}</p>
      <button
        onClick={() => onAssign(scout.id)}
        className="w-full py-1.5 text-xs font-mono bg-stadium text-cream rounded hover:bg-rust/20"
      >
        Assign to Prospect
      </button>
    </div>
  );
}

function ProspectCard({ prospect, weeksScouting, onClick }) {
  const revealed = revealProspectAttributes(prospect, weeksScouting);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(prospect)}
      className="p-4 rounded-lg border border-ink bg-ink hover:border-muted/50 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display text-lg text-cream">
            {revealed.persona_revealed ? prospect.name : `Prospect #${prospect.draft_pick_number || '?'}`}
          </h4>
          <p className="text-sm text-muted/60 font-mono">
            {prospect.position} · Age {prospect.age}
          </p>
        </div>
        {revealed.overall_revealed && (
          <div className="text-right">
            <p className="font-mono text-2xl text-gold">{prospect.overall}</p>
            <p className="text-xs text-muted/60 font-mono">OVR</p>
          </div>
        )}
      </div>

      {revealed.skills_revealed && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <AttributeMini label="SPD" value={prospect.speed} />
          <AttributeMini label="DEF" value={prospect.defense} />
          <AttributeMini label="STR" value={prospect.strength} />
          <AttributeMini label="ATH" value={prospect.athleticism} />
          <AttributeMini label="PTS" value={prospect.points} />
          <AttributeMini label="REB" value={prospect.rebounds} />
        </div>
      )}

      {revealed.potential_revealed && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted/60 font-mono">Potential:</span>
          <div className="flex-1 h-1 bg-stadium rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prospect.potential}%` }}
              className="h-full bg-gold"
            />
          </div>
          <span className="text-xs font-mono text-gold">{prospect.potential}</span>
        </div>
      )}

      {revealed.persona_revealed && (
        <span className="inline-block px-2 py-1 text-xs font-mono bg-rust/20 text-rust rounded mb-2">
          {prospect.persona_sub?.replace(/_/g, ' ')}
        </span>
      )}

      {prospect.scouting_blurb && (
        <p className="text-sm text-cream/70 font-serif italic line-clamp-2">
          "{prospect.scouting_blurb}"
        </p>
      )}

      {weeksScouting > 0 && (
        <div className="mt-3 pt-3 border-t border-muted/20">
          <p className="text-xs text-muted/60 font-mono">
            Scouting: {weeksScouting} week{weeksScouting > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function AttributeMini({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-muted/60 font-mono">{label}</span>
        <span className="text-cream/80 font-mono">{value || '?'}</span>
      </div>
      <div className="h-0.5 bg-stadium rounded-full overflow-hidden">
        {value ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            className="h-full bg-rust"
          />
        ) : null}
      </div>
    </div>
  );
}

function ProspectDetailPanel({ prospect, onClose, onAddToDraftBoard }) {
  if (!prospect) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-ink border-l border-muted/30 z-40 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-cream">{prospect.name}</h3>
          <button
            onClick={onClose}
            className="p-2 text-muted/60 hover:text-cream"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stadium p-3 rounded">
              <p className="text-xs text-muted/60 font-mono mb-1">Position</p>
              <p className="font-mono text-cream">{prospect.position}</p>
            </div>
            <div className="bg-stadium p-3 rounded">
              <p className="text-xs text-muted/60 font-mono mb-1">Age</p>
              <p className="font-mono text-cream">{prospect.age}</p>
            </div>
          </div>

          <div className="bg-stadium p-3 rounded">
            <p className="text-xs text-muted/60 font-mono mb-1">Overall</p>
            <p className="font-mono text-3xl text-gold">{prospect.overall}</p>
          </div>

          <div className="bg-stadium p-3 rounded">
            <p className="text-xs text-muted/60 font-mono mb-1">Potential</p>
            <div className="flex items-center gap-3">
              <p className="font-mono text-2xl text-gold">{prospect.potential}</p>
              <div className="flex-1 h-2 bg-ink rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${prospect.potential}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted/60 font-mono mb-2">Attributes</p>
            <div className="space-y-2">
              {[
                { key: 'speed', label: 'Speed' },
                { key: 'defense', label: 'Defense' },
                { key: 'strength', label: 'Strength' },
                { key: 'athleticism', label: 'Athleticism' },
                { key: 'points', label: 'Scoring' },
                { key: 'rebounds', label: 'Rebounds' },
                { key: 'assists', label: 'Playmaking' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-mono text-muted/60">{label}</span>
                  <div className="flex-1 h-1.5 bg-stadium rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prospect[key] || 0}%` }}
                      className="h-full bg-rust"
                    />
                  </div>
                  <span className="w-6 text-xs font-mono text-cream/80">{prospect[key] || '?'}</span>
                </div>
              ))}
            </div>
          </div>

          {prospect.scouting_blurb && (
            <div className="bg-stadium p-4 rounded">
              <p className="text-xs text-muted/60 font-mono mb-2">Scouting Report</p>
              <p className="text-sm font-serif text-cream/80 italic">
                "{prospect.scouting_blurb}"
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-muted/20">
            <button
              onClick={() => onAddToDraftBoard?.(prospect)}
              className="w-full py-3 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
            >
              Add to Draft Board
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Scouting() {
  const { activeTeam } = useGame();
  const { draftClass, prospects, loading } = useActiveDraftClass();
  const { data: draftPicks } = useDraftPicks(activeTeam?.id);
  const { data: coachingStaff } = useCoachingStaff(activeTeam?.id);
  const { data: scoutingAssignments, refetch: refetchAssignments } = useScoutingAssignments(activeTeam?.id, draftClass?.id);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

  const scouts = coachingStaff || [];

  const getWeeksScouting = (prospectId) => {
    const assignment = scoutingAssignments?.find(a => a.prospect_id === prospectId);
    return assignment?.weeks_assigned || 0;
  };

  const handleAssignScout = async (scoutId) => {
    if (!selectedProspect || !draftClass?.id) return;
    try {
      await supabase
        .from('scouting_assignments')
        .upsert({
          team_id: activeTeam.id,
          scout_id: scoutId,
          prospect_id: selectedProspect.id,
          draft_class_id: draftClass.id,
          weeks_assigned: 0,
          is_active: true,
        }, { onConflict: 'team_id,scout_id,prospect_id' });
      refetchAssignments();
    } catch (err) {
      console.error('Failed to assign scout:', err);
    }
  };

  const handleAddToDraftBoard = async (prospect) => {
    if (!activeTeam || !draftClass) return;
    try {
      await supabase.from('draft_board').upsert({
        team_id: activeTeam.id,
        prospect_id: prospect.id,
        draft_class_id: draftClass.id,
        rank: 0,
      }, { onConflict: 'team_id,prospect_id' });
    } catch (err) {
      console.error('Failed to add to draft board:', err);
    }
  };

  const filteredProspects = prospects?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.scouting_blurb?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || p.position === positionFilter;
    return matchesSearch && matchesPosition;
  }) || [];

  const topProspects = filteredProspects.slice(0, 10);
  const remainingProspects = filteredProspects.slice(10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-muted/60">Loading draft class...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <PageHeader
        title="Scouting"
        subtitle={draftClass ? `Draft Class ${draftClass.year}` : '2026 Draft'}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search prospects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-ink border border-muted/30 rounded font-mono text-sm text-cream placeholder:text-muted/40 focus:border-rust focus:outline-none"
            />
            <div className="flex gap-2">
              {['all', 'PG', 'SG', 'SF', 'PF', 'C'].map(pos => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                    positionFilter === pos
                      ? 'bg-rust text-cream'
                      : 'bg-ink text-muted hover:text-cream'
                  }`}
                >
                  {pos === 'all' ? 'All' : pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-sm text-gold mb-4">
              TOP PROSPECTS ({topProspects.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topProspects.map(prospect => (
                <ProspectCard
                  key={prospect.id}
                  prospect={{ ...prospect, onAddToDraftBoard: handleAddToDraftBoard }}
                  weeksScouting={getWeeksScouting(prospect.id)}
                  onClick={setSelectedProspect}
                />
              ))}
            </div>
          </div>

          {remainingProspects.length > 0 && (
            <div>
              <h3 className="font-mono text-sm text-muted/60 mb-4">
                REMAINING ({remainingProspects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {remainingProspects.map(prospect => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={{ ...prospect, onAddToDraftBoard: handleAddToDraftBoard }}
                    weeksScouting={getWeeksScouting(prospect.id)}
                    onClick={setSelectedProspect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-ink rounded-lg border border-stadium p-4" data-tutorial="scouts">
            <h3 className="font-mono text-sm text-cream mb-4">Scouting Staff</h3>
            <div className="space-y-3">
              {scouts.length > 0 ? scouts.map(scout => {
                const assignment = scoutingAssignments?.find(a => a.scout_id === scout.id);
                return (
                  <ScoutAssignmentCard
                    key={scout.id}
                    scout={scout}
                    onAssign={() => handleAssignScout(scout.id)}
                    isActive={!!assignment}
                  />
                );
              }) : (
                <p className="text-xs text-muted/60 font-mono">No scouting staff available. Hire scouts from Coaching page.</p>
              )}
            </div>
          </div>

          <div className="bg-ink rounded-lg border border-stadium p-4">
            <h3 className="font-mono text-sm text-cream mb-2">Reveal Timeline</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted/60">
                <span>Week 1:</span>
                <span className="text-cream/80">Overall</span>
              </div>
              <div className="flex justify-between text-muted/60">
                <span>Week 2:</span>
                <span className="text-cream/80">Skills</span>
              </div>
              <div className="flex justify-between text-muted/60">
                <span>Week 3:</span>
                <span className="text-cream/80">Potential</span>
              </div>
              <div className="flex justify-between text-muted/60">
                <span>Week 4:</span>
                <span className="text-cream/80">Persona</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProspect && (
          <ProspectDetailPanel
            prospect={selectedProspect}
            onClose={() => setSelectedProspect(null)}
            onAddToDraftBoard={handleAddToDraftBoard}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
