import React, { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

const BasketballSVG = ({ size = 40, className = "" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
    <defs>
      <radialGradient id="ballGradient" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#FF8C42" />
        <stop offset="70%" stopColor="#B85C2A" />
        <stop offset="100%" stopColor="#8B4513" />
      </radialGradient>
      <filter id="ballGlow">
        <feGaussianBlur stdDeviation="2" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#ballGradient)" filter="url(#ballGlow)" />
    <path d="M50 4 Q50 50 50 96" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
    <path d="M4 50 Q50 50 96 50" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
    <path d="M18 22 Q50 38 82 22" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
    <path d="M18 78 Q50 62 82 78" stroke="#1A1A18" strokeWidth="2.5" fill="none" />
  </svg>
)

const Court3D = () => {
  return (
    <div className="court-wrapper">
      {/* Main 3D Court */}
      <div className="court-container">
        <div className="court">
          {/* Court Floor */}
          <div className="court-floor" />
          
          {/* Court Lines - Top Half */}
          <div className="three-point-top" />
          <div className="key-top" />
          <div className="free-throw-circle-top" />
          <div className="backboard-top" />
          
          {/* Court Lines - Bottom Half */}
          <div className="three-point-bottom" />
          <div className="key-bottom" />
          <div className="free-throw-circle-bottom" />
          <div className="backboard-bottom" />
          
          {/* Center Circle */}
          <div className="center-circle" />
          <div className="center-dot" />
          
          {/* Half Court Line */}
          <div className="half-court-line" />
          
          {/* Top Hoop */}
          <div className="hoop-top">
            <motion.div 
              className="hoop-ring-top"
              animate={{ 
                boxShadow: [
                  '0 0 15px rgba(232, 89, 60, 0.6), 0 0 30px rgba(232, 89, 60, 0.3)',
                  '0 0 30px rgba(232, 89, 60, 0.9), 0 0 50px rgba(232, 89, 60, 0.5)',
                  '0 0 15px rgba(232, 89, 60, 0.6), 0 0 30px rgba(232, 89, 60, 0.3)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="hoop-net-top" />
          </div>
          
          {/* Bottom Hoop */}
          <div className="hoop-bottom">
            <motion.div 
              className="hoop-ring-bottom"
              animate={{ 
                boxShadow: [
                  '0 0 15px rgba(232, 89, 60, 0.6), 0 0 30px rgba(232, 89, 60, 0.3)',
                  '0 0 30px rgba(232, 89, 60, 0.9), 0 0 50px rgba(232, 89, 60, 0.5)',
                  '0 0 15px rgba(232, 89, 60, 0.6), 0 0 30px rgba(232, 89, 60, 0.3)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <div className="hoop-net-bottom" />
          </div>
          
          {/* Animated Basketball Shot */}
          <motion.div 
            className="shot-ball"
            initial={{ x: -50, y: 350, rotate: 0, opacity: 1 }}
            animate={{ 
              x: [null, 180, 250],
              y: [null, 100, 220],
              rotate: [0, 360, 720],
            }}
            transition={{ 
              duration: 1.5, 
              times: [0, 0.5, 1],
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <BasketballSVG size={30} />
          </motion.div>
          
          {/* Ball Swish Effect */}
          <motion.div
            className="swish-effect"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1] }}
            transition={{ duration: 0.8, delay: 1.4, repeat: Infinity, repeatDelay: 2 }}
          >
            SWISH!
          </motion.div>
          
          {/* Score Flash */}
          <motion.div
            className="score-flash"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-10, -20, -30] }}
            transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            +2
          </motion.div>
          
          {/* Player silhouettes */}
          <motion.div className="player player-offense" animate={{ x: [0, 20, 0] }} transition={{ duration: 4, repeat: Infinity }} />
          <motion.div className="player player-defense" animate={{ x: [0, -15, 0] }} transition={{ duration: 3.5, repeat: Infinity }} />
          <motion.div className="player player-wing" animate={{ y: [180, 160, 180] }} transition={{ duration: 2, repeat: Infinity }} />
          
          {/* Ambient particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="court-particle"
              style={{
                left: `${15 + (i * 7)}%`,
                top: `${20 + (i % 4) * 20}%`,
              }}
              animate={{
                opacity: [0, 0.7, 0],
                y: [0, -40, -80],
                x: [0, 10, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
        
        {/* Court Shadow */}
        <div className="court-shadow" />
      </div>
      
      <style>{`
        .court-wrapper {
          position: relative;
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          perspective: 1000px;
        }
        
        .court-container {
          position: relative;
          width: 100%;
          transform-style: preserve-3d;
          animation: courtFloat 6s ease-in-out infinite;
        }
        
        @keyframes courtFloat {
          0%, 100% { transform: translateY(0) rotateX(55deg); }
          50% { transform: translateY(-15px) rotateX(55deg); }
        }
        
        .court {
          position: relative;
          width: 100%;
          height: 400px;
          background: linear-gradient(180deg, #2A2520 0%, #3A3530 30%, #2A2520 70%, #1A1510 100%);
          border: 4px solid #C8963A;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 
            0 0 60px rgba(200, 150, 58, 0.4),
            0 0 100px rgba(200, 150, 58, 0.2),
            inset 0 0 80px rgba(0,0,0,0.5);
        }
        
        .court-floor {
          position: absolute;
          inset: 0;
          background: 
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 38px,
              rgba(200, 150, 58, 0.08) 38px,
              rgba(200, 150, 58, 0.08) 40px
            ),
            linear-gradient(180deg, rgba(60, 55, 50, 0.3) 0%, rgba(40, 35, 30, 0.5) 100%);
        }
        
        .court-shadow {
          position: absolute;
          bottom: -60px;
          left: 10%;
          width: 80%;
          height: 60px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%);
          filter: blur(20px);
          transform: scaleY(-0.3);
        }
        
        /* Top Court Lines */
        .three-point-top {
          position: absolute;
          top: 0;
          left: 5%;
          width: 90%;
          height: 120px;
          border-bottom: 3px solid rgba(200, 150, 58, 0.7);
          border-radius: 0 0 50% 50%;
        }
        
        .key-top {
          position: absolute;
          top: 0;
          left: 30%;
          width: 40%;
          height: 80px;
          border-bottom: 3px solid rgba(200, 150, 58, 0.7);
          border-left: 3px solid rgba(200, 150, 58, 0.7);
          border-right: 3px solid rgba(200, 150, 58, 0.7);
        }
        
        .free-throw-circle-top {
          position: absolute;
          top: 75px;
          left: 38%;
          width: 24%;
          height: 40px;
          border: 3px solid rgba(200, 150, 58, 0.5);
          border-radius: 50%;
          background: transparent;
        }
        
        .backboard-top {
          position: absolute;
          top: 15px;
          left: 35%;
          width: 30%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.4);
        }
        
        /* Bottom Court Lines */
        .three-point-bottom {
          position: absolute;
          bottom: 0;
          left: 5%;
          width: 90%;
          height: 120px;
          border-top: 3px solid rgba(200, 150, 58, 0.7);
          border-radius: 50% 50% 0 0;
        }
        
        .key-bottom {
          position: absolute;
          bottom: 0;
          left: 30%;
          width: 40%;
          height: 80px;
          border-top: 3px solid rgba(200, 150, 58, 0.7);
          border-left: 3px solid rgba(200, 150, 58, 0.7);
          border-right: 3px solid rgba(200, 150, 58, 0.7);
        }
        
        .free-throw-circle-bottom {
          position: absolute;
          bottom: 75px;
          left: 38%;
          width: 24%;
          height: 40px;
          border: 3px solid rgba(200, 150, 58, 0.5);
          border-radius: 50%;
          background: transparent;
        }
        
        .backboard-bottom {
          position: absolute;
          bottom: 15px;
          left: 35%;
          width: 30%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.4);
        }
        
        /* Center Circle */
        .center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          border: 3px solid rgba(200, 150, 58, 0.7);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        
        .center-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          background: #C8963A;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        
        .half-court-line {
          position: absolute;
          top: 0;
          left: 50%;
          width: 3px;
          height: 100%;
          background: rgba(200, 150, 58, 0.6);
          transform: translateX(-50%);
        }
        
        /* Top Hoop */
        .hoop-top {
          position: absolute;
          top: 35px;
          left: 47%;
          transform: translateX(-50%);
        }
        
        .hoop-ring-top {
          width: 45px;
          height: 45px;
          border: 5px solid #E8593C;
          border-radius: 50%;
          position: relative;
        }
        
        .hoop-net-top {
          position: absolute;
          bottom: -45px;
          left: 50%;
          transform: translateX(-50%);
          width: 38px;
          height: 50px;
          background: repeating-linear-gradient(
            180deg,
            transparent 0px,
            transparent 4px,
            rgba(255,255,255,0.35) 4px,
            rgba(255,255,255,0.35) 5px
          );
          clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%);
          animation: netSwayTop 1.5s ease-in-out infinite;
        }
        
        @keyframes netSwayTop {
          0%, 100% { transform: translateX(-50%) skewX(0deg); }
          50% { transform: translateX(-50%) skewX(4deg); }
        }
        
        /* Bottom Hoop */
        .hoop-bottom {
          position: absolute;
          bottom: 35px;
          left: 47%;
          transform: translateX(-50%);
        }
        
        .hoop-ring-bottom {
          width: 45px;
          height: 45px;
          border: 5px solid #E8593C;
          border-radius: 50%;
          position: relative;
        }
        
        .hoop-net-bottom {
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          width: 38px;
          height: 50px;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 4px,
            rgba(255,255,255,0.35) 4px,
            rgba(255,255,255,0.35) 5px
          );
          clip-path: polygon(15% 0, 85% 0, 100% 100%, 0 100%);
          animation: netSwayBottom 1.5s ease-in-out infinite;
        }
        
        @keyframes netSwayBottom {
          0%, 100% { transform: translateX(-50%) skewX(0deg); }
          50% { transform: translateX(-50%) skewX(-4deg); }
        }
        
        /* Shot Animation */
        .shot-ball {
          position: absolute;
          z-index: 10;
          filter: drop-shadow(0 0 15px rgba(255, 140, 66, 0.8));
        }
        
        /* Swish Effect */
        .swish-effect {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: bold;
          color: #C8963A;
          text-shadow: 0 0 15px rgba(200, 150, 58, 0.9);
          z-index: 20;
        }
        
        /* Score Flash */
        .score-flash {
          position: absolute;
          top: 100px;
          right: 15%;
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: bold;
          color: #E8593C;
          text-shadow: 0 0 20px rgba(232, 89, 60, 0.8);
          z-index: 20;
        }
        
        /* Players */
        .player {
          position: absolute;
          width: 18px;
          height: 45px;
          background: linear-gradient(180deg, rgba(200, 150, 58, 0.4) 0%, transparent 100%);
          border-radius: 9px 9px 4px 4px;
        }
        
        .player-offense { bottom: 140px; left: 20%; }
        .player-defense { bottom: 140px; right: 20%; }
        .player-wing { bottom: 200px; left: 50%; transform: translateX(-50%); }
        
        /* Particles */
        .court-particle {
          position: absolute;
          background: #C8963A;
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

const FloatingBall = ({ delay, x, y, size, duration }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.7, 0.5, 0],
      scale: [0, 1, 0.8, 0],
      rotate: [0, 180, 360],
      y: [0, -100, -200]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <BasketballSVG size={size} />
  </motion.div>
)

const ParticleField = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 8,
    delay: Math.random() * 8
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
            opacity: [0, 0.6, 0],
            y: [-20, -150, -300],
            x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30]
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

  useEffect(() => {
    const saved = localStorage.getItem('hardwood_gm')
    setHasSavedGame(!!saved)
  }, [])

  const handleStartGame = () => {
    if (hasSavedGame) {
      navigate('/dashboard')
    } else {
      navigate('/new-game')
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-stadium">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stadium via-ink to-stadium" />
      
      {/* Particles */}
      <ParticleField />
      
      {/* Floating Basketballs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <FloatingBall
            key={i}
            delay={i * 0.8}
            x={8 + (i * 15)}
            y={15 + (i % 3) * 20}
            size={25 + (i % 2) * 15}
            duration={6 + (i % 3)}
          />
        ))}
      </div>

      {/* Hero Content */}
      <motion.div 
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
        style={{ y, opacity }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              className="absolute -inset-6 bg-gradient-to-r from-gold/20 via-rust/20 to-gold/20 blur-3xl rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <BasketballSVG size={140} className="relative z-10" />
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
              className="block"
              style={{
                background: 'linear-gradient(90deg, #C8963A 0%, #FF8C42 50%, #C8963A 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{ backgroundPosition: ['200% center', '0% center'] }}
              transition={{ duration: 2, delay: 0.8 }}
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
            className="px-10 py-4 bg-gradient-to-r from-gold to-rust text-stadium font-mono text-lg uppercase tracking-wider rounded-lg"
          >
            {hasSavedGame ? 'Continue Career' : 'New Game'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-4 border-2 border-gold/50 text-gold font-mono text-lg uppercase tracking-wider rounded-lg hover:bg-gold/10 transition-colors"
          >
            <Link to="/new-game">How to Play</Link>
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
        className="relative z-10 py-32 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-gold/10 via-transparent to-transparent blur-3xl"
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
            className="mt-16 text-center font-serif text-2xl text-cream/60 italic"
          >
            "The court is where legends are made"
          </motion.p>
        </div>
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
            {[
              { icon: '🏀', title: '24-Game Seasons', desc: 'Compete in intense seasons with playoff drama, trade deadlines, and championship glory.' },
              { icon: '📈', title: 'Player Development', desc: 'Watch your players grow through 8 unique pathways. Shape raw talent into superstars.' },
              { icon: '🏆', title: 'Build Your Dynasty', desc: 'Legacy points, Hall of Fame, championship rings. Your decisions write the story.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl bg-ink/50 border border-gold/20 hover:border-gold/40 transition-colors"
              >
                <motion.div
                  className="text-6xl mb-6"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-display text-2xl text-gold mb-4">{feature.title}</h3>
                <p className="font-mono text-sm text-cream/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
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

      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rust/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  )
}
