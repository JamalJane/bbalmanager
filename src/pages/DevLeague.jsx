import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoster, useDevLeague, useTeamChemistry } from '../hooks';
import { useGame } from '../context/GameContext';
import { getReadinessScore } from '../lib/devEngine';
import { callUpToMainRoster, updateRosterEntry } from '../services/roster';
import PageHeader from '../components/PageHeader';
import { useCountUp } from '../hooks';

const PATHWAYS = [
  { id: 'scorer', label: 'Scorer', color: 'ember', description: 'Shooting, 3PT, Speed' },
  { id: 'playmaker', label: 'Playmaker', color: 'gold', description: 'Handling, Passing, Court Vision' },
  { id: 'big', label: 'Big Man', color: 'rust', description: 'Strength, Rebounding, Defense' },
  { id: 'two_way', label: 'Two-Way', color: 'stadium', description: 'Defense + Offense Balance' },
  { id: 'athletic', label: 'Athletic', color: 'cream', description: 'Jump, Speed, Vertical' }
];

function PlayerCard({ entry, isSelected, onClick, showReadiness = false }) {
  const player = entry.players;
  const readiness = showReadiness ? getReadinessScore(player, entry) : null;
  const isReady = readiness && readiness >= 75;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-gold bg-gold/10'
          : 'border-ink bg-ink hover:border-muted/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display text-lg text-cream">{player?.name}</h4>
          <p className="text-sm text-muted/60 font-mono">
            {player?.position} · Age {player?.age}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl text-gold">{player?.overall}</p>
          <p className="text-xs text-muted/60 font-mono">
            POT: {player?.potential}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatBar label="SPD" value={player?.speed || 0} />
        <StatBar label="DEF" value={player?.defense || 0} />
        <StatBar label="PTS" value={player?.points || 0} />
        <StatBar label="AST" value={player?.assists || 0} />
        <StatBar label="REB" value={player?.rebounds || 0} />
        <StatBar label="OVR" value={player?.overall || 0} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-muted/20">
        <div className="flex items-center gap-2">
          {entry.dev_pathway ? (
            <span className="px-2 py-1 text-xs font-mono bg-rust/20 text-rust rounded">
              {PATHWAYS.find(p => p.id === entry.dev_pathway)?.label}
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-mono text-muted/60">No pathway</span>
          )}
        </div>
        {showReadiness && (
          <div className={`text-sm font-mono ${isReady ? 'text-gold' : 'text-muted/60'}`}>
            Ready: {readiness}%
          </div>
        )}
      </div>

      {player?.morale && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted/60 font-mono">Morale</span>
            <span className="text-cream/80 font-mono">{player.morale}%</span>
          </div>
          <div className="h-1 bg-stadium rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${player.morale}%` }}
              className={`h-full ${
                player.morale >= 70 ? 'bg-gold' :
                player.morale >= 40 ? 'bg-rust' : 'bg-ember'
              }`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted/60 font-mono">{label}</span>
        <span className="text-cream/80 font-mono">{value}</span>
      </div>
      <div className="h-1 bg-stadium rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-rust"
        />
      </div>
    </div>
  );
}

function PathwaySelector({ player, onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-ink border border-muted/30 rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h3 className="font-display text-xl text-cream mb-2">
          Assign Pathway
        </h3>
        <p className="text-sm text-muted/60 mb-6">
          Choose a development pathway for {player?.players?.name}
        </p>

        <div className="space-y-3">
          {PATHWAYS.map(pathway => (
            <button
              key={pathway.id}
              onClick={() => onSelect(pathway.id)}
              className={`w-full p-4 rounded-lg border text-left transition-all hover:border-${pathway.color}/50`}
              style={{
                borderColor: pathway.id === 'scorer' ? 'var(--ember)' :
                             pathway.id === 'playmaker' ? 'var(--gold)' :
                             pathway.id === 'big' ? 'var(--rust)' : 'var(--muted)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-cream">{pathway.label}</span>
                <span className="text-sm text-muted/60 font-mono">{pathway.description}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DevLeague() {
  const { activeTeam } = useGame();
  const { data: devRoster, loading: devLoading, refetch: refetchDev } = useDevLeague(activeTeam?.id);
  const { data: mainRoster, refetch: refetchMain } = useRoster(activeTeam?.id);
  const { data: chemistry } = useTeamChemistry(activeTeam?.id);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPathwaySelector, setShowPathwaySelector] = useState(false);
  const [filter, setFilter] = useState('all');

  const starters = mainRoster?.filter(r => r.role === 'starter') || [];
  const rotation = mainRoster?.filter(r => r.role === 'rotation') || [];
  const chemValue = useCountUp(chemistry || 50, 1500);

  const handleCallUp = async (entry) => {
    try {
      await callUpToMainRoster(entry, activeTeam.id);
      setSelectedPlayer(null);
      refetchDev();
      refetchMain();
    } catch (err) {
      console.error('Failed to call up player:', err);
    }
  };

  const handleAssignPathway = async (pathway) => {
    try {
      await updateRosterEntry(selectedPlayer.id, { dev_pathway: pathway });
      refetchDev();
      setShowPathwaySelector(false);
      setSelectedPlayer(null);
    } catch (err) {
      console.error('Failed to assign pathway:', err);
    }
  };

  const filteredRoster = devRoster?.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'ready') return getReadinessScore(entry.players, entry) >= 75;
    if (filter === 'no_pathway') return !entry.dev_pathway;
    return true;
  }) || [];

  if (devLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-muted/60">Loading dev league...</p>
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
        title="Development League"
        subtitle={`${filteredRoster.length} players in system`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            {['all', 'ready', 'no_pathway'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
                  filter === f
                    ? 'bg-rust text-cream'
                    : 'bg-ink text-muted hover:text-cream'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredRoster.map(entry => (
                <PlayerCard
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedPlayer?.id === entry.id}
                  onClick={() => setSelectedPlayer(entry)}
                  showReadiness
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredRoster.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted/60 font-mono">No players match this filter</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-ink rounded-lg border border-stadium p-4">
            <h3 className="font-mono text-sm text-cream mb-4">Team Chemistry</h3>
            <div className="text-center">
              <p className="font-mono text-4xl text-gold">{chemValue}</p>
              <p className="text-sm text-muted/60 font-mono mt-1">out of 100</p>
            </div>
            <div className="mt-4 h-2 bg-stadium rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${chemValue}%` }}
                className={`h-full ${
                  chemValue >= 70 ? 'bg-gold' :
                  chemValue >= 40 ? 'bg-rust' : 'bg-ember'
                }`}
              />
            </div>
          </div>

          <div className="bg-ink rounded-lg border border-stadium p-4">
            <h3 className="font-mono text-sm text-cream mb-4">Main Roster</h3>
            <div className="space-y-2">
              <p className="text-xs text-muted/60 font-mono mb-2">STARTERS</p>
              {starters.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-cream">{entry.players?.name}</span>
                  <span className="text-xs font-mono text-gold">{entry.players?.overall}</span>
                </div>
              ))}
              <p className="text-xs text-muted/60 font-mono mb-2 mt-4">ROTATION</p>
              {rotation.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-cream">{entry.players?.name}</span>
                  <span className="text-xs font-mono text-muted">{entry.players?.overall}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedPlayer && (
            <div className="bg-ink rounded-lg border border-stadium p-4">
              <h3 className="font-mono text-sm text-cream mb-4">Actions</h3>
              <div className="space-y-2">
                {!selectedPlayer.dev_pathway && (
                  <button
                    onClick={() => setShowPathwaySelector(true)}
                    className="w-full py-2 px-4 bg-rust text-cream rounded font-mono text-sm hover:bg-rust/80"
                  >
                    Assign Pathway
                  </button>
                )}
                {getReadinessScore(selectedPlayer.players, selectedPlayer) >= 75 && (
                  <button
                    onClick={() => handleCallUp(selectedPlayer)}
                    className="w-full py-2 px-4 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
                  >
                    Call Up to Main Roster
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="w-full py-2 px-4 bg-stadium text-muted rounded font-mono text-sm hover:text-cream"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPathwaySelector && (
          <PathwaySelector
            player={selectedPlayer}
            onSelect={handleAssignPathway}
            onClose={() => {
              setShowPathwaySelector(false);
              setSelectedPlayer(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
