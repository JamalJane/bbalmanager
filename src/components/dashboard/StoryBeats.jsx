import React from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { useTypewriter } from '../../hooks/useTypewriter'

const categoryColors = {
  milestone: 'bg-gold/20 text-gold',
  momentum: 'bg-rust/20 text-rust',
  persona: 'bg-gold/20 text-gold',
  trade: 'bg-muted/20 text-muted',
  injury: 'bg-ember/20 text-ember',
  record: 'bg-gold/20 text-gold',
}

function StoryBeatItem({ beat, isFirst }) {
  const { displayed, isComplete } = useTypewriter(
    beat.text,
    28,
    isFirst && beat.isNew ? 0 : 0
  )

  return (
    <div className={`py-3 ${beat.isNew && isFirst ? '' : 'opacity-100'}`}>
      <p className="font-serif italic text-parchment text-[15px] leading-relaxed">
        {isFirst && beat.isNew ? displayed : beat.text}
        {isFirst && beat.isNew && !isComplete && <span className="animate-pulse">|</span>}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`px-2 py-0.5 font-mono text-[10px] uppercase ${categoryColors[beat.category] || 'bg-muted/20 text-muted'}`}>
          {beat.category}
        </span>
        <span className="font-mono text-muted text-[11px]">
          {beat.timestamp}
        </span>
      </div>
    </div>
  )
}

export default function StoryBeats() {
  const { gameState } = useGame()
  const storyBeats = gameState?.storyBeats ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.3 }}
      className="bg-ink border border-muted/20 p-6"
    >
      <h3 className="font-display text-parchment text-lg uppercase mb-4">
        Story Beats
      </h3>

      <div className="divide-y divide-muted/20">
        {storyBeats.map((beat, index) => (
          <StoryBeatItem 
            key={beat.id} 
            beat={beat} 
            isFirst={index === 0}
          />
        ))}
      </div>
    </motion.div>
  )
}
