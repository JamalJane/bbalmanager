import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const GameContext = createContext()

const TUTORIAL_INBOX = [
  { id: 'tutorial-0', category: 'media', description: '🎓 Welcome, GM! Click to learn how to play Bashketbal.', isNew: true, isTutorial: true, tutorialStep: 0 },
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
    inbox: [],
    storyBeats: [],
    gameFeed: [],
    momentum: 'neutral',
    isClutch: false,
    gamesPlayedThisWeek: false,
    tutorial: {
      completed: false,
      skipped: false,
      currentStep: 0,
    },
  })

  const [gmProfile, setGmProfile] = useState(null)
  const [activeTeam, setActiveTeam] = useState(null)
  const [activeSeason, setActiveSeason] = useState(null)
  const [coachPayroll, setCoachPayroll] = useState(0)

  useEffect(() => {
    try {
      const savedGameState = localStorage.getItem('bashketbal_game_state')
      if (savedGameState) {
        const parsed = JSON.parse(savedGameState)
        setGameState(prev => ({ ...prev, ...parsed }))
      }
    } catch (err) {
      console.warn('Could not load game state:', err)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('bashketbal_game_state', JSON.stringify(gameState))
    } catch (err) {
      console.warn('Could not save game state:', err)
    }
  }, [gameState])

  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const savedGm = localStorage.getItem('bashketbal_gm')
        const savedTeam = localStorage.getItem('bashketbal_team')
        const savedSeason = localStorage.getItem('bashketbal_season')

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
    setGameState(prev => ({ ...prev, chemistry: 50 }))
  }, [])

  const startTutorial = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      inbox: TUTORIAL_INBOX,
      tutorial: { completed: false, skipped: false, currentStep: 0 },
    }))
  }, [])

  const advanceTutorial = useCallback(() => {
    setGameState(prev => {
      const nextStep = prev.tutorial.currentStep + 1
      if (nextStep >= 5) {
        return {
          ...prev,
          inbox: prev.inbox.filter(item => !item.isTutorial),
          tutorial: { ...prev.tutorial, completed: true, currentStep: nextStep },
        }
      }
      return {
        ...prev,
        tutorial: { ...prev.tutorial, currentStep: nextStep },
        inbox: prev.inbox.map(item => 
          item.isTutorial ? { ...item, tutorialStep: nextStep } : item
        ),
      }
    })
  }, [])

  const skipTutorial = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      inbox: prev.inbox.filter(item => !item.isTutorial),
      tutorial: { completed: true, skipped: true, currentStep: 99 },
    }))
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
      startTutorial,
      advanceTutorial,
      skipTutorial,
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
