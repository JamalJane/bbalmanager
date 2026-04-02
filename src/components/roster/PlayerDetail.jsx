import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCountUp } from '../../hooks/useCountUp'
import { sendToDevLeague } from '../../services/roster'
import { useGame } from '../../context/GameContext'

function AttributeBar({ label, value, delay = 0 }) {
  const displayValue = useCountUp(value ?? 0, 600)

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-muted text-[10px] uppercase">
          {label}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + delay }}
          className="font-mono text-rust text-sm"
        >
          {displayValue}
        </motion.span>
      </div>
      <div className="h-1 bg-muted/30 overflow-hidden">
        <motion.div
          className="h-full bg-rust"
          initial={{ width: 0 }}
          animate={{ width: `${value ?? 0}%` }}
          transition={{ duration: 0.6, delay: delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function getGrade(overall) {
  if (!overall) return '—'
  if (overall >= 95) return 'A+'
  if (overall >= 90) return 'A'
  if (overall >= 85) return 'A-'
  if (overall >= 82) return 'B+'
  if (overall >= 78) return 'B'
  if (overall >= 74) return 'B-'
  if (overall >= 70) return 'C+'
  if (overall >= 65) return 'C'
  if (overall >= 60) return 'C-'
  return 'D'
}

function getDevelopmentStage(potential, morale) {
  if (potential >= 90 && morale >= 80) return 'peak'
  if (potential >= 85 && morale >= 70) return 'breakout'
  if (morale >= 60) return 'improving'
  if (morale < 40) return 'declining'
  return 'steady'
}

export default function PlayerDetail({ player, onClose, onActionComplete }) {
  const navigate = useNavigate()
  const { activeTeam } = useGame()
  const [actionLoading, setActionLoading] = React.useState('')
  const resolved = useMemo(() => {
    if (!player) return null
    const p = player

    const persona = p.persona_definitions
      ? { unlocked: p.is_revealed, name: p.persona_definitions.name || p.persona_category, description: p.persona_definitions.description || '' }
      : { unlocked: p.is_revealed, name: p.persona_category || '', description: '' }

    const traits = (p.trait_tags || []).map((t, i) => ({ name: t, status: 'earned' }))

    const offense = Math.round(((p.points ?? 0) * 2 + (p.assists ?? 0) * 1.5) / 3)
    const defense = p.defense ?? 0
    const athleticism = p.speed ?? 0
    const basketballIQ = Math.round((offense + defense) / 2)

    const attributes = { offense, defense, athleticism, basketballIQ }

    return {
      ...p,
      jerseyNumber: p.jersey_number || p.jerseyNumber || p.number || '—',
      overall: p.overall || 0,
      grade: getGrade(p.overall),
      development: getDevelopmentStage(p.potential, p.morale),
      attributes,
      traits,
      signatureMove: p.signature_move || p.signatureMove || null,
      quirk: p.quirk || null,
      tendency: p.tendency || p.play_style || 'Balanced',
      pathway: p.dev_pathway || p.pathway || null,
      yearsRemaining: p.contract_years || p.years_remaining || 1,
      contract: p.tier === 'star' ? 'Max Contract' : p.tier === 'normal' ? 'Standard' : 'Rookie Scale',
      coach: p.assigned_coach || p.coach || null,
      persona,
    }
  }, [player])

  if (!resolved) return null

  const overallCount = useCountUp(resolved.overall, 600)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-[380px] bg-ink border border-muted/20 p-6 sticky top-20"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted hover:text-parchment transition-colors"
      >
        ✕
      </button>

      <div className="relative mb-6">
        <span
          className="absolute -top-2 -right-2 font-display text-[120px] text-cream/5 select-none"
          style={{ zIndex: 0 }}
        >
          {resolved.jerseyNumber}
        </span>

        <h2 className="font-display text-cream text-[28px] uppercase relative z-10">
          {resolved.name}
        </h2>

        <div className="flex items-center gap-3 mt-2 relative z-10">
          <span className="px-2 py-0.5 bg-rust text-cream font-mono text-[11px]">
            {resolved.position}
          </span>
          <span className="font-mono text-muted text-[13px]">
            Age {resolved.age}
          </span>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div>
          <p className="font-mono text-muted text-[10px] uppercase">Overall</p>
          <p className="font-mono text-cream text-[24px]">
            {overallCount}
          </p>
        </div>
        <div>
          <p className="font-mono text-muted text-[10px] uppercase">Grade</p>
          <p className="font-mono text-rust text-[24px]">{resolved.grade}</p>
        </div>
        <div>
          <p className="font-mono text-muted text-[10px] uppercase">Morale</p>
          <p className="font-mono text-parchment text-[24px]">{resolved.morale ?? '—'}</p>
        </div>
      </div>

      <div className="h-px bg-muted/20 my-6" />

      <h3 className="font-mono text-muted text-[10px] uppercase tracking-wider mb-4">
        Attributes
      </h3>

      <AttributeBar label="Offense" value={resolved.attributes.offense} delay={0} />
      <AttributeBar label="Defense" value={resolved.attributes.defense} delay={0.08} />
      <AttributeBar label="Athleticism" value={resolved.attributes.athleticism} delay={0.16} />
      <AttributeBar label="Basketball IQ" value={resolved.attributes.basketballIQ} delay={0.24} />

      <div className="flex gap-2 mt-4">
        {resolved.traits.map((trait, i) => (
          <span
            key={i}
            className={`px-2 py-1 font-mono text-[10px] uppercase ${
              trait.status === 'earned'
                ? 'bg-rust/20 text-rust'
                : 'border border-muted/30 text-muted'
            }`}
          >
            {trait.name}
          </span>
        ))}
      </div>

      <div className="h-px bg-muted/20 my-6" />

      <div className="mb-4">
        <p className="font-mono text-muted text-[10px] uppercase mb-1">
          Tendency
        </p>
        <p className="font-mono text-parchment text-[13px]">
          {resolved.tendency}
        </p>
      </div>

      {resolved.signatureMove && (
        <div className="mb-4">
          <p className="font-mono text-muted text-[10px] uppercase mb-1">
            Signature Move
          </p>
          <p className="font-display text-gold text-[15px]">
            {resolved.signatureMove}
          </p>
        </div>
      )}

      {resolved.quirk && (
        <div className="mb-4">
          <p className="font-mono text-muted text-[10px] uppercase mb-1">
            Quirk
          </p>
          <p className="font-serif italic text-parchment text-[14px] leading-relaxed">
            {resolved.quirk}
          </p>
        </div>
      )}

      {resolved.persona.unlocked && (
        <div className="p-4 bg-gold/10 border border-gold/30 mb-4">
          <p className="font-mono text-gold text-[10px] uppercase mb-1">
            Persona Unlocked
          </p>
          <p className="font-display text-cream text-lg">
            {resolved.persona.name}
          </p>
          {resolved.persona.description && (
            <p className="font-serif italic text-parchment text-[13px] mt-1">
              {resolved.persona.description}
            </p>
          )}
        </div>
      )}

      <div className="h-px bg-muted/20 my-6" />

      <div className="flex justify-between mb-4">
        <div>
          <p className="font-mono text-muted text-[10px] uppercase">
            Years Remaining
          </p>
          <p className="font-mono text-parchment text-[14px]">
            {resolved.yearsRemaining}
          </p>
        </div>
        <div>
          <p className="font-mono text-muted text-[10px] uppercase">
            Salary
          </p>
          <p className="font-mono text-parchment text-[14px]">
            ${((resolved.salary ?? 0) / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {resolved.pathway && (
        <div className="mb-4">
          <p className="font-mono text-muted text-[10px] uppercase mb-1">
            Pathway
          </p>
          <p className="font-mono text-parchment text-[13px]">
            {resolved.pathway}
          </p>
          {resolved.coach && (
            <p className="font-mono text-muted text-[11px]">
              Assigned: {resolved.coach}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => navigate('/offseason')}
          className="flex-1 py-2 font-mono text-[11px] uppercase tracking-wider border border-muted/30 text-parchment hover:border-rust hover:text-rust transition-colors"
        >
          Extend
        </button>
        <button
          onClick={() => navigate('/trade-market')}
          className="flex-1 py-2 font-mono text-[11px] uppercase tracking-wider border border-muted/30 text-parchment hover:border-rust hover:text-rust transition-colors"
        >
          Trade
        </button>
        {player.rosterId && (
          <button
            onClick={async () => {
              if (!player.rosterId) return
              setActionLoading('dev')
              try {
                await sendToDevLeague(player.rosterId)
                onClose()
                if (onActionComplete) onActionComplete()
              } catch (err) {
                console.error('Failed to send to dev league:', err)
              } finally {
                setActionLoading('')
              }
            }}
            disabled={actionLoading === 'dev'}
            className="flex-1 py-2 font-mono text-[11px] uppercase tracking-wider border border-muted/30 text-parchment hover:border-rust hover:text-rust transition-colors disabled:opacity-50"
          >
            {actionLoading === 'dev' ? '...' : 'Dev League'}
          </button>
        )}
        {!player.rosterId && (
          <button
            onClick={() => navigate('/dev-league')}
            className="flex-1 py-2 font-mono text-[11px] uppercase tracking-wider border border-muted/30 text-parchment hover:border-rust hover:text-rust transition-colors"
          >
            Dev League
          </button>
        )}
      </div>
    </motion.div>
  )
}
