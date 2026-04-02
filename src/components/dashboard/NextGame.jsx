import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { supabase } from '../../lib/supabase'

export default function NextGame() {
  const navigate = useNavigate()
  const { activeTeam, activeSeason } = useGame()
  const [nextGame, setNextGame] = useState(null)

  useEffect(() => {
    if (!activeTeam || !activeSeason) return
    const loadNext = async () => {
      const { data } = await supabase
        .from('game_log')
        .select(`
          *,
          home_team:teams!game_log_home_team_id_fkey (id, name, city, wins, losses),
          away_team:teams!game_log_away_team_id_fkey (id, name, city, wins, losses)
        `)
        .or(`home_team_id.eq.${activeTeam.id},away_team_id.eq.${activeTeam.id}`)
        .eq('season_id', activeSeason.id)
        .is('home_score', null)
        .order('played_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (data) {
        const isHome = data.home_team_id === activeTeam.id
        const opponent = isHome ? data.away_team : data.home_team
        const myTeam = isHome ? data.home_team : data.away_team
        const oppRecord = `${opponent.wins || 0}-${opponent.losses || 0}`
        setNextGame({
          id: data.id,
          isHome,
          opponent: `${opponent.city} ${opponent.name}`,
          opponentRecord: oppRecord,
          myRecord: `${myTeam.wins || 0}-${myTeam.losses || 0}`,
        })
      } else {
        setNextGame(null)
      }
    }
    loadNext()
  }, [activeTeam?.id, activeSeason?.id])

  if (!nextGame) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.2 }}
        className="bg-ink border border-muted/20 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-muted text-[10px] uppercase tracking-wider mb-1">
              Next Game
            </p>
            <h3 className="font-display text-cream text-xl">
              No games scheduled
            </h3>
          </div>
        </div>
        <p className="font-mono text-muted/60 text-sm">
          {activeTeam ? 'All games played this week.' : 'Start a game to see matchup details.'}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.2 }}
      className="bg-ink border border-muted/20 p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-muted text-[10px] uppercase tracking-wider mb-1">
            Next Game
          </p>
          <h3 className="font-display text-cream text-2xl">
            {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
          </h3>
          <p className="font-mono text-muted text-[13px] mt-1">
            {nextGame.opponentRecord}
          </p>
        </div>
        {nextGame.isHome && (
          <span className="px-2 py-1 bg-rust/20 text-rust font-mono text-[10px] uppercase">
            Home
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-stadium border border-muted/20">
        <div>
          <p className="font-mono text-muted text-[10px] uppercase mb-2">Your Record</p>
          <p className="font-mono text-cream text-2xl">{nextGame.myRecord}</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/game-day')}
        className="w-full py-3 bg-rust text-cream font-mono text-sm uppercase tracking-wider hover:bg-rust/90 transition-colors"
      >
        Play Game
      </button>
    </motion.div>
  )
}
