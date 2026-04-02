import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCinematic } from '../context/CinematicContext'
import { useTypewriter } from '../hooks/useTypewriter'

function ChampionshipScreen({ onComplete }) {
  const [phase, setPhase] = useState(0)
  const { displayed: teamName } = useTypewriter('CHICAGO BULLS', 80, phase >= 1 ? 200 : 9999)
  const { displayed: champions } = useTypewriter('CHAMPIONS', 80, phase >= 2 ? 1200 : 9999)
  const { displayed: manager } = useTypewriter('Championship #2 — Marcus Williams', 40, phase >= 3 ? 2400 : 9999)

  useEffect(() => {
    const phases = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => onComplete(), 6000),
    ]
    return () => phases.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="font-display text-gold/80 text-2xl tracking-widest mb-8">
          2026 · EASTERN CONFERENCE
        </p>
        
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="font-display text-cream text-7xl md:text-8xl uppercase"
        >
          {teamName}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          className="font-display text-gold text-5xl md:text-6xl uppercase mt-6"
        >
          {champions}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif italic text-rust text-xl mt-8"
        >
          {manager}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="h-0.5 bg-gold w-full mt-8 origin-left"
        />
      </motion.div>

      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 font-mono text-muted text-sm uppercase tracking-wider hover:text-cream transition-colors"
      >
        Skip [Space]
      </button>
    </div>
  )
}

function HallOfFameScreen({ data, onComplete }) {
  const { displayed } = useTypewriter(data?.quirk || '"A legend who defined an era."', 40, 1200)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-ink border border-gold/50 p-12 max-w-lg text-center gold-glow"
      >
        <div className="text-gold text-4xl mb-4">★</div>
        
        <h2 className="font-display text-gold text-5xl uppercase mb-2">
          {data?.playerName || 'Inducted Player'}
        </h2>
        
        <p className="font-serif italic text-parchment text-lg mt-4">
          {displayed}
          <span className="animate-pulse">|</span>
        </p>

        <div className="mt-6 pt-4 border-t border-muted/30">
          <p className="font-mono text-rust text-sm">
            Inducted Season {data?.season || '2026'}
          </p>
        </div>

        <button
          onClick={onComplete}
          className="mt-8 px-6 py-3 bg-gold text-stadium font-mono text-sm uppercase tracking-wider hover:bg-gold/90 transition-colors"
        >
          Confirm
        </button>
      </motion.div>
    </motion.div>
  )
}

function RecordBanner({ data, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gold/20 border border-gold px-8 py-4 gold-glow"
    >
      <p className="font-mono text-ember text-[11px] uppercase tracking-widest text-center">
        New Franchise Record
      </p>
      <p className="font-display text-cream text-xl text-center mt-1">
        {data?.recordName || 'Record Broken'} — {data?.newValue || '0'}
      </p>
      <p className="font-mono text-muted text-sm text-center line-through mt-1">
        Old: {data?.oldValue || '0'}
      </p>
    </motion.div>
  )
}

function AwardsReveal({ data, onComplete }) {
  const [currentAward, setCurrentAward] = useState(0)
  const awards = data?.awards || ['MVP', 'DPOY', 'MIP', 'ROY']
  const playerWon = data?.playerWon || []

  useEffect(() => {
    if (currentAward < awards.length - 1) {
      const timer = setTimeout(() => setCurrentAward(c => c + 1), 900)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(onComplete, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentAward, awards.length, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    >
      <div className="flex gap-4">
        {awards.map((award, index) => (
          <motion.div
            key={award}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ 
              rotateY: index <= currentAward ? 0 : 90,
              opacity: index <= currentAward ? 1 : 0
            }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className={`w-40 h-52 bg-ink border ${
              playerWon[index] ? 'border-ember' : 'border-muted/30'
            } p-4 flex flex-col items-center justify-center`}
          >
            <p className="font-mono text-gold text-xs uppercase tracking-wider">
              {award}
            </p>
            <p className="font-display text-cream text-lg mt-4 text-center">
              {data?.winners?.[index] || 'Player Name'}
            </p>
            {playerWon[index] && (
              <p className="font-mono text-ember text-xs mt-2">
                +75 Legacy pts
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default function CinematicOverlay() {
  const { activeCinematic, cinematicData, closeCinematic } = useCinematic()

  return (
    <AnimatePresence>
      {activeCinematic === 'championship' && (
        <ChampionshipScreen onComplete={closeCinematic} />
      )}
      
      {activeCinematic === 'hall-of-fame' && (
        <HallOfFameScreen data={cinematicData} onComplete={closeCinematic} />
      )}
      
      {activeCinematic === 'record' && (
        <RecordBanner data={cinematicData} onComplete={closeCinematic} />
      )}
      
      {activeCinematic === 'awards' && (
        <AwardsReveal data={cinematicData} onComplete={closeCinematic} />
      )}
    </AnimatePresence>
  )
}
