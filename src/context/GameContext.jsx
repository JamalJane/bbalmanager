import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const GameContext = createContext()

const MOCK_INBOX = [
  { id: 1, category: 'trade', description: 'Welcome to Hardwood Manager! Set up your team and start your season.', isNew: true },
  { id: 2, category: 'scouting', description: 'Head to the Draft Board to scout prospects for your future.', isNew: true },
]

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState({
    currentWeek: 1,
    totalWeeks: 24,
    teamRecord: { wins: 0, losses: 0 },
    conferenceRank: null,
    streak: null,
    chemistry: 50,
    legacyScore: 0,
    nextGame: null,
    inbox: MOCK_INBOX,
    storyBeats: [],
    gameFeed: [],
    momentum: 'neutral',
    isClutch: false,
    gamesPlayedThisWeek: false,
  })

  const [gmProfile, setGmProfile] = useState(null)
  const [activeTeam, setActiveTeam] = useState(null)
  const [activeSeason, setActiveSeason] = useState(null)
  const [coachPayroll, setCoachPayroll] = useState(0)

  // Load saved game state from localStorage
  useEffect(() => {
    try {
      const savedGameState = localStorage.getItem('hardwood_game_state')
      if (savedGameState) {
        const parsed = JSON.parse(savedGameState)
        setGameState(prev => ({ ...prev, ...parsed }))
      }
    } catch (err) {
      console.warn('Could not load game state:', err)
    }
  }, [])

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hardwood_game_state', JSON.stringify(gameState))
    } catch (err) {
      console.warn('Could not save game state:', err)
    }
  }, [gameState])

  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const savedGm = localStorage.getItem('hardwood_gm')
        const savedTeam = localStorage.getItem('hardwood_team')
        const savedSeason = localStorage.getItem('hardwood_season')

        if (savedGm) {
          const gm = JSON.parse(savedGm)
          setGmProfile(gm)
          setActiveTeam(savedTeam ? JSON.parse(savedTeam) : (gm.teams || null))

          if (savedSeason) {
            const season = JSON.parse(savedSeason)
            setActiveSeason(season)

            if (gm.team_id) {
              const { data: dbSeason } = await supabase
                .from('seasons')
                .select('games_per_season')
                .eq('id', season.id)
                .single()

              if (dbSeason) {
                setGameState(prev => ({
                  ...prev,
                  totalWeeks: dbSeason.games_per_season || prev.totalWeeks,
                }))
              }

              // Load team record from database
              const { data: teamData } = await supabase
                .from('teams')
                .select('wins, losses')
                .eq('id', gm.team_id)
                .single();
              if (teamData) {
                setGameState(prev => ({
                  ...prev,
                  teamRecord: {
                    wins: teamData.wins || 0,
                    losses: teamData.losses || 0,
                  },
                }));
              }

              const { data: coaches } = await supabase
                .from('coaching_staff')
                .select('salary')
                .eq('team_id', gm.team_id)
              const total = (coaches || []).reduce((sum, c) => sum + (c.salary || 0), 0)
              setCoachPayroll(total)
            }
          }
        }
      } catch (err) {
        console.warn('Could not load saved game:', err)
      }
    }
    loadSavedGame()
  }, [])

  const updateWeek = useCallback((newWeek) => {
    setGameState(prev => ({ ...prev, currentWeek: newWeek, gamesPlayedThisWeek: false }))
  }, [])

  const addStoryBeat = useCallback((beat) => {
    const transformedBeat = {
      id: Date.now(),
      isNew: true,
      text: beat.description || beat.text,
      category: beat.event_type || beat.category || 'milestone',
      timestamp: beat.triggered_at ? new Date(beat.triggered_at).toLocaleDateString() : 'Now',
    };
    setGameState(prev => ({
      ...prev,
      storyBeats: [transformedBeat, ...prev.storyBeats].slice(0, 8),
    }))
  }, [])

  const markInboxRead = useCallback((id) => {
    setGameState(prev => ({
      ...prev,
      inbox: prev.inbox.map(item => item.id === id ? { ...item, isNew: false } : item),
    }))
  }, [])

  const addGameFeedItem = useCallback((item) => {
    setGameState(prev => ({
      ...prev,
      gameFeed: [{ ...item, id: Date.now(), timestamp: 'LIVE' }, ...prev.gameFeed],
    }))
  }, [])

  const updateGameState = useCallback((updates) => {
    setGameState(prev => ({ ...prev, ...updates }))
  }, [])

  const refreshCoachPayroll = useCallback(async (teamId) => {
    if (!teamId) return
    const { data } = await supabase.from('coaching_staff').select('salary').eq('team_id', teamId)
    setCoachPayroll((data || []).reduce((sum, c) => sum + (c.salary || 0), 0))
  }, [])

  const refreshChemistry = useCallback(async (teamId) => {
    if (!teamId) return
    // Chemistry is now calculated dynamically, use default value
    setGameState(prev => ({ ...prev, chemistry: 50 }))
  }, [])

  return (
    <GameContext.Provider value={{
      gameState,
      updateWeek,
      addStoryBeat,
      markInboxRead,
      addGameFeedItem,
      updateGameState,
      gmProfile,
      setGmProfile,
      activeTeam,
      setActiveTeam,
      activeSeason,
      setActiveSeason,
      coachPayroll,
      setCoachPayroll,
      refreshCoachPayroll,
      refreshChemistry,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
