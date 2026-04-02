import React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

export default function HowToPlay() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stadium py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-5xl text-gold mb-4">HOW TO PLAY</h1>
          <p className="font-serif text-xl text-cream/70 italic">
            Your guide to becoming a championship GM
          </p>
        </motion.div>

        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-mono text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Sections */}
        <div className="space-y-12">
          {/* Getting Started */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-ink rounded-xl p-8 border border-gold/20"
          >
            <h2 className="font-display text-2xl text-cream mb-6 flex items-center gap-3">
              <span className="text-gold">01</span>
              Getting Started
            </h2>
            <div className="space-y-4 text-cream/80 font-mono text-sm leading-relaxed">
              <p>Welcome to Bashketbal! You're about to take control of a professional basketball franchise.</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Choose your GM name and management style</li>
                <li>Select from 30 unique franchises across the league</li>
                <li>Review your official appointment memorandum</li>
                <li>Accept your position and begin your career</li>
              </ol>
            </div>
          </motion.section>

          {/* Management Styles */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-ink rounded-xl p-8 border border-gold/20"
          >
            <h2 className="font-display text-2xl text-cream mb-6 flex items-center gap-3">
              <span className="text-gold">02</span>
              Management Styles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '🏆', name: 'Win Now', desc: 'Go all-in on championships. Veterans over youth.' },
                { icon: '🔨', name: 'The Rebuild', desc: 'Tear it down, build it up. Acquire picks, develop talent.' },
                { icon: '🌱', name: 'Player Developer', desc: 'Focus on growth and potential. Turn raw talent into stars.' },
                { icon: '🤝', name: 'The Loyalist', desc: 'Keep your core together. Build around homegrown talent.' },
                { icon: '⚡', name: 'The Mercenary', desc: 'No allegiances. Stack talent, make moves, win by any means.' },
              ].map((style, i) => (
                <div key={i} className="p-4 bg-stadium rounded-lg border border-muted/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{style.icon}</span>
                    <h3 className="font-display text-lg text-gold">{style.name}</h3>
                  </div>
                  <p className="text-cream/60 font-mono text-xs">{style.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Core Gameplay */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-ink rounded-xl p-8 border border-gold/20"
          >
            <h2 className="font-display text-2xl text-cream mb-6 flex items-center gap-3">
              <span className="text-gold">03</span>
              Core Gameplay
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-mono text-gold text-sm uppercase tracking-wider mb-3">Seasons</h3>
                <p className="text-cream/80 text-sm leading-relaxed">
                  Each season spans 24 games with playoff drama. Manage your roster, make strategic decisions, and compete for the championship.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-gold text-sm uppercase tracking-wider mb-3">Player Development</h3>
                <p className="text-cream/80 text-sm leading-relaxed">
                  8 unique development pathways. Watch your players grow from raw prospects into superstars through proper coaching and game time.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-gold text-sm uppercase tracking-wider mb-3">Trades & Scouting</h3>
                <p className="text-cream/80 text-sm leading-relaxed">
                  Build your roster through trades and the draft. Scout prospects, negotiate deals, and manage your cap space wisely.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-gold text-sm uppercase tracking-wider mb-3">Legacy</h3>
                <p className="text-cream/80 text-sm leading-relaxed">
                  Every decision compounds. Win championships, induct Hall of Famers, and build a dynasty that lasts generations.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Navigation Guide */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-ink rounded-xl p-8 border border-gold/20"
          >
            <h2 className="font-display text-2xl text-cream mb-6 flex items-center gap-3">
              <span className="text-gold">04</span>
              Navigation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm">
              {[
                { page: 'Dashboard', desc: 'Overview of your franchise' },
                { page: 'Roster', desc: 'Manage your players' },
                { page: 'Dev League', desc: 'Player development' },
                { page: 'Game Day', desc: 'Play games & make plays' },
                { page: 'Trade Market', desc: 'Make trades' },
                { page: 'Coaching', desc: 'Hire coaches' },
                { page: 'Scouting', desc: 'Scout draft prospects' },
                { page: 'Draft Board', desc: 'Draft new players' },
                { page: 'Records', desc: 'View franchise history' },
              ].map((nav, i) => (
                <div key={i} className="p-3 bg-stadium rounded-lg">
                  <p className="text-cream font-medium">{nav.page}</p>
                  <p className="text-muted text-xs">{nav.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Tips */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-gold/10 to-rust/10 rounded-xl p-8 border border-gold/30"
          >
            <h2 className="font-display text-2xl text-gold mb-4">Pro Tips</h2>
            <ul className="space-y-3 text-cream/80 font-mono text-sm">
              <li className="flex items-start gap-3">
                <span className="text-gold">•</span>
                Chemistry matters! Players with high morale perform better.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold">•</span>
                Balance veteran leadership with young talent for optimal development.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold">•</span>
                Watch the trade deadline - it's your last chance to make moves before playoffs.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold">•</span>
                Focus on a few core players rather than spreading development thin.
              </li>
            </ul>
          </motion.section>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-cream/60 font-serif italic mb-6">
            Ready to write your legacy?
          </p>
          <motion.button
            onClick={() => navigate('/new-game')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(200, 150, 58, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            className="px-12 py-4 bg-gradient-to-r from-gold to-rust text-stadium font-mono text-lg uppercase tracking-wider rounded-lg"
          >
            Start Your Career
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
