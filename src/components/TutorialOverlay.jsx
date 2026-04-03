import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

const TUTORIAL_STEPS = [
  {
    id: 0,
    title: 'Welcome, GM!',
    message: 'Welcome to Bashketbal! Let me show you around. This is your Priority Inbox - all important news, trades, and updates appear here.',
    targetPage: '/dashboard',
    targetSelector: '[data-tutorial="inbox"]',
  },
  {
    id: 1,
    title: 'Your Roster',
    message: 'Here\'s your team roster. OVR shows player overall rating. Potential indicates future growth ceiling. Click any player to see their details!',
    targetPage: '/roster',
    targetSelector: '[data-tutorial="player-row"]',
  },
  {
    id: 2,
    title: 'Play Games',
    message: 'When ready, head to Game Day to play. Choose your speed (Quick/Standard/Detailed), make decisions during games, and win!',
    targetPage: '/game-day',
    targetSelector: '[data-tutorial="play-button"]',
  },
  {
    id: 3,
    title: 'Trade Market',
    message: 'Improve your team through trades. Swap players and draft picks to build a championship roster.',
    targetPage: '/trade-market',
    targetSelector: '[data-tutorial="new-trade"]',
  },
  {
    id: 4,
    title: 'Scouting',
    message: 'Scout draft prospects to learn about future stars. Assign scouts to reveal their skills!',
    targetPage: '/scouting',
    targetSelector: '[data-tutorial="scouts"]',
  },
]

export default function TutorialOverlay({ tutorialState, onComplete, onSkip }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [targetRect, setTargetRect] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showCard, setShowCard] = useState(false)

  const tutorialCompleted = tutorialState?.completed || false
  const tutorialSkipped = tutorialState?.skipped || false
  const actualStep = tutorialState?.currentStep ?? 0

  const step = TUTORIAL_STEPS[actualStep]
  const needsNavigation = step && location.pathname !== step.targetPage

  useEffect(() => {
    if (tutorialCompleted || tutorialSkipped) {
      setShowCard(false)
      return
    }

    if (!step) {
      setShowCard(false)
      return
    }

    if (needsNavigation && !isNavigating) {
      setShowCard(false)
      setIsNavigating(true)
      navigate(step.targetPage)
      return
    }

    if (!needsNavigation && isNavigating) {
      setIsNavigating(false)
    }

    const updateTargetPosition = () => {
      if (!step?.targetSelector) {
        setTargetRect(null)
        setShowCard(true)
        return
      }

      const element = document.querySelector(step.targetSelector)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        setShowCard(true)
      } else {
        setTargetRect(null)
        const timer = setTimeout(updateTargetPosition, 100)
        return () => clearTimeout(timer)
      }
    }

    const timer = setTimeout(updateTargetPosition, 300)
    return () => clearTimeout(timer)
  }, [actualStep, tutorialCompleted, tutorialSkipped, needsNavigation, isNavigating, step, location.pathname, navigate])

  const handleNext = useCallback(() => {
    if (actualStep === TUTORIAL_STEPS.length - 1) {
      onComplete?.()
    } else {
      onComplete?.()
    }
  }, [actualStep, onComplete])

  const handleSkip = useCallback(() => {
    onSkip?.()
  }, [onSkip])

  if (tutorialCompleted || tutorialSkipped || isNavigating) return null

  if (!step || !showCard) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
      >
        <div className="bg-ink border-2 border-gold rounded-xl p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mb-4"
          >
            🎓
          </motion.div>
          <p className="font-mono text-cream">Loading tutorial...</p>
        </div>
      </motion.div>
    )
  }

  const isLeft = step.id === 4
  const cardWidth = 380
  const cardHeight = 280

  let cardLeft = isLeft ? 40 : window.innerWidth - cardWidth - 40
  let cardTop = Math.max(100, Math.min(
    (targetRect?.top || window.innerHeight / 2) + (targetRect?.height || 0) / 2 - cardHeight / 2,
    window.innerHeight - cardHeight - 100
  ))

  return (
    <>
      {/* Subtle overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-[100] pointer-events-none"
      />

      {/* Spotlight on target */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed z-[101] pointer-events-none"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px 5px rgba(200, 150, 58, 0.4)',
                '0 0 35px 10px rgba(200, 150, 58, 0.6)',
                '0 0 20px 5px rgba(200, 150, 58, 0.4)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full h-full border-2 border-gold rounded-lg"
          />
        </motion.div>
      )}

      {/* Tutorial card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[110] w-[380px]"
        style={{
          left: cardLeft,
          top: cardTop,
        }}
      >
        <div className="bg-ink border-2 border-gold rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold/20 to-rust/10 p-4 border-b border-gold/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                  className="text-2xl"
                >
                  🎓
                </motion.div>
                <span className="text-xs text-gold font-mono uppercase tracking-wider">
                  Tutorial
                </span>
              </div>
              <span className="text-xs text-muted font-mono">
                {actualStep + 1} / {TUTORIAL_STEPS.length}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-display text-xl text-cream mb-3">
              {step.title}
            </h3>
            <p className="font-mono text-sm text-cream/80 leading-relaxed mb-6">
              {step.message}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-5">
              {TUTORIAL_STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    width: i === actualStep ? 24 : 8,
                    backgroundColor: i <= actualStep ? '#C8963A' : '#4A4540',
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 text-muted font-mono text-sm hover:text-cream transition-colors"
              >
                Skip
              </button>
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 bg-gold text-stadium font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gold/90 transition-colors font-bold"
              >
                {actualStep === TUTORIAL_STEPS.length - 1 ? 'Finish 🎉' : 'Next →'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Arrow pointing to target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 5, 0] }}
            transition={{ delay: 0.5, duration: 1, repeat: Infinity }}
            className="absolute text-gold text-2xl"
            style={{
              left: isLeft ? '100%' : 'auto',
              right: isLeft ? 'auto' : '100%',
              top: '50%',
              transform: `translateY(-50%) ${isLeft ? 'rotate(0deg)' : 'rotate(180deg)'}`,
            }}
          >
            ◀
          </motion.div>
        )}
      </motion.div>

      {/* Celebration overlay */}
      {actualStep >= TUTORIAL_STEPS.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-ink border-2 border-gold rounded-2xl p-10 text-center"
          >
            <div className="text-8xl mb-6">🏆</div>
            <h2 className="font-display text-4xl text-gold mb-4">You're Ready, GM!</h2>
            <p className="font-mono text-cream/80 mb-6">
              Your journey to build a dynasty begins now!
            </p>
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gold text-stadium font-mono text-lg uppercase rounded-lg font-bold"
            >
              Start Your Dynasty! 🏀
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
