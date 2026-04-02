import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { supabase } from '../../lib/supabase'

export default function GameFeed() {
  const { activeTeam, activeSeason, gameState } = useGame()
  const [recentGames, setRecentGames] = useState([])
  const { teamRecord } = gameState

  useEffect(() => {
    if (!activeTeam || !activeSeason) return
    const load = async () => {
      const { data } = await supabase
        .from('game_log')
        .select('*, home_team:teams!game_log_home_team_id_fkey(id, name, city), away_team:teams!game_log_away_team_id_fkey(id, name, city)')
        .or(`home_team_id.eq.${activeTeam.id},away_team_id.eq.${activeTeam.id}`)
        .eq('season_id', activeSeason.id)
        .not('home_score', 'is', null)
        .order('played_at', { ascending: false })
        .limit(5)
      if (data) {
        const formatted = data.map(g => {
          const isHome = g.home_team_id === activeTeam.id
          const myScore = isHome ? g.home_score : g.away_score
          const oppScore = isHome ? g.away_score : g.home_score
          const opp = isHome ? g.away_team : g.home_team
          const won = (isHome && g.home_score > g.away_score) || (!isHome && g.away_score > g.home_score)
          return {
            id: g.id,
            text: `${isHome ? 'vs' : '@'} ${opp?.city} ${opp?.name}: ${g.home_score}-${g.away_score} ${won ? '(W)' : '(L)'}`,
            result: won ? 'win' : 'loss',
            isKeyMoment: false,
          }
        })
        setRecentGames(formatted)
      }
    }
    load()
  }, [activeTeam?.id, activeSeason?.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.22 }}
      className="bg-ink border border-muted/20 overflow-hidden"
    >
      <div className="p-4 border-b border-muted/20 bg-stadium/50">
        <p className="font-mono text-muted text-[10px] uppercase tracking-wider">
          Recent Results
        </p>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-4 space-y-2">
        {recentGames.length === 0 && (
          <p className="font-mono text-muted text-sm text-center py-8">
            No games played yet
          </p>
        )}
        {recentGames.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: index * 0.03 }}
            className={`
              py-2 px-3 border-l-2
              ${item.result === 'win' ? 'bg-gold/5 border-gold' : 'bg-ember/5 border-ember'}
            `}
          >
            <div className="flex items-start justify-between">
              <p className={`font-serif italic text-[15px] flex-1 ${item.result === 'win' ? 'text-gold' : 'text-ember'}`}>
                {item.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
