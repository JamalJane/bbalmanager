import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFreeAgents, useContracts, useActiveDraftClass, useRoster } from '../hooks';
import { useGame } from '../context/GameContext';
import PageHeader from '../components/PageHeader';
import { signFreeAgent, extendContract, seedFreeAgentPool } from '../services/freeAgents';

const CONTRACT_TEMPLATES = [
  { years: 1, name: '1-Year', multiplier: 1.0 },
  { years: 2, name: '2-Year', multiplier: 0.95 },
  { years: 3, name: '3-Year', multiplier: 0.90 },
  { years: 4, name: '4-Year', multiplier: 0.85 },
  { years: 5, name: '5-Year', multiplier: 0.80 }
];

function FreeAgentCard({ agent, onSign }) {
  const [showOffer, setShowOffer] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="p-4 rounded-lg border border-ink bg-ink"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-display text-lg text-cream">{agent.player?.name}</h4>
            <p className="text-sm text-muted/60 font-mono">
              {agent.player?.position} · Age {agent.player?.age}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl text-gold">{agent.player?.overall}</p>
            <p className="text-xs text-muted/60 font-mono">OVR</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 bg-stadium rounded text-center">
            <p className="text-xs text-muted/60">Potential</p>
            <p className="font-mono text-cream">{agent.player?.potential || '?'}</p>
          </div>
          <div className="p-2 bg-stadium rounded text-center">
            <p className="text-xs text-muted/60">Asking</p>
            <p className="font-mono text-gold">${((agent.demand_salary || 0) / 1000000).toFixed(1)}M</p>
          </div>
          <div className="p-2 bg-stadium rounded text-center">
            <p className="text-xs text-muted/60">Years</p>
            <p className="font-mono text-cream">{agent.demand_years || 1}</p>
          </div>
        </div>

        {agent.player?.persona_sub && (
          <span className="inline-block px-2 py-1 text-xs font-mono bg-rust/20 text-rust rounded mb-3">
            {agent.player.persona_sub.replace(/_/g, ' ')}
          </span>
        )}

        <button
          onClick={() => setShowOffer(true)}
          className="w-full py-2 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
        >
          Make Offer
        </button>
      </motion.div>

      <AnimatePresence>
        {showOffer && (
          <ContractOfferModal
            agent={agent}
            onClose={() => setShowOffer(false)}
            onSign={onSign}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ContractOfferModal({ agent, onClose, onSign }) {
  const [selectedTemplate, setSelectedTemplate] = useState(CONTRACT_TEMPLATES[0]);
  const [annualSalary, setAnnualSalary] = useState((agent.demand_salary || 0) / 1000000);

  const totalValue = annualSalary * selectedTemplate.years;
  const discountedTotal = totalValue * selectedTemplate.multiplier;

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
        className="bg-ink border border-muted/30 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-cream">Contract Offer</h3>
          <button onClick={onClose} className="p-2 text-muted/60 hover:text-cream">✕</button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted/60 mb-1">Player</p>
          <p className="font-display text-lg text-cream">{agent.player?.name}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted/60 font-mono mb-3">CONTRACT LENGTH</p>
          <div className="grid grid-cols-5 gap-2">
            {CONTRACT_TEMPLATES.map(template => (
              <button
                key={template.years}
                onClick={() => setSelectedTemplate(template)}
                className={`p-2 rounded border text-center transition-all ${
                  selectedTemplate.years === template.years
                    ? 'border-gold bg-gold/10'
                    : 'border-ink bg-stadium hover:border-muted/50'
                }`}
              >
                <p className="font-mono text-sm text-cream">{template.years}yr</p>
                <p className="text-xs text-muted/60">{Math.round(template.multiplier * 100)}%</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-muted/60 font-mono mb-2">Annual Salary ($M)</label>
          <input
            type="number"
            value={annualSalary}
            onChange={e => setAnnualSalary(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-stadium border border-muted/30 rounded font-mono text-cream focus:border-gold focus:outline-none"
          />
        </div>

        <div className="p-4 bg-stadium rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-muted/60">Years</span>
            <span className="text-cream font-mono">{selectedTemplate.years}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted/60">Annual</span>
            <span className="text-cream font-mono">${annualSalary.toFixed(1)}M</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted/60">Discount</span>
            <span className="text-gold font-mono">{Math.round((1 - selectedTemplate.multiplier) * 100)}%</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-muted/20">
            <span className="text-cream font-mono">Total</span>
            <span className="text-gold font-mono text-lg">${discountedTotal.toFixed(1)}M</span>
          </div>
        </div>

        <button
          onClick={() => {
            onSign(agent.player_id, {
              years: selectedTemplate.years,
              annualSalary: annualSalary * 1000000
            });
            onClose();
          }}
          className="w-full py-3 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
        >
          Send Offer
        </button>
      </motion.div>
    </motion.div>
  );
}

function ExtensionModal({ player, onClose, onExtend }) {
  const [years, setYears] = useState(2);
  const [salary, setSalary] = useState(10);

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
        className="bg-ink border border-muted/30 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-cream">Extend Contract</h3>
          <button onClick={onClose} className="p-2 text-muted/60 hover:text-cream">✕</button>
        </div>

        <p className="text-sm text-muted/60 mb-1">Player</p>
        <p className="font-display text-lg text-cream mb-4">{player?.name}</p>

        <div className="mb-4">
          <label className="block text-sm text-muted/60 font-mono mb-2">Additional Years</label>
          <input
            type="number"
            min="1"
            max="5"
            value={years}
            onChange={e => setYears(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 bg-stadium border border-muted/30 rounded font-mono text-cream focus:border-gold focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-muted/60 font-mono mb-2">New Annual Salary ($M)</label>
          <input
            type="number"
            value={salary}
            onChange={e => setSalary(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-stadium border border-muted/30 rounded font-mono text-cream focus:border-gold focus:outline-none"
          />
        </div>

        <button
          onClick={() => {
            onExtend(player?.id, { years, salary: salary * 1000000 });
            onClose();
          }}
          className="w-full py-3 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
        >
          Extend {years} Years
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Offseason() {
  const { activeTeam, activeSeason } = useGame();
  const { data: freeAgents, loading: faLoading, refetch: refetchFA } = useFreeAgents(activeSeason?.id);
  const { data: contracts, loading: contractsLoading, refetch: refetchContracts } = useContracts(activeTeam?.id);
  const { data: roster } = useRoster(activeTeam?.id);
  const { prospects: draftProspects } = useActiveDraftClass();

  const [activeTab, setActiveTab] = useState('free_agents');
  const [extendPlayer, setExtendPlayer] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!faLoading && activeSeason?.id && freeAgents?.length === 0 && !seeding) {
      setSeeding(true);
      seedFreeAgentPool(activeSeason.id)
        .then(() => refetchFA())
        .catch(err => console.error('Failed to seed FA pool:', err))
        .finally(() => setSeeding(false));
    }
  }, [faLoading, activeSeason, freeAgents, seeding, refetchFA]);

  const handleSign = async (playerId, offer) => {
    if (!activeTeam || !activeSeason) return;
    try {
      await signFreeAgent(playerId, activeTeam.id, activeSeason.id, offer.years, offer.annualSalary);
      refetchFA();
    } catch (err) {
      console.error('Failed to sign player:', err);
    }
  };

  const handleExtend = async (playerId, details) => {
    try {
      await extendContract(playerId, details.years, details.salary);
      refetchContracts();
    } catch (err) {
      console.error('Failed to extend contract:', err);
    }
  };

  if (faLoading || contractsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-muted/60">Loading...</p>
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
        title="Offseason"
        subtitle={activeSeason ? `Season ${activeSeason.year}` : 'Free Agency'}
      />

      <div className="flex gap-4">
        {['free_agents', 'contracts', 'draft_prep'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
              activeTab === tab
                ? 'bg-rust text-cream'
                : 'bg-ink text-muted hover:text-cream'
            }`}
          >
            {tab.replace('_', ' ').toUpperCase()}
            {tab === 'free_agents' && ` (${freeAgents?.length || 0})`}
            {tab === 'contracts' && ` (${contracts?.length || 0})`}
          </button>
        ))}
      </div>

      {activeTab === 'free_agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeAgents?.map(agent => (
            <FreeAgentCard
              key={agent.id}
              agent={agent}
              onSign={handleSign}
            />
          ))}
          {(!freeAgents || freeAgents.length === 0) && (
            <p className="col-span-full text-center py-12 text-muted/60 font-mono">
              No free agents available
            </p>
          )}
        </div>
      )}

      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="bg-ink rounded-lg border border-stadium overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-muted/20">
                  <th className="text-left p-4 text-xs font-mono text-muted/60">PLAYER</th>
                  <th className="text-left p-4 text-xs font-mono text-muted/60">POSITION</th>
                  <th className="text-right p-4 text-xs font-mono text-muted/60">AGE</th>
                  <th className="text-right p-4 text-xs font-mono text-muted/60">OVERALL</th>
                  <th className="text-right p-4 text-xs font-mono text-muted/60">SALARY</th>
                  <th className="text-right p-4 text-xs font-mono text-muted/60">YEARS</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {contracts?.map(contract => (
                  <tr key={contract.id} className="border-b border-muted/10 hover:bg-stadium/50">
                    <td className="p-4 font-display text-cream">{contract.player?.name}</td>
                    <td className="p-4 text-sm text-muted/60 font-mono">{contract.player?.position}</td>
                    <td className="p-4 text-right font-mono text-cream">{contract.player?.age}</td>
                    <td className="p-4 text-right font-mono text-gold">{contract.player?.overall}</td>
                    <td className="p-4 text-right font-mono text-cream">
                      ${((contract.salary || 0) / 1000000).toFixed(1)}M
                    </td>
                    <td className="p-4 text-right font-mono text-cream">
                      {contract.years_remaining} yr{contract.years_remaining !== 1 ? 's' : ''}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setExtendPlayer(contract.player)}
                        className="px-3 py-1 bg-gold/20 text-gold text-xs font-mono rounded hover:bg-gold/30"
                      >
                        Extend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'draft_prep' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-ink rounded-lg border border-stadium p-6">
            <h3 className="font-mono text-sm text-cream mb-4">DRAFT PREPARATION</h3>
            <div className="space-y-4">
              <div className="p-4 bg-stadium rounded">
                <p className="text-xs text-muted/60 mb-1">Draft Class</p>
                <p className="font-mono text-cream">{draftProspects?.length || 0} prospects</p>
              </div>
              <div className="p-4 bg-stadium rounded">
                <p className="text-xs text-muted/60 mb-1">Top Prospect</p>
                <p className="font-mono text-gold">
                  {draftProspects?.[0]?.name || 'Not scouted yet'}
                </p>
              </div>
              <button className="w-full py-3 bg-rust text-cream rounded font-mono text-sm hover:bg-rust/80">
                Begin Scouting
              </button>
            </div>
          </div>

          <div className="bg-ink rounded-lg border border-stadium p-6">
            <h3 className="font-mono text-sm text-cream mb-4">CAP SPACE</h3>
            <div className="space-y-4">
              <div className="p-4 bg-stadium rounded">
                <p className="text-xs text-muted/60 mb-1">Total Payroll</p>
                <p className="font-mono text-2xl text-cream">
                  ${((contracts || []).reduce((sum, c) => sum + (c.salary || 0), 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-4 bg-stadium rounded">
                <p className="text-xs text-muted/60 mb-1">Available Cap Space</p>
                <p className="font-mono text-2xl text-gold">$50.0M</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {extendPlayer && (
          <ExtensionModal
            player={extendPlayer}
            onClose={() => setExtendPlayer(null)}
            onExtend={handleExtend}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
