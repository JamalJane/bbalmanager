import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoachingStaff } from '../hooks';
import { useGame } from '../context/GameContext';
import PageHeader from '../components/PageHeader';
import { hireCoach, fireCoach, upgradeCoach, getCoachingStaff } from '../services/coaching';

const COACH_SPECIALTIES = [
  { id: 'veteran_presence', label: 'Veteran Presence', description: 'Improves veteran morale', bonus: '+5 chemistry drift' },
  { id: 'player_development', label: 'Player Development', description: 'Faster skill growth', bonus: '+3% growth rate' },
  { id: 'motivator', label: 'Motivator', description: 'Boosts morale', bonus: '+4 morale recovery' },
  { id: 'x_and_o', label: 'X\'s and O\'s', description: 'Better in-game adjustments', bonus: '+2 coaching bonus' },
  { id: 'player_coach', label: 'Player Coach', description: 'Chemistry improvement', bonus: '+6 chemistry' }
];

const AVAILABLE_COACHES = [
  { name: 'Alex Morrison', specialty: 'player_development', level: 2, salary: 2000000 },
  { name: 'Diana Chen', specialty: 'x_and_o', level: 3, salary: 3500000 },
  { name: 'Marcus Webb', specialty: 'veteran_presence', level: 1, salary: 1500000 },
  { name: 'Sarah Thompson', specialty: 'motivator', level: 2, salary: 2200000 },
  { name: 'James Rodriguez', specialty: 'player_coach', level: 1, salary: 1800000 }
];

function CoachCard({ coach, onUpgrade, onFire, isCurrent = false }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const specialty = COACH_SPECIALTIES.find(s => s.id === coach.specialty);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 rounded-lg border border-ink bg-ink"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display text-lg text-cream">{coach.name}</h4>
          <p className="text-sm text-muted/60 font-mono">{coach.specialty?.replace('_', ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(level => (
            <span
              key={level}
              className={`text-lg ${level <= (coach.level || 1) ? 'text-gold' : 'text-muted/30'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {specialty && (
        <div className="p-3 bg-stadium rounded mb-3">
          <p className="text-xs text-gold font-mono mb-1">{specialty.label}</p>
          <p className="text-sm text-cream/80">{specialty.description}</p>
          <p className="text-xs text-muted/60 mt-1">{specialty.bonus}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-muted/20">
        <p className="text-sm text-muted/60 font-mono">
          ${((coach.salary || 0) / 1000000).toFixed(1)}M/year
        </p>
        {isCurrent && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpgrade(coach.id)}
              className="px-3 py-1.5 bg-gold text-stadium rounded text-xs font-mono hover:bg-gold/80"
            >
              Upgrade
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-3 py-1.5 bg-stadium text-muted rounded text-xs font-mono hover:text-ember"
            >
              Release
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-ink border border-muted/30 rounded-lg p-6 max-w-sm"
            >
              <h4 className="font-display text-lg text-cream mb-2">Release Coach?</h4>
              <p className="text-sm text-muted/60 mb-4">
                Are you sure you want to release {coach.name}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onFire(coach.id);
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-2 bg-ember text-cream rounded font-mono text-sm"
                >
                  Release
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 bg-stadium text-cream rounded font-mono text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HireCoachModal({ onClose, onHire }) {
  const [selectedCoach, setSelectedCoach] = useState(null);

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
          <h3 className="font-display text-xl text-cream">Hire Coach</h3>
          <button onClick={onClose} className="p-2 text-muted/60 hover:text-cream">✕</button>
        </div>

        <div className="space-y-4">
          {AVAILABLE_COACHES.map(coach => {
            const specialty = COACH_SPECIALTIES.find(s => s.id === coach.specialty);
            return (
              <div
                key={coach.name}
                onClick={() => setSelectedCoach(coach)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                  selectedCoach?.name === coach.name
                    ? 'border-gold bg-gold/10'
                    : 'border-ink bg-ink hover:border-muted/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-display text-cream">{coach.name}</h4>
                    <p className="text-sm text-muted/60 font-mono">
                      Level {coach.level} · {specialty?.label}
                    </p>
                  </div>
                  <p className="font-mono text-gold">${(coach.salary / 1000000).toFixed(1)}M</p>
                </div>
                <p className="text-xs text-muted/60">{specialty?.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-muted/20">
          <button
            onClick={() => {
              if (selectedCoach) {
                onHire(selectedCoach);
                onClose();
              }
            }}
            disabled={!selectedCoach}
            className={`w-full py-3 rounded font-mono text-sm transition-colors ${
              selectedCoach
                ? 'bg-gold text-stadium hover:bg-gold/80'
                : 'bg-stadium text-muted cursor-not-allowed'
            }`}
          >
            Hire {selectedCoach?.name || 'Coach'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CoachingStaff() {
  const { activeTeam, setCoachPayroll, refreshCoachPayroll } = useGame();
  const { data: coaches, loading, refetch, setCoaches } = useCoachingStaff(activeTeam?.id);

  const [showHireModal, setShowHireModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = useCallback((message, type = 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleUpgrade = async (coachId) => {
    try {
      const updated = await upgradeCoach(coachId);
      refetch();
      setCoachPayroll(prev => prev + Math.round((updated?.salary || 0) * 0.3));
      showFeedback('Coach upgraded!', 'success');
    } catch (err) {
      console.error('Failed to upgrade coach:', err);
      showFeedback('Failed to upgrade coach.');
    }
  };

  const handleFire = async (coachId) => {
    try {
      await fireCoach(coachId);
      refetch();
      const fresh = await getCoachingStaff(activeTeam.id);
      setCoachPayroll((fresh || []).reduce((sum, c) => sum + (c.salary || 0), 0));
      showFeedback('Coach released.', 'success');
    } catch (err) {
      console.error('Failed to fire coach:', err);
      showFeedback('Failed to release coach.');
    }
  };

  const handleHire = async (coach) => {
    if (!activeTeam) return;
    setShowHireModal(false);
    const optimisticCoach = {
      id: `temp-${Date.now()}`,
      name: coach.name,
      specialty: coach.specialty,
      level: coach.level,
      salary: coach.salary,
      upgraded_this_season: false,
    };
    setCoaches(prev => [...(prev || []), optimisticCoach]);
    setCoachPayroll(prev => prev + (coach.salary || 0));
    showFeedback(`${coach.name} hired for $${(coach.salary / 1000000).toFixed(1)}M/year!`, 'success');
    try {
      const saved = await hireCoach(activeTeam.id, {
        name: coach.name,
        specialty: coach.specialty,
        level: coach.level,
        salary: coach.salary,
        upgraded_this_season: false,
      });
      setCoaches(prev => (prev || []).map(c => c.id === optimisticCoach.id ? saved : c));
    } catch (err) {
      console.error('Failed to hire coach:', err);
      setCoaches(prev => (prev || []).filter(c => c.id !== optimisticCoach.id));
      setCoachPayroll(prev => prev - (coach.salary || 0));
      showFeedback(`Failed to hire coach: ${err.message}`);
    }
  };

  const safeCoaches = coaches || [];
  const totalSalary = safeCoaches.reduce((sum, c) => sum + (c.salary || 0), 0);
  const avgLevel = safeCoaches.length > 0
    ? (safeCoaches.reduce((sum, c) => sum + (c.level || 1), 0) / safeCoaches.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-muted/60">Loading coaching staff...</p>
      </div>
    );
  }

  if (!activeTeam) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <PageHeader title="Coaching Staff" subtitle="No team selected" />
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-muted/60">Start a new game to manage your coaching staff.</p>
        </div>
      </motion.div>
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
        title="Coaching Staff"
        subtitle={`${coaches?.length || 0} coaches`}
        action={{
          label: 'Hire Coach',
          onClick: () => setShowHireModal(true)
        }}
      />

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded border font-mono text-sm ${
              feedback.type === 'success'
                ? 'bg-gold/10 border-gold/30 text-gold'
                : 'bg-ember/10 border-ember/30 text-ember'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-ink rounded-lg border border-stadium p-4">
          <p className="text-xs text-muted/60 font-mono mb-1">Total Salary</p>
          <p className="font-mono text-2xl text-cream">${(totalSalary / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-ink rounded-lg border border-stadium p-4">
          <p className="text-xs text-muted/60 font-mono mb-1">Average Level</p>
          <p className="font-mono text-2xl text-gold">{avgLevel}</p>
        </div>
        <div className="bg-ink rounded-lg border border-stadium p-4">
          <p className="text-xs text-muted/60 font-mono mb-1">Coaching Bonus</p>
          <p className="font-mono text-2xl text-cream">
            +{((parseFloat(avgLevel) / 5) * 2).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(safeCoaches || []).map(coach => (
          <CoachCard
            key={coach.id}
            coach={coach}
            onUpgrade={handleUpgrade}
            onFire={handleFire}
            isCurrent={true}
          />
        ))}
      </div>

      {safeCoaches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted/60 font-mono mb-4">No coaches on staff</p>
          <button
            onClick={() => setShowHireModal(true)}
            className="px-6 py-3 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
          >
            Hire Your First Coach
          </button>
        </div>
      )}

      <div className="bg-ink rounded-lg border border-stadium p-6">
        <h3 className="font-mono text-sm text-cream mb-4">SPECIALTY BONUSES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COACH_SPECIALTIES.map(specialty => (
            <div key={specialty.id} className="p-3 bg-stadium rounded">
              <p className="text-sm text-gold font-mono mb-1">{specialty.label}</p>
              <p className="text-xs text-cream/80 mb-1">{specialty.description}</p>
              <p className="text-xs text-muted/60">{specialty.bonus}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showHireModal && (
          <HireCoachModal
            onClose={() => setShowHireModal(false)}
            onHire={handleHire}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
