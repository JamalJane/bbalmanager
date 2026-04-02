import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHallOfFame, useEligibleForHOF } from '../hooks';
import { useGame } from '../context/GameContext';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';

function InductionCard({ inductee }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 bg-ink rounded-lg border border-stadium"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-display text-xl text-cream">{inductee.player?.name}</h4>
          <p className="text-sm text-muted/60 font-mono">
            {inductee.player?.position} · Peak OVR: {inductee.player?.overall}
          </p>
        </div>
        <span className="px-3 py-1 bg-gold/20 text-gold text-xs font-mono rounded">
          HALL OF FAMER
        </span>
      </div>

      <div className="p-4 bg-stadium rounded mb-4">
        <p className="text-xs text-muted/60 font-mono mb-2">Induction Speech</p>
        <p className="font-serif text-cream/90 italic">
          "{inductee.induction_speech || 'A true legend of the game who defined an era with their exceptional skill and leadership.'}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-stadium rounded">
          <p className="text-xs text-muted/60">Career Points</p>
          <p className="font-mono text-cream">{inductee.career_points?.toLocaleString() || 'N/A'}</p>
        </div>
        <div className="p-3 bg-stadium rounded">
          <p className="text-xs text-muted/60">Championships</p>
          <p className="font-mono text-cream">{inductee.championships || 0}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-muted/20">
        <p className="text-xs text-muted/60 font-mono">
          Inducted {new Date(inductee.inducted_at).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}

function InductModal({ players, onClose, onInduct }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [speech, setSpeech] = useState('');

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
        className="bg-ink border border-muted/30 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-cream">Induct into Hall of Fame</h3>
          <button onClick={onClose} className="p-2 text-muted/60 hover:text-cream">✕</button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted/60 font-mono mb-3">SELECT PLAYER</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {players?.map(player => (
              <motion.div
                key={player.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedPlayer(player)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPlayer?.id === player.id
                    ? 'border-gold bg-gold/10'
                    : 'border-ink bg-stadium hover:border-muted/50'
                }`}
              >
                <p className="font-mono text-cream">{player.name}</p>
                <p className="text-xs text-muted/60">{player.position} · {player.overall} OVR</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-muted/60 font-mono mb-2">Induction Speech</label>
          <textarea
            value={speech}
            onChange={e => setSpeech(e.target.value)}
            placeholder="Enter a memorable speech..."
            rows={4}
            className="w-full px-4 py-2 bg-stadium border border-muted/30 rounded font-serif text-cream placeholder:text-muted/40 focus:border-gold focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={() => {
            if (selectedPlayer) {
              onInduct(selectedPlayer.id, { speech });
              onClose();
            }
          }}
          disabled={!selectedPlayer}
          className={`w-full py-3 rounded font-mono text-sm transition-colors ${
            selectedPlayer
              ? 'bg-gold text-stadium hover:bg-gold/80'
              : 'bg-stadium text-muted cursor-not-allowed'
          }`}
        >
          Induct {selectedPlayer?.name || 'Player'}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function HallOfFame() {
  const { gmProfile } = useGame();
  const { data: inductees, loading, refetch } = useHallOfFame(gmProfile?.id);
  const { data: eligiblePlayers } = useEligibleForHOF(gmProfile?.id);

  const [showInductModal, setShowInductModal] = useState(false);

  const handleInduct = async (playerId, details) => {
    try {
      await supabase.from('hall_of_fame').insert({
        gm_profile_id: gmProfile?.id,
        player_id: playerId,
        induction_speech: details.speech || null
      });
      refetch();
    } catch (err) {
      console.error('Failed to induct player:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-muted/60">Loading Hall of Fame...</p>
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
        title="Hall of Fame"
        subtitle={`${inductees?.length || 0} inductees`}
        action={{
          label: 'Induct Player',
          onClick: () => setShowInductModal(true)
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">TOTAL INDUCTEES</p>
          <p className="font-mono text-4xl text-gold">{inductees?.length || 0}</p>
        </div>
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">AVAILABLE FOR INDUCTION</p>
          <p className="font-mono text-4xl text-cream">{eligiblePlayers?.length || 0}</p>
        </div>
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">LEGACY BONUS</p>
          <p className="font-mono text-4xl text-gold">+500</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {inductees?.map(inductee => (
            <InductionCard key={inductee.id} inductee={inductee} />
          ))}
        </AnimatePresence>
      </div>

      {(!inductees || inductees.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted/60 font-mono mb-4">No inductees yet</p>
          <button
            onClick={() => setShowInductModal(true)}
            className="px-6 py-3 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
          >
            Induct Your First Hall of Famer
          </button>
        </div>
      )}

      <AnimatePresence>
        {showInductModal && (
          <InductModal
            players={eligiblePlayers || []}
            onClose={() => setShowInductModal(false)}
            onInduct={handleInduct}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
