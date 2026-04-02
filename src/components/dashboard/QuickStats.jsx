import React from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { useCountUp } from '../../hooks/useCountUp'

function StatBlock({ value, label, suffix = '', delay = 0 }) {
  const displayValue = useCountUp(value, 800)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay }}
      className="bg-ink p-4 border border-muted/20"
    >
      <p className="font-mono text-muted text-[10px] uppercase tracking-wider">
        {label}
      </p>
      <p className="font-mono text-cream text-[32px] leading-none mt-1">
        {displayValue}{suffix}
      </p>
    </motion.div>
  )
}

export default function QuickStats() {
  const { gameState } = useGame()
  const { teamRecord, conferenceRank, streak, chemistry } = gameState

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatBlock
        value={teamRecord?.wins ?? 0}
        label="Wins"
        delay={0}
      />
      <StatBlock
        value={teamRecord?.losses ?? 0}
        label="Losses"
        delay={0.05}
      />
      <StatBlock
        value={conferenceRank ?? 0}
        label="Conf. Seed"
        suffix="#"
        delay={0.1}
      />
      <StatBlock
        value={chemistry ?? 50}
        label="Chemistry"
        suffix="%"
        delay={0.15}
      />
    </div>
  )
}
