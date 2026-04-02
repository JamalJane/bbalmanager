import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PlayerTable from '../components/roster/PlayerTable'
import PlayerDetail from '../components/roster/PlayerDetail'
import { useRoster, useCurrentGM } from '../hooks'

export default function Roster() {
  const navigate = useNavigate()
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  const [filter, setFilter] = useState('all')

  const { data: gm } = useCurrentGM()
  const savedGm = (() => { try { return JSON.parse(localStorage.getItem('hardwood_gm') || '{}') } catch { return {} } })()
  const teamId = gm?.team_id || savedGm.team_id || null

  const { data: roster, loading, refetch } = useRoster(teamId, false)

  const players = useMemo(() => {
    if (!roster) return []
    return roster
      .filter(r => r.players)
      .map(r => ({
        ...r.players,
        rosterId: r.id,
        role: r.role,
        devPathway: r.dev_pathway,
        minutesAvg: r.minutes_avg,
      }))
  }, [roster])

  const filteredPlayers = useMemo(() => {
    if (filter === 'all') return players
    if (filter === 'starters') return players.filter(p => p.overall >= 88)
    if (filter === 'bench') return players.filter(p => p.overall < 88)
    if (['PG', 'SG', 'SF', 'PF', 'C'].includes(filter)) {
      return players.filter(p => p.position === filter)
    }
    return players
  }, [players, filter])

  const selectedEntry = useMemo(() => {
    if (!selectedPlayerId || !roster) return null
    const entry = roster.find(r => r.players?.id === selectedPlayerId)
    if (!entry) return null
    return {
      ...entry.players,
      rosterId: entry.id,
      role: entry.role,
      devPathway: entry.dev_pathway,
      minutesAvg: entry.minutes_avg,
    }
  }, [selectedPlayerId, roster])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader
        title="Roster"
        subtitle={`${players.length} Players`}
        action="Sign Free Agent"
      />
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/dev-league')}
          className="px-4 py-2 bg-ink text-gold font-mono text-[13px] uppercase tracking-wider border border-gold/30 hover:border-gold hover:bg-gold/10 transition-colors"
        >
          Dev League
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="font-mono text-muted text-sm animate-pulse">Loading roster...</div>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="flex gap-2 mb-4">
              {['all', 'starters', 'bench', 'PG', 'SG', 'SF', 'PF', 'C'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    filter === f
                      ? 'bg-rust text-cream'
                      : 'bg-ink text-muted hover:text-parchment border border-muted/30'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'starters' ? 'Starters' : f === 'bench' ? 'Bench' : f}
                </button>
              ))}
            </div>

            <PlayerTable
              players={filteredPlayers}
              onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
              selectedId={selectedPlayerId}
            />
          </div>

          <AnimatePresence>
            {selectedEntry && (
              <PlayerDetail
                player={selectedEntry}
                onClose={() => setSelectedPlayerId(null)}
                onActionComplete={refetch}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
