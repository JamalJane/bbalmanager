import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import QuickStats from '../components/dashboard/QuickStats'
import NextGame from '../components/dashboard/NextGame'
import PriorityInbox from '../components/dashboard/PriorityInbox'
import StoryBeats from '../components/dashboard/StoryBeats'
import GameFeed from '../components/dashboard/GameFeed'
import { useGame } from '../context/GameContext'
import { supabase } from '../lib/supabase'
import { runWeeklyTick } from '../lib/weeklyTick'
import { generatePlayoffBracket, runPlayoffs, savePlayoffResults } from '../lib/playoffsEngine'
import { computeAndSaveAwards } from '../lib/awardsEngine'

export default function Dashboard() {
  const { gameState, activeTeam, activeSeason, updateWeek, updateGameState, refreshChemistry, addStoryBeat } = useGame()
  const { currentWeek, totalWeeks, teamRecord } = gameState
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [seasonEnded, setSeasonEnded] = useState(false)
  const [playoffResults, setPlayoffResults] = useState(null)

  const wins = teamRecord?.wins ?? 0
  const losses = teamRecord?.losses ?? 0
  const teamName = activeTeam ? `${activeTeam.city} ${activeTeam.name}` : 'Your Team'

  const subtitle = seasonEnded
    ? `${teamName} — Season Complete — ${wins}-${losses} Record`
    : `${teamName} — Week ${currentWeek} of ${totalWeeks} — ${wins}-${losses} Record`

  useEffect(() => {
    if (!activeTeam || !activeSeason) return
    const ensureGames = async () => {
      const { count } = await supabase
        .from('game_log')
        .select('id', { count: 'exact', head: true })
        .eq('season_id', activeSeason.id)
      if (count === 0) {
        await generateSeasonGames(activeSeason.id, totalWeeks)
      }
    }
    ensureGames()
  }, [activeTeam?.id, activeSeason?.id])

  const handleSeasonEnd = async () => {
    if (!activeTeam || !activeSeason) return
    setIsAdvancing(true)
    try {
      const bracket = await generatePlayoffBracket(activeSeason.id)
      const results = await runPlayoffs(bracket)
      await computeAndSaveAwards(activeSeason.id)
      await savePlayoffResults(activeSeason.id, results, activeTeam.id)
      setPlayoffResults(results)
      setSeasonEnded(true)
      addStoryBeat({
        event_type: 'season_complete',
        description: `${results.champion.name} are the ${new Date().getFullYear()} Champions!`,
        category: 'milestone'
      })
    } catch (err) {
      console.warn('Season end error:', err)
    } finally {
      setIsAdvancing(false)
    }
  }

  const handleAdvanceWeek = async () => {
    if (currentWeek > totalWeeks || !activeTeam || !activeSeason) return
    setIsAdvancing(true)
    try {
      const result = await runWeeklyTick({
        teamId: activeTeam.id,
        seasonId: activeSeason.id,
        weekNumber: currentWeek,
        addStoryBeat
      })
      updateWeek(result.weekNumber)
      await refreshChemistry(activeTeam.id)
    } catch (err) {
      console.warn('Week advance error:', err)
    } finally {
      setIsAdvancing(false)
    }
  }

  const isSeasonComplete = currentWeek > totalWeeks
  const buttonLabel = seasonEnded
    ? 'View Season Recap'
    : isSeasonComplete
      ? 'View Playoffs'
      : 'Advance Week'

  const buttonAction = isSeasonComplete && !seasonEnded ? handleSeasonEnd : handleAdvanceWeek

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        action={{
          label: buttonLabel,
          onClick: buttonAction,
          disabled: isAdvancing || (!isSeasonComplete && currentWeek > totalWeeks)
        }}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <QuickStats />
          <NextGame />
          <GameFeed />
          {seasonEnded && playoffResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-ink rounded-lg border border-gold/50 p-6"
            >
              <h3 className="font-mono text-gold text-sm mb-4">🏆 PLAYOFF RESULTS</h3>
              <div className="space-y-2">
                <p className="font-display text-cream text-lg">
                  <span className="text-gold">{playoffResults.champion.name}</span> win the Championship!
                </p>
                <p className="text-muted/60 font-mono text-sm">
                  Runner-up: {playoffResults.runnerUp.name}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <PriorityInbox />
          <StoryBeats />
        </div>
      </div>
    </motion.div>
  )
}

async function generateSeasonGames(seasonId, totalWeeks) {
  const { data: teams } = await supabase.from('teams').select('id')
  if (!teams || teams.length < 2) return

  const pairings = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairings.push([teams[i].id, teams[j].id])
    }
  }

  const shuffled = pairings.sort(() => Math.random() - 0.5)
  const gamesPerWeek = Math.floor(teams.length / 2)

  const games = []
  for (let week = 1; week <= totalWeeks; week++) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7)
    for (let slot = 0; slot < gamesPerWeek; slot++) {
      const idx = ((week - 1) * gamesPerWeek + slot) % shuffled.length
      const [homeId, awayId] = shuffled[idx]
      games.push({
        season_id: seasonId,
        home_team_id: homeId,
        away_team_id: awayId,
        played_at: weekStart.toISOString(),
      })
    }
  }

  if (games.length > 0) {
    await supabase.from('game_log').insert(games)
  }
}


