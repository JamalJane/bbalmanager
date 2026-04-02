import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const TUTORIAL_STEPS = [
  {
    id: 0,
    title: 'Welcome, GM!',
    message: 'Click this message to start learning how to play.',
    targetSelector: '[data-tutorial="inbox"]',
    tipTitle: 'Priority Inbox',
    tipText: 'This is where important news, trade offers, and updates appear.',
    navigateTo: null,
  },
  {
    id: 1,
    title: 'Meet Your Team',
    message: 'Let\'s check out your roster! Players are the heart of your franchise.',
    targetSelector: '[data-tutorial="player-row"]',
    tipTitle: 'Your Roster',
    tipText: 'OVR = Overall rating. Higher means better! Potential shows future growth ceiling.',
    navigateTo: '/roster',
  },
  {
    id: 2,
    title: 'Player Details',
    message: 'Click any player to see their full profile. Notice their attributes!',
    targetSelector: '[data-tutorial="player-detail"]',
    tipTitle: 'Player Card',
    tipText: 'Dev Pathway shows how players will grow. Focus on high potential players!',
    navigateTo: '/roster',
  },
  {
    id: 3,
    title: 'Time to Play!',
    message: 'Let\'s simulate your first game! Make key decisions during gameplay.',
    targetSelector: '[data-tutorial="play-button"]',
    tipTitle: 'Game Day',
    tipText: 'Click PLAY GAME to simulate. Make smart decisions to win!',
    navigateTo: '/game-day',
  },
  {
    id: 4,
    title: 'Build Your Dynasty',
    message: 'Trades are how you improve your team. Let\'s learn the trade market.',
    targetSelector: '[data-tutorial="new-trade"]',
    tipTitle: 'Trade Market',
    tipText: 'Swap players and draft picks to build a championship team.',
    navigateTo: '/trade-market',
  },
  {
    id: 5,
    title: 'Scouting Stars',
    message: 'The draft is where legends are born. Scout prospects for your future!',
    targetSelector: '[data-tutorial="scouts"]',
    tipTitle: 'Scouting',
    tipText: 'Assign scouts to learn about draft prospects. Better scouts = better intel!',
    navigateTo: '/scouting',
  },
]

export default function TutorialOverlay({ tutorialState, onComplete, onSkip }) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [arrowPosition, setArrowPosition] = useState({ x: 0, y: 0 })
  const [targetRect, setTargetRect] = useState(null)
  const [lineLength, setLineLength] = useState(0)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

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
      
      const mailElement = document.querySelector('[data-tutorial="inbox"]')
      if (mailElement) {
        const mailRect = mailElement.getBoundingClientRect()
        const startX = mailRect.right
        const startY = mailRect.top + mailRect.height / 2
        const endX = rect.left
        const endY = rect.top + rect.height / 2
        
        setArrowPosition({ x: startX, y: startY, endX, endY })
        
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
        animateLine(distance)
      }
    }
  }

  const animateLine = (totalLength) => {
    let progress = 0
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      progress = Math.min(elapsed / duration, 1)
      
      setLineLength(progress * totalLength)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  const handleNextStep = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    onComplete?.()
  }

  const handleSkip = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    onSkip?.()
  }

  if (!showOverlay || isCompleted || isSkipped) return null

  const step = TUTORIAL_STEPS[currentStep]
  if (!step) return null

  return (
    <>
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40 pointer-events-none"
      />

      {/* Drawing arrow line */}
      <svg
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C8963A" />
            <stop offset="100%" stopColor="#FF8C42" />
          </linearGradient>
          <filter id="arrowGlow">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated line */}
        <AnimatedLine
          startX={arrowPosition.x}
          startY={arrowPosition.y}
          endX={arrowPosition.endX}
          endY={arrowPosition.endY}
          progress={lineLength}
        />

        {/* Arrow head */}
        {lineLength > 50 && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              transformOrigin: `${arrowPosition.endX}px ${arrowPosition.endY}px`,
            }}
          >
            <polygon
              points={`${arrowPosition.endX},${arrowPosition.endY} ${arrowPosition.endX - 12},${arrowPosition.endY - 8} ${arrowPosition.endX - 12},${arrowPosition.endY + 8}`}
              fill="url(#arrowGradient)"
              filter="url(#arrowGlow)"
            />
          </motion.g>
        )}
      </svg>

      {/* Tutorial message box */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%]"
      >
        <div className="bg-ink border-2 border-gold rounded-xl p-6 shadow-2xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center text-gold text-xl">
              🎓
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl text-gold mb-1">
                {step.title}
              </h3>
              <p className="font-mono text-sm text-cream/80">
                {step.message}
              </p>
            </div>
          </div>
          
          {/* Tip box */}
          <div className="bg-stadium/50 rounded-lg p-4 mb-4 border border-gold/30">
            <p className="font-mono text-xs text-gold uppercase tracking-wider mb-1">
              {step.tipTitle}
            </p>
            <p className="font-mono text-sm text-cream/70">
              {step.tipText}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-muted font-mono text-sm hover:text-cream transition-colors"
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-2 bg-gold text-stadium font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gold/90 transition-colors"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish Tutorial' : 'Got It!'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function AnimatedLine({ startX, startY, endX, endY, progress }) {
  const dx = endX - startX
  const dy = endY - startY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const currentLength = Math.min(progress, distance)
  
  if (currentLength <= 0) return null

  const ratio = currentLength / distance
  const currentX = startX + dx * ratio
  const currentY = startY + dy * ratio

  return (
    <>
      {/* Glow effect */}
      <motion.line
        x1={startX}
        y1={startY}
        x2={currentX}
        y2={currentY}
        stroke="rgba(200, 150, 58, 0.3)"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#arrowGlow)"
      />
      {/* Main line */}
      <motion.line
        x1={startX}
        y1={startY}
        x2={currentX}
        y2={currentY}
        stroke="url(#arrowGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  )
}
