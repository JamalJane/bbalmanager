import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../../context/GameContext'

const categoryIcons = {
  trade: '↔',
  scouting: '⌕',
  coach: '◎',
  injury: '+',
  media: '◉',
}

const categoryColors = {
  trade: 'text-gold',
  scouting: 'text-rust',
  coach: 'text-parchment',
  injury: 'text-ember',
  media: 'text-muted',
}

export default function PriorityInbox() {
  const { gameState, markInboxRead } = useGame()
  const inbox = gameState?.inbox ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.25 }}
      className="bg-ink border border-muted/20 p-6"
    >
      <h3 className="font-display text-parchment text-lg uppercase mb-4">
        Priority Inbox
      </h3>

      <div className="space-y-3">
        <AnimatePresence>
          {inbox.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.id}
              initial={item.isNew ? { opacity: 0, y: -12 } : { opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => markInboxRead(item.id)}
              className={`p-3 bg-stadium border border-muted/20 cursor-pointer transition-colors hover:border-rust/50 ${
                item.isNew ? 'border-l-2 border-l-rust' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`${categoryColors[item.category]} text-lg`}>
                  {categoryIcons[item.category] || '•'}
                </span>
                <p className="font-mono text-parchment text-[13px] leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {inbox.length > 5 && (
        <button className="w-full mt-4 py-2 font-mono text-muted text-xs uppercase tracking-wider hover:text-parchment transition-colors">
          View All ({inbox.length})
        </button>
      )}
    </motion.div>
  )
}
