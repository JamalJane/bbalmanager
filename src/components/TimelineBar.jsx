import React from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function TimelineBar() {
  const { gameState } = useGame()
  const currentWeek = gameState?.currentWeek ?? 1
  const totalWeeks = gameState?.totalWeeks ?? 12

  const regularSeasonWeeks = totalWeeks || 12
  const allStarBreak = Math.floor(regularSeasonWeeks / 2)
  const tradeDeadline = Math.floor(regularSeasonWeeks * 0.75)

  return (
    <div className="sticky top-0 z-30 bg-ink border-b border-muted/20">
      <div className="h-12 flex items-center px-4">
        <div className="flex-1 flex items-center gap-[2px]">
          {Array.from({ length: regularSeasonWeeks }).map((_, i) => {
            const weekNum = i + 1
            const isCompleted = weekNum < currentWeek
            const isCurrent = weekNum === currentWeek
            const isAllStar = weekNum === allStarBreak
            const isTradeDeadline = weekNum === tradeDeadline

            return (
              <React.Fragment key={weekNum}>
                {isTradeDeadline && (
                  <div 
                    className="h-6 w-[1px] bg-rust mx-1"
                    title="Trade Deadline"
                  />
                )}
                <motion.div
                  className={`relative h-6 flex-1 rounded-sm overflow-hidden ${
                    isAllStar ? 'border border-gold/50' : ''
                  }`}
                  title={`Week ${weekNum}`}
                >
                  {isCompleted ? (
                    <motion.div
                      className="absolute inset-0 bg-muted/40"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  ) : isCurrent ? (
                    <motion.div
                      className="absolute inset-0 bg-rust"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  ) : (
                    <div className="absolute inset-0 border border-muted/30" />
                  )}
                </motion.div>
                {isAllStar && (
                  <div 
                    className="h-6 w-[1px] bg-gold mx-1"
                    title="All-Star Break"
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className="ml-4 flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-[10px] text-muted uppercase">Week</p>
            <p className="font-mono text-cream text-sm">{currentWeek} / {regularSeasonWeeks}</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-muted/20" />
    </div>
  )
}
