import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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

const tutorialSteps = [
  { step: 0, navigateTo: null, message: 'Welcome, GM! Click to learn the basics.' },
  { step: 1, navigateTo: '/roster', message: 'Meet your team! Click to view roster.' },
  { step: 2, navigateTo: '/roster', message: 'Click any player to see details.' },
  { step: 3, navigateTo: '/game-day', message: 'Time to play! Let\'s simulate a game.' },
  { step: 4, navigateTo: '/trade-market', message: 'Build your dynasty through trades.' },
  { step: 5, navigateTo: '/scouting', message: 'Scout prospects for the draft.' },
]

export default function PriorityInbox() {
  const navigate = useNavigate()
  const { gameState, markInboxRead, advanceTutorial, startTutorial } = useGame()
  const inbox = gameState?.inbox ?? []
  const tutorial = gameState?.tutorial ?? { completed: true, skipped: false }

  const handleTutorialClick = (item) => {
    if (item.isTutorial) {
      advanceTutorial()
    } else {
      markInboxRead(item.id)
    }
  }

  const handleSkipTutorial = () => {
    const tutorialItems = inbox.filter(i => i.isTutorial)
    tutorialItems.forEach(item => markInboxRead(item.id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.25 }}
      className="bg-ink border border-muted/20 p-6"
      data-tutorial="inbox"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-parchment text-lg uppercase">
          Priority Inbox
        </h3>
        {!tutorial.completed && !tutorial.skipped && inbox.some(i => i.isTutorial) && (
          <button
            onClick={handleSkipTutorial}
            className="text-xs text-muted hover:text-gold font-mono transition-colors"
          >
            Skip Tutorial
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {inbox.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.id}
              initial={item.isNew ? { opacity: 0, y: -12 } : { opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => handleTutorialClick(item)}
              className={`p-3 bg-stadium border cursor-pointer transition-colors hover:border-rust/50 ${
                item.isNew && !item.isTutorial ? 'border-l-2 border-l-rust' : ''
              } ${item.isTutorial ? 'border-gold/50 border-2 border-dashed animate-pulse' : 'border-muted/20'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`${item.isTutorial ? 'text-gold' : categoryColors[item.category]} text-lg`}>
                  {item.isTutorial ? '🎓' : categoryIcons[item.category] || '•'}
                </span>
                <p className="font-mono text-parchment text-[13px] leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>
              {item.isTutorial && (
                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-gold font-mono bg-gold/10 px-2 py-1 rounded">
                    Tutorial
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {inbox.length === 0 && (
        <p className="text-center text-muted/60 font-mono text-sm py-4">
          No messages yet
        </p>
      )}

      {inbox.length > 5 && (
        <button className="w-full mt-4 py-2 font-mono text-muted text-xs uppercase tracking-wider hover:text-parchment transition-colors">
          View All ({inbox.length})
        </button>
      )}
    </motion.div>
  )
}
