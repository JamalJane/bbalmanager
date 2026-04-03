import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const TUTORIAL_STEPS = [
  {
    id: 0,
    title: 'Welcome, GM!',
    message: 'Let\'s learn how to play Bashketbal! Click the tutorial message below to begin.',
    targetSelector: '[data-tutorial="inbox"]',
    tipTitle: 'Priority Inbox',
    tipText: 'This is where important news, trade offers, and updates appear. Click the highlighted message to continue.',
    navigateTo: null,
    requireClick: true,
  },
  {
    id: 1,
    title: 'Meet Your Team',
    message: 'Click "Got It!" to navigate to your roster and meet your players!',
    targetSelector: '[data-tutorial="player-row"]',
    tipTitle: 'Your Roster',
    tipText: 'OVR = Overall rating. Higher means better! Potential shows future growth ceiling.',
    navigateTo: '/roster',
    requireClick: true,
  },
  {
    id: 2,
    title: 'Player Details',
    message: 'Click any player row to see their full details!',
    targetSelector: '[data-tutorial="player-row"]',
    tipTitle: 'Player Card',
    tipText: 'Dev Pathway shows how players will grow. Focus on high potential players!',
    navigateTo: null,
    requireClick: true,
  },
  {
    id: 3,
    title: 'Time to Play!',
    message: 'Click "Got It!" to head to Game Day and play your first game!',
    targetSelector: '[data-tutorial="play-button"]',
    tipTitle: 'Game Day',
    tipText: 'Click PLAY GAME to simulate. Make smart decisions to win!',
    navigateTo: '/game-day',
    requireClick: false,
  },
  {
    id: 4,
    title: 'Build Your Dynasty',
    message: 'Click "Got It!" to visit the Trade Market!',
    targetSelector: '[data-tutorial="new-trade"]',
    tipTitle: 'Trade Market',
    tipText: 'Swap players and draft picks to build a championship team.',
    navigateTo: '/trade-market',
    requireClick: false,
  },
  {
    id: 5,
    title: 'Scouting Stars',
    message: 'Click "Got It!" to go to Scouting and scout your future stars!',
    targetSelector: '[data-tutorial="scouts"]',
    tipTitle: 'Scouting',
    tipText: 'Assign scouts to learn about draft prospects. Better scouts = better intel!',
    navigateTo: '/scouting',
    requireClick: false,
  },
]

export default function TutorialOverlay({ tutorialState, onComplete, onSkip }) {
  const navigate = useNavigate()
  const [showOverlay, setShowOverlay] = useState(false)
  const [targetRect, setTargetRect] = useState(null)
  const [stepReady, setStepReady] = useState(false)
  const overlayRef = useRef(null)

  const currentStep = tutorialState?.currentStep ?? 0
  const isCompleted = tutorialState?.completed || false
  const isSkipped = tutorialState?.skipped || false

  useEffect(() => {
    if (isCompleted || isSkipped) {
      setShowOverlay(false)
      return
    }

    if (currentStep >= TUTORIAL_STEPS.length) {
      onComplete?.()
      return
    }

    setStepReady(false)
    const timer = setTimeout(() => {
      setShowOverlay(true)
      updateTargetPosition()
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentStep, isCompleted, isSkipped])

  const updateTargetPosition = () => {
    const step = TUTORIAL_STEPS[currentStep]
    if (!step) return

    const element = document.querySelector(step.targetSelector)
    if (element) {
      const rect = element.getBoundingClientRect()
      setTargetRect(rect)
      setStepReady(true)
    } else {
      setStepReady(false)
    }
  }

  const handleNextStep = useCallback(() => {
    const step = TUTORIAL_STEPS[currentStep]
    if (step?.navigateTo) {
      navigate(step.navigateTo)
      setTimeout(() => {
        onComplete?.()
      }, 800)
    } else {
      onComplete?.()
    }
  }, [currentStep, navigate, onComplete])

  const handleSkip = useCallback(() => {
    onSkip?.()
  }, [onSkip])

  if (!showOverlay || isCompleted || isSkipped) return null

  const step = TUTORIAL_STEPS[currentStep]
  if (!step) return null

  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  return (
    <>
      {/* Full blocking overlay with cutout for target */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-40"
        style={{
          background: targetRect 
            ? `radial-gradient(
                circle at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, 
                transparent ${Math.max(targetRect.width, targetRect.height) + 80}px, 
                rgba(0,0,0,0.75) ${Math.max(targetRect.width, targetRect.height) + 100}px
              )`
            : 'rgba(0,0,0,0.75)',
          pointerEvents: 'none',
        }}
      />

      {/* Pulsing border around target */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            opacity: { duration: 1.5, repeat: Infinity },
            scale: { duration: 1.5, repeat: Infinity },
          }}
          className="fixed z-50 border-4 border-gold rounded-lg pointer-events-none"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 20px rgba(200, 150, 58, 0.5), inset 0 0 20px rgba(200, 150, 58, 0.2)',
          }}
        />
      )}

      {/* Tutorial message box */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] max-w-lg w-[92%]"
      >
        <div className="bg-ink border-2 border-gold rounded-xl p-6 shadow-2xl">
          <div className="flex items-start gap-4 mb-4">
            <motion.div 
              className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center text-gold text-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎓
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-xl text-gold">
                  {step.title}
                </h3>
                <span className="text-xs text-muted font-mono">
                  {currentStep + 1}/{TUTORIAL_STEPS.length}
                </span>
              </div>
              <p className="font-mono text-sm text-cream/80">
                {step.message}
              </p>
            </div>
          </div>
          
          {/* Tip box */}
          <div className="bg-stadium/60 rounded-lg p-4 mb-5 border border-gold/30">
            <p className="font-mono text-xs text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>💡</span> {step.tipTitle}
            </p>
            <p className="font-mono text-sm text-cream/70">
              {step.tipText}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep 
                    ? 'w-6 bg-gold' 
                    : i < currentStep 
                      ? 'w-2 bg-gold/50' 
                      : 'w-2 bg-muted/40'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2.5 text-muted font-mono text-sm hover:text-cream transition-colors border border-muted/30 rounded hover:border-muted/60"
            >
              Skip Tutorial
            </button>
            <motion.button
              onClick={handleNextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 bg-gold text-stadium font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gold/90 transition-colors font-bold"
            >
              {isLastStep ? '🎉 Finish Tutorial!' : 'Got It! →'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Floating instruction arrow pointing to target */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed z-[55] pointer-events-none"
          style={{
            left: targetRect.left + targetRect.width + 20,
            top: targetRect.top + targetRect.height / 2,
            transform: 'translateY(-50%)',
          }}
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-2"
          >
            <span className="text-gold font-mono text-sm bg-ink/90 px-2 py-1 rounded border border-gold/50">
              Click here
            </span>
            <span className="text-2xl">👈</span>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
