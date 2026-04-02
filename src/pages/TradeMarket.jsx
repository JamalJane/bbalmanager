import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradeMarket, useTradeBlock, useRoster, useDraftPicks } from '../hooks';
import { useGame } from '../context/GameContext';
import { calculatePlayerValue, getPickValue } from '../lib/tradeEngine';
import { proposeTrade, addTradePlayers, addTradePicks, respondToTrade } from '../services/trades';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

function PlayerTradeCard({ player, onSelect, isSelected, value }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(player)}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-gold bg-gold/10'
          : 'border-ink bg-ink hover:border-muted/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm text-cream">{player.name}</p>
          <p className="text-xs text-muted/60">{player.position} · {player.age} yrs</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg text-gold">{value}</p>
          <p className="text-xs text-muted/60">${((player.salary || 0) / 1000000).toFixed(1)}M</p>
        </div>
      </div>
    </motion.div>
  );
}

function PickTradeCard({ pick, onSelect, isSelected }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(pick)}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-gold bg-gold/10'
          : 'border-ink bg-ink hover:border-muted/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm text-cream">
            Round {pick.round} · Pick {pick.pick_number}
          </p>
          <p className="text-xs text-muted/60">
            {pick.teams ? `${pick.teams.city} ${pick.teams.name}` : 'Own pick'}
          </p>
        </div>
        <p className="font-mono text-lg text-gold">{getPickValue(pick)}</p>
      </div>
    </motion.div>
  );
}

function TradeProposalCard({ proposal, onRespond, isIncoming }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-muted/60';
      case 'accepted': return 'text-gold';
      case 'rejected': return 'text-ember';
      case 'counter': return 'text-rust';
      default: return 'text-muted/60';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-ink bg-ink"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: (isIncoming ? proposal.initiating_team?.color_primary : proposal.receiving_team?.color_primary) || '#B85C2A' }}
          />
          <div>
            <p className="font-mono text-sm text-cream">
              {isIncoming ? 'From' : 'To'}: {isIncoming ? proposal.initiating_team?.city : proposal.receiving_team?.city}
            </p>
            <p className="text-xs text-muted/60">
              {new Date(proposal.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`font-mono text-sm ${getStatusColor(proposal.status)}`}>
          {proposal.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <p className="text-xs text-muted/60 font-mono">GIVE</p>
          {proposal.trade_offer_players?.filter(a => a.player_id).map(asset => (
            <div key={asset.id} className="flex justify-between text-sm">
              <span className="text-cream/80">{asset.player?.name}</span>
              <span className="text-gold font-mono">{calculatePlayerValue(asset.player)}</span>
            </div>
          ))}
          {proposal.trade_offer_picks?.map(asset => (
            <div key={asset.id} className="flex justify-between text-sm">
              <span className="text-cream/80">Pick {asset.round}.{asset.pick_number}</span>
              <span className="text-gold font-mono">{asset.pick_value || 0}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted/60 font-mono">GET</p>
          <p className="text-sm text-cream/80">TBD from counter</p>
        </div>
      </div>

      {isIncoming && proposal.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onRespond(proposal.id, 'accepted')}
            className="flex-1 py-2 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80"
          >
            Accept
          </button>
          <button
            onClick={() => onRespond(proposal.id, 'countered')}
            className="flex-1 py-2 bg-rust text-cream rounded font-mono text-sm hover:bg-rust/80"
          >
            Counter
          </button>
          <button
            onClick={() => onRespond(proposal.id, 'rejected')}
            className="flex-1 py-2 bg-stadium text-muted rounded font-mono text-sm hover:text-ember"
          >
            Reject
          </button>
        </div>
      )}
    </motion.div>
  );
}

function NewTradeModal({ onClose, roster, picks, allTeams, activeTeamId, onSubmit }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedPicks, setSelectedPicks] = useState([]);
  const [targetTeamId, setTargetTeamId] = useState('');

  const otherTeams = useMemo(
    () => (allTeams || []).filter(t => t.id !== activeTeamId),
    [allTeams, activeTeamId]
  );

  const totalValue = selectedPlayers.reduce((sum, p) => sum + calculatePlayerValue(p), 0) +
    selectedPicks.reduce((sum, p) => sum + getPickValue(p), 0);

  const togglePlayer = (player) => {
    setSelectedPlayers(prev =>
      prev.find(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    );
  };

  const togglePick = (pick) => {
    setSelectedPicks(prev =>
      prev.find(p => p.id === pick.id)
        ? prev.filter(p => p.id !== pick.id)
        : [...prev, pick]
    );
  };

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
        className="bg-ink border border-muted/30 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-cream">New Trade Proposal</h3>
          <button onClick={onClose} className="p-2 text-muted/60 hover:text-cream">✕</button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-muted/60 font-mono mb-2">Target Team</label>
          <select
            value={targetTeamId}
            onChange={e => setTargetTeamId(e.target.value)}
            className="w-full px-4 py-2 bg-stadium border border-muted/30 rounded font-mono text-cream focus:border-rust focus:outline-none"
          >
            <option value="">Select a team...</option>
            {otherTeams.map(t => (
              <option key={t.id} value={t.id}>
                {t.city} {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted/60 font-mono mb-3">SELECT PLAYERS TO TRADE</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {roster?.map(entry => (
              <PlayerTradeCard
                key={entry.id}
                player={entry.players}
                value={calculatePlayerValue(entry.players)}
                isSelected={selectedPlayers.some(p => p.id === entry.players?.id)}
                onSelect={togglePlayer}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted/60 font-mono mb-3">SELECT PICKS TO INCLUDE</p>
          <div className="space-y-2">
            {picks?.map(pick => (
              <PickTradeCard
                key={pick.id}
                pick={pick}
                isSelected={selectedPicks.some(p => p.id === pick.id)}
                onSelect={togglePick}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-muted/20">
          <div>
            <p className="text-xs text-muted/60 font-mono">Package Value</p>
            <p className="font-mono text-2xl text-gold">{totalValue}</p>
          </div>
          <button
            onClick={() => onSubmit({ players: selectedPlayers, picks: selectedPicks, targetTeamId })}
            disabled={!targetTeamId || (selectedPlayers.length === 0 && selectedPicks.length === 0)}
            className="px-6 py-3 bg-gold text-stadium rounded font-mono text-sm hover:bg-gold/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send Offer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TradeMarket() {
  const { activeTeam, activeSeason } = useGame();
  const { data: trades } = useTradeMarket(activeTeam?.id || null);
  const { data: tradeBlock } = useTradeBlock(activeTeam?.id || null);
  const { data: roster } = useRoster(activeTeam?.id || null);
  const { data: picks } = useDraftPicks(activeTeam?.id || null);
  const [allTeams, setAllTeams] = useState([]);

  const [activeTab, setActiveTab] = useState('incoming');
  const [showNewTrade, setShowNewTrade] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      const { data } = await supabase.from('teams').select('id, name, city').order('city');
      if (data) setAllTeams(data);
    };
    loadTeams();
  }, []);

  if (!activeTeam) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <PageHeader title="Trade Market" subtitle="No team selected" />
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-muted/60">Start a new game to access the trade market.</p>
        </div>
      </motion.div>
    );
  }

  const incomingTrades = trades?.filter(t => t.receiving_team_id === activeTeam?.id) || [];
  const outgoingTrades = trades?.filter(t => t.initiating_team_id === activeTeam?.id) || [];

  const handleRespond = async (proposalId, response) => {
    try {
      const proposal = trades?.find(t => t.id === proposalId);
      if (!proposal) return;

      if (response === 'accepted') {
        const offerPlayers = proposal.trade_offer_players || [];
        for (const tp of offerPlayers) {
          await supabase
            .from('rosters')
            .update({ team_id: tp.to_team_id })
            .eq('player_id', tp.player_id)
            .eq('team_id', tp.from_team_id);
        }

        const offerPicks = proposal.trade_offer_picks || [];
        for (const tp of offerPicks) {
          if (tp.draft_pick_id) {
            await supabase
              .from('draft_picks')
              .update({ current_team_id: tp.to_team_id })
              .eq('id', tp.draft_pick_id)
              .eq('current_team_id', tp.from_team_id);
          }
        }
      }

      await respondToTrade(proposalId, response);
    } catch (err) {
      console.error('Failed to respond to trade:', err);
    }
  };

  const handleNewTrade = async (offer) => {
    if (!offer.targetTeamId || !activeTeam || !activeSeason) return;
    try {
      const created = await proposeTrade({
        initiating_team_id: activeTeam.id,
        receiving_team_id: offer.targetTeamId,
        season_id: activeSeason.id,
        status: 'pending',
      });

      const playerRecords = offer.players.map(p => ({
        trade_offer_id: created.id,
        player_id: p.id,
        from_team_id: activeTeam.id,
        to_team_id: offer.targetTeamId,
        calculated_value: calculatePlayerValue(p),
      }));

      const pickRecords = offer.picks.map(p => ({
        trade_offer_id: created.id,
        draft_pick_id: p.id,
        from_team_id: activeTeam.id,
        to_team_id: offer.targetTeamId,
        pick_value: getPickValue(p),
      }));

      if (playerRecords.length > 0) await addTradePlayers(created.id, playerRecords);
      if (pickRecords.length > 0) await addTradePicks(created.id, pickRecords);

      setShowNewTrade(false);
    } catch (err) {
      console.error('Failed to submit trade:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <PageHeader
        title="Trade Market"
        subtitle={`${trades?.length || 0} active trades`}
        action={{
          label: 'New Trade',
          onClick: () => setShowNewTrade(true),
          'data-tutorial': 'new-trade',
        }}
      />

      <div className="flex gap-4">
        {['incoming', 'outgoing', 'block'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
              activeTab === tab
                ? 'bg-rust text-cream'
                : 'bg-ink text-muted hover:text-cream'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'incoming' && ` (${incomingTrades.length})`}
            {tab === 'outgoing' && ` (${outgoingTrades.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'incoming' && (
          <>
            {incomingTrades.length === 0 ? (
              <p className="text-center py-12 text-muted/60 font-mono">No incoming trade offers</p>
            ) : (
              incomingTrades.map(trade => (
                <TradeProposalCard
                  key={trade.id}
                  proposal={trade}
                  isIncoming={true}
                  onRespond={handleRespond}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'outgoing' && (
          <>
            {outgoingTrades.length === 0 ? (
              <p className="text-center py-12 text-muted/60 font-mono">No outgoing trade offers</p>
            ) : (
              outgoingTrades.map(trade => (
                <TradeProposalCard
                  key={trade.id}
                  proposal={trade}
                  isIncoming={false}
                  onRespond={handleRespond}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'block' && (
          <>
            {tradeBlock?.length === 0 ? (
              <p className="text-center py-12 text-muted/60 font-mono">Your trade block is empty</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tradeBlock?.map(block => (
                  <div key={block.id} className="p-4 rounded-lg border border-ink bg-ink">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-cream">{block.player_name || block.player?.name}</p>
                      <span className="font-mono text-gold">${block.asking_price}M</span>
                    </div>
                    <p className="text-sm text-muted/60">
                      {(block.player_position || block.player?.position)} · {(block.player_overall || block.player?.overall)} OVR
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showNewTrade && (
          <NewTradeModal
            onClose={() => setShowNewTrade(false)}
            roster={roster}
            picks={picks}
            allTeams={allTeams}
            activeTeamId={activeTeam?.id}
            onSubmit={handleNewTrade}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
