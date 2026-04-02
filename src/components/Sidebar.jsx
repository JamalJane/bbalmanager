import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { useCountUp } from '../hooks/useCountUp'
import { supabase } from '../lib/supabase'

const HARD_CAP = 141000000

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/roster', label: 'Roster' },
  { path: '/dev-league', label: 'Dev League' },
  { path: '/game-day', label: 'Game Day' },
  { path: '/trade-market', label: 'Trade Market' },
  { path: '/coaching-staff', label: 'Coaching' },
  { path: '/scouting', label: 'Scouting' },
  { path: '/draft-board', label: 'Draft Board' },
  { path: '/offseason', label: 'Offseason', offseasonOnly: true },
  { path: '/records', label: 'Records' },
  { path: '/hall-of-fame', label: 'Hall of Fame' },
  { path: '/season-recap', label: 'Recap' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { activeTeam, gameState, coachPayroll, setGmProfile, setActiveTeam, setActiveSeason } = useGame()
  const legacyDisplay = useCountUp(gameState?.legacyScore ?? 0)
  const [totalPayroll, setTotalPayroll] = useState(0)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const isOffseason = (gameState?.currentWeek ?? 1) > (gameState?.totalWeeks ?? 12)

  useEffect(() => {
    if (!activeTeam) return
    const loadPayroll = async () => {
      const { data: roster } = await supabase
        .from('rosters')
        .select('player_id')
        .eq('team_id', activeTeam.id)
        .eq('is_dev_league', false)
      const playerIds = (roster || []).map(r => r.player_id)
      if (playerIds.length === 0) { setTotalPayroll(0); return }
      const { data: players } = await supabase
        .from('players')
        .select('salary')
        .in('id', playerIds)
      const total = (players || []).reduce((sum, p) => sum + (p.salary || 0), 0)
      setTotalPayroll(total)
    }
    loadPayroll()
  }, [activeTeam?.id])

  const capSpace = HARD_CAP - totalPayroll - coachPayroll
  const capPct = Math.round(((totalPayroll + coachPayroll) / HARD_CAP) * 100)
  const overCap = capSpace < 0

  const handleQuitGame = () => {
    localStorage.removeItem('bashketbal_gm')
    localStorage.removeItem('bashketbal_team')
    localStorage.removeItem('bashketbal_season')
    localStorage.removeItem('bashketbal_game_state')
    setGmProfile(null)
    setActiveTeam(null)
    setActiveSeason(null)
    setShowQuitConfirm(false)
    navigate('/new-game')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-ink flex flex-col z-40">
      <div className="p-6">
        <Link to="/" className="block">
          <h1 className="font-display text-cream text-lg uppercase tracking-wide hover:text-gold transition-colors">
            {activeTeam ? `${activeTeam.city} ${activeTeam.name}` : 'Your Team'}
          </h1>
        </Link>
        <div className="h-px bg-rust mt-4" />
      </div>

      <nav className="flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const disabled = item.offseasonOnly && !isOffseason
          return (
            <NavLink
              key={item.path}
              to={disabled ? '#' : item.path}
              onClick={disabled ? (e) => e.preventDefault() : undefined}
              className={`relative block px-6 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                disabled
                  ? 'text-muted/40 cursor-not-allowed'
                  : isActive
                  ? 'text-cream bg-parchment/5'
                  : 'text-parchment/70 hover:text-parchment hover:bg-parchment/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-rust"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              {item.label}
              {disabled && <span className="ml-1 text-[9px] opacity-50">(offseason)</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-6 border-t border-muted/30 space-y-4">
        <div>
          <p className="font-mono text-muted text-[10px] uppercase tracking-wider">
            {overCap ? 'Over Cap' : 'Cap Space'}
          </p>
          <p className={`font-mono text-[20px] leading-none mt-1 ${overCap ? 'text-ember' : 'text-gold'}`}>
            {overCap ? '-' : ''}{Math.abs(capSpace / 1000000).toFixed(1)}M
          </p>
          <div className="h-1 bg-stadium rounded mt-2 overflow-hidden">
            <div
              className={`h-full ${overCap ? 'bg-ember' : capPct > 85 ? 'bg-rust' : 'bg-gold'}`}
              style={{ width: `${Math.min(100, capPct)}%` }}
            />
          </div>
          <p className="font-mono text-muted text-[10px] mt-1">
            {capPct}% of cap
          </p>
        </div>

        <div>
          <p className="font-mono text-muted text-[10px] uppercase tracking-wider">
            Legacy
          </p>
          <p className="font-mono text-gold text-[20px] leading-none mt-1">
            {legacyDisplay.toLocaleString()}
          </p>
        </div>

        {!showQuitConfirm ? (
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="w-full py-2 text-xs font-mono text-muted/60 hover:text-ember transition-colors border border-muted/20 rounded hover:border-ember/50"
          >
            Quit & Start New
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted/60 font-mono text-center">Quit this game?</p>
            <div className="flex gap-2">
              <button
                onClick={handleQuitGame}
                className="flex-1 py-1.5 text-xs font-mono text-cream bg-ember/20 hover:bg-ember/30 rounded transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-1.5 text-xs font-mono text-muted hover:text-cream transition-colors border border-muted/20 rounded hover:border-muted/50"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
