import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const TUTORIAL_STEPS = [
  {
    id: 0,
    title: 'Welcome, GM!',
    message: 'Welcome to Bashketbal! Let me show you around. This is your Priority Inbox - all important news, trades, and updates appear here.',
    targetSelector: '[data-tutorial="inbox"]',
    position: 'right',
  },
  {
    id: 1,
    title: 'Your Roster',
    message: 'Here\'s your team roster. OVR shows player overall rating. Potential indicates future growth ceiling.',
    targetSelector: '[data-tutorial="player-row"]',
    position: 'right',
  },
  {
    id: 2,
    title: 'Play Games',
    message: 'When ready, head to Game Day to play. Make smart decisions during games to win!',
    targetSelector: '[data-tutorial="play-button"]',
    position: 'right',
  },
  {
    id: 3,
    title: 'Trade Market',
    message: 'Improve your team through trades. Swap players and draft picks to build a championship roster.',
    targetSelector: '[data-tutorial="new-trade"]',
    position: 'right',
  },
  {
    id: 4,
    title: 'Scouting',
    message: 'Scout draft prospects to learn about future stars. Assign scouts to reveal their skills!',
    targetSelector: '[data-tutorial="scouts"]',
    position: 'left',
  },
]

export default function TutorialOverlay({ tutorialState, onComplete, onSkip }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const tutorialCompleted = tutorialState?.completed || false
  const tutorialSkipped = tutorialState?.skipped || false
  const actualStep = tutorialState?.currentStep ?? 0

  useEffect(() => {
    if (tutorialCompleted || tutorialSkipped) {
      setShowCelebration(false)
      return
    }

    if (actualStep >= TUTORIAL_STEPS.length) {
      setShowCelebration(true)
      return
    }

    setCurrentStep(actualStep)
    updateTargetPosition()
  }, [actualStep, tutorialCompleted, tutorialSkipped])

  const updateTargetPosition = () => {
    const step = TUTORIAL_STEPS[currentStep]
    if (!step) return

    const element = document.querySelector(step.targetSelector)
    if (element) {
      const rect = element.getBoundingClientRect()
      setTargetRect(rect)
    }
  }

  const handleNext = useCallback(() => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      setShowCelebration(true)
    } else {
      const step = TUTORIAL_STEPS[currentStep + 1]
      if (step?.navigateTo) {
        navigate(step.navigateTo)
        setTimeout(() => {
          onComplete?.()
        }, 600)
      } else {
        onComplete?.()
      }
    }
  }, [currentStep, navigate, onComplete])

  const handleFinishTutorial = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  const handleSkip = useCallback(() => {
    onSkip?.()
  }, [onSkip])

  if (tutorialCompleted || tutorialSkipped) return null

  if (showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-ink border-2 border-gold rounded-2xl p-10 max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 10 }}
            className="text-8xl mb-6"
          >
            🏆
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-4xl text-gold mb-4"
          >
            You're Ready, GM!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-mono text-cream/80 mb-8"
          >
            You've completed the tutorial! Your journey to build a dynasty begins now.
            Good luck, and remember - every championship starts with a single decision!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={handleFinishTutorial}
              className="w-full py-4 bg-gold text-stadium font-mono text-lg uppercase tracking-wider rounded-lg hover:bg-gold/90 transition-colors font-bold"
            >
              Start Your Dynasty! 🏀
            </button>
            <p className="text-xs text-muted font-mono">
              You can always replay the tutorial from the dashboard.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  const step = TUTORIAL_STEPS[currentStep]
  if (!step || !targetRect) return null

  const isLeft = step.position === 'left'
  const cardWidth = 380
  const cardHeight = 320

  let cardLeft, cardTop
  if (isLeft) {
    cardLeft = targetRect.left - cardWidth - 30
    if (cardLeft < 20) cardLeft = targetRect.right + 30
  } else {
    cardLeft = targetRect.right + 30
    if (cardLeft + cardWidth > window.innerWidth - 20) {
      cardLeft = targetRect.left - cardWidth - 30
    }
  }

  cardTop = Math.max(20, Math.min(
    targetRect.top + targetRect.height / 2 - cardHeight / 2,
    window.innerHeight - cardHeight - 20
  ))

  return (
    <>
      {/* Subtle spotlight on target */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed z-40 pointer-events-none"
        style={{
          left: targetRect.left - 12,
          top: targetRect.top - 12,
          width: targetRect.width + 24,
          height: targetRect.height + 24,
        }}
      >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px 5px rgba(200, 150, 58, 0.3)',
              '0 0 30px 10px rgba(200, 150, 58, 0.5)',
              '0 0 20px 5px rgba(200, 150, 58, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-full h-full border-2 border-gold rounded-lg"
        />
      </motion.div>

      {/* Connector line */}
      <svg className="fixed inset-0 z-40 pointer-events-none" style={{ overflow: 'visible' }}>
        <motion.line
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          x1={isLeft ? cardLeft + cardWidth : cardLeft}
          y1={cardTop + 80}
          x2={targetRect.left - 20}
          y2={targetRect.top + targetRect.height / 2}
          stroke="#C8963A"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <circle
          cx={targetRect.left - 20}
          cy={targetRect.top + targetRect.height / 2}
          r="6"
          fill="#C8963A"
        />
      </svg>

      {/* Tutorial card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: isLeft ? -20 : 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed z-[60] w-[380px]"
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
                {currentStep + 1} / {TUTORIAL_STEPS.length}
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
                    width: i === currentStep ? 24 : 8,
                    backgroundColor: i <= currentStep ? '#C8963A' : '#4A4540',
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
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish 🎉' : 'Next →'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Arrow pointing to target */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, 5, 0] }}
          transition={{ delay: 0.5, duration: 1, repeat: Infinity }}
          className="absolute top-1/2 -translate-y-1/2 text-gold text-2xl"
          style={{ 
            left: isLeft ? '100%' : 'auto', 
            right: isLeft ? 'auto' : '100%',
            transform: 'translateY(-50%) rotate(180deg)'
          }}
        >
          ◀
        </motion.div>
      </motion.div>
    </>
  )
}
