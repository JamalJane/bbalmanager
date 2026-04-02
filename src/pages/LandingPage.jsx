import React, { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const FloatingBall = ({ delay, x, y, size, duration }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
    }}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{ 
      opacity: [0, 0.6, 0.4, 0.6, 0],
      scale: [0, 1, 0.8, 1.2, 0],
      rotate: [0, 180, 360],
      y: [0, -100, -200, -100, 0]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-glow">
      <defs>
        <radialGradient id="ballGrad" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#B85C2A" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#ballGrad)" />
      <path d="M50 2 Q50 50 50 98" stroke="#1A1A18" strokeWidth="2" fill="none" />
      <path d="M2 50 Q50 50 98 50" stroke="#1A1A18" strokeWidth="2" fill="none" />
      <path d="M15 20 Q50 35 85 20" stroke="#1A1A18" strokeWidth="2" fill="none" />
      <path d="M15 80 Q50 65 85 80" stroke="#1A1A18" strokeWidth="2" fill="none" />
    </svg>
  </motion.div>
)

const Court3D = () => {
  return (
    <div className="court-container">
      <div className="court">
        <div className="court-line half-court" />
        <div className="court-line center-circle" />
        <div className="court-line three-point-left" />
        <div className="court-line three-point-right" />
        <div className="court-line key-left" />
        <div className="court-line key-right" />
        <div className="hoop left">
          <div className="hoop-ring" />
          <div className="hoop-net" />
        </div>
        <div className="hoop right">
          <div className="hoop-ring" />
          <div className="hoop-net" />
        </div>
      </div>
      
      <style>{`
        .court-container {
          perspective: 1200px;
          perspective-origin: center center;
        }
        
        .court {
          position: relative;
          width: 600px;
          height: 300px;
          transform: rotateX(65deg) rotateZ(-5deg);
          transform-style: preserve-3d;
          background: linear-gradient(180deg, #1A1A18 0%, #2A2A28 100%);
          border: 3px solid #C8963A;
          box-shadow: 
            0 0 60px rgba(200, 150, 58, 0.3),
            inset 0 0 100px rgba(0,0,0,0.5);
        }
        
        .court-line {
          position: absolute;
          border: 2px solid rgba(200, 150, 58, 0.5);
        }
        
        .half-court {
          width: 2px;
          height: 100%;
          left: 50%;
          background: rgba(200, 150, 58, 0.5);
        }
        
        .center-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          left: calc(50% - 40px);
          top: calc(50% - 40px);
          background: transparent;
        }
        
        .three-point-left {
          width: 150px;
          height: 200px;
          border-radius: 0 0 150px 150px;
          left: 0;
          top: 50px;
          border-left: none;
          border-top: none;
        }
        
        .three-point-right {
          width: 150px;
          height: 200px;
          border-radius: 0 0 150px 150px;
          right: 0;
          top: 50px;
          border-right: none;
          border-top: none;
        }
        
        .key-left {
          width: 120px;
          height: 160px;
          left: 40px;
          top: 70px;
          border-radius: 0 0 60px 60px;
          border-left: none;
          border-top: none;
        }
        
        .key-right {
          width: 120px;
          height: 160px;
          right: 40px;
          top: 70px;
          border-radius: 0 0 60px 60px;
          border-right: none;
          border-top: none;
        }
        
        .hoop {
          position: absolute;
          bottom: 40px;
          width: 40px;
          height: 40px;
        }
        
        .hoop.left { left: 30px; }
        .hoop.right { right: 30px; }
        
        .hoop-ring {
          width: 40px;
          height: 40px;
          border: 4px solid #E8593C;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(232, 89, 60, 0.5);
          animation: hoopGlow 2s ease-in-out infinite;
        }
        
        .hoop-net {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 40px;
          background: repeating-linear-gradient(
            180deg,
            transparent 0px,
            transparent 3px,
            rgba(255,255,255,0.3) 3px,
            rgba(255,255,255,0.3) 4px
          );
          clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%);
        }
        
        @keyframes hoopGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(232, 89, 60, 0.5); }
          50% { box-shadow: 0 0 40px rgba(232, 89, 60, 0.8), 0 0 60px rgba(232, 89, 60, 0.4); }
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(255, 140, 66, 0.6));
        }
      `}</style>
    </div>
  )
}

const ParticleField = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute bg-gold rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [-20, -200, -400],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

const StatsCounter = ({ value, label, delay }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const end = parseInt(value)
    const duration = 1500
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="font-display text-5xl md:text-6xl text-gold mb-2">
        {count}+
      </div>
      <div className="font-mono text-sm text-cream/60 uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll()
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('hardwood_gm')
    setHasSavedGame(!!saved)
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  const handleStartGame = () => {
    if (hasSavedGame) {
      navigate('/')
    } else {
      navigate('/new-game')
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-stadium">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-stadium via-ink to-stadium" />
      
      {/* Particle Effects */}
      <ParticleField />
      
      {/* Floating Basketballs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingBall
            key={i}
            delay={i * 0.5}
            x={10 + (i * 12)}
            y={20 + (i % 3) * 25}
            size={30 + (i % 3) * 10}
            duration={8 + (i % 4)}
          />
        ))}
      </div>

      {/* Hero Content */}
      <motion.div 
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
        style={{ y, opacity }}
      >
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-gold/20 via-rust/20 to-gold/20 blur-2xl rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <radialGradient id="heroBallGrad" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#FF8C42" />
                    <stop offset="50%" stopColor="#B85C2A" />
                    <stop offset="100%" stopColor="#8B4513" />
                  </radialGradient>
                  <filter id="ballShadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
                  </filter>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#heroBallGrad)" filter="url(#ballShadow)" />
                <path d="M50 4 Q50 50 50 96" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
                <path d="M4 50 Q50 50 96 50" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
                <path d="M18 22 Q50 38 82 22" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
                <path d="M18 78 Q50 62 82 78" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream tracking-tight mb-2">
            <span className="block">HARDWOOD</span>
            <motion.span 
              className="block text-gold"
              initial={{ backgroundPosition: '200% center' }}
              animate={{ backgroundPosition: '0% center' }}
              transition={{ duration: 1.5, delay: 0.8 }}
              style={{
                background: 'linear-gradient(90deg, #C8963A 0%, #FF8C42 50%, #C8963A 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              MANAGER
            </motion.span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-serif text-lg md:text-xl text-cream/70 italic mb-12 text-center max-w-md"
        >
          Where legends are built, dynasties are born, and every decision shapes the future
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            onClick={handleStartGame}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(200, 150, 58, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-4 bg-gradient-to-r from-gold to-rust text-stadium font-mono text-lg uppercase tracking-wider rounded-lg relative overflow-hidden group"
          >
            <span className="relative z-10">{hasSavedGame ? 'Continue Career' : 'New Game'}</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-rust to-gold"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-4 border-2 border-gold/50 text-gold font-mono text-lg uppercase tracking-wider rounded-lg hover:bg-gold/10 transition-colors"
          >
            <Link to="/new-game" className="relative z-10">How to Play</Link>
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-muted text-xs font-mono uppercase tracking-widest">Scroll</span>
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 3D Court Section */}
      <motion.section 
        className="relative z-10 py-32 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <motion.div
            className="absolute -inset-20 bg-gradient-to-t from-gold/10 via-transparent to-transparent blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <Court3D />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 font-serif text-2xl text-cream/60 italic"
        >
          "The court is where legends are made"
        </motion.p>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl text-cream text-center mb-20"
          >
            Your Legacy Awaits
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-ink/50 border border-gold/20 hover:border-gold/40 transition-colors group"
            >
              <motion.div
                className="text-6xl mb-6"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                🏀
              </motion.div>
              <h3 className="font-display text-2xl text-gold mb-4">24-Game Seasons</h3>
              <p className="font-mono text-sm text-cream/60 leading-relaxed">
                Compete in intense seasons with playoff drama, trade deadlines, and championship glory.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-ink/50 border border-gold/20 hover:border-gold/40 transition-colors group"
            >
              <motion.div
                className="text-6xl mb-6"
                whileHover={{ scale: 1.2, rotate: -10 }}
              >
                📈
              </motion.div>
              <h3 className="font-display text-2xl text-gold mb-4">Player Development</h3>
              <p className="font-mono text-sm text-cream/60 leading-relaxed">
                Watch your players grow through 8 unique pathways. Shape raw talent into superstars.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-ink/50 border border-gold/20 hover:border-gold/40 transition-colors group"
            >
              <motion.div
                className="text-6xl mb-6"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                🏆
              </motion.div>
              <h3 className="font-display text-2xl text-gold mb-4">Build Your Dynasty</h3>
              <p className="font-mono text-sm text-cream/60 leading-relaxed">
                Legacy points, Hall of Fame, championship rings. Your decisions write the story.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-32 px-4 bg-gradient-to-b from-stadium via-ink to-stadium">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <StatsCounter value="30" label="Franchises" delay={0} />
            <StatsCounter value="24" label="Games Per Season" delay={0.1} />
            <StatsCounter value="8" label="Dev Pathways" delay={0.2} />
            <StatsCounter value="79" label="Player Personas" delay={0.3} />
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-32 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-6">
            Ready to Make History?
          </h2>
          <p className="font-serif text-xl text-cream/60 italic mb-12">
            Every dynasty starts with a single decision.
          </p>
          <motion.button
            onClick={handleStartGame}
            whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(200, 150, 58, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            className="px-16 py-5 bg-gradient-to-r from-gold to-rust text-stadium font-mono text-xl uppercase tracking-widest rounded-lg"
          >
            {hasSavedGame ? 'Continue Your Legacy' : 'Start Your Journey'}
          </motion.button>
        </motion.div>
      </section>

      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rust/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  )
}
