import React from 'react'
import { motion } from 'framer-motion'

function getDevelopment(player) {
  if (player.development) return player.development
  if (player.potential >= 90 && player.morale >= 80) return 'peak'
  if (player.potential >= 85 && player.morale >= 70) return 'breakout'
  if (player.morale >= 60) return 'improving'
  if (player.morale < 40) return 'declining'
  return 'steady'
}

function getContract(player) {
  if (player.contract) return player.contract
  if (player.contract_years !== undefined) {
    const years = player.contract_years
    if (years === 0) return 'Expiring'
    if (player.age < 23) return `Rookie (${years}y)`
    if (years >= 3) return 'Long-term'
    return `${years}y remaining`
  }
  if (player.tier === 'star') return 'Max'
  if (player.tier === 'normal') return 'Standard'
  return 'Rookie'
}

function getJerseyNumber(player) {
  return player.jerseyNumber ?? player.jersey_number ?? player.number ?? '—'
}

function getPersona(player) {
  if (player.persona) return player.persona
  return { unlocked: player.is_revealed, name: player.persona_category }
}

export default function PlayerTable({ players, onSelectPlayer, selectedId }) {
  return (
    <div className="bg-ink border border-muted/20">
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-muted/20 bg-stadium/50 font-mono text-[10px] uppercase text-muted tracking-wider">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Name</div>
        <div className="col-span-1">Pos</div>
        <div className="col-span-1 text-right">Age</div>
        <div className="col-span-1 text-right">Ovr</div>
        <div className="col-span-2 text-right">Salary</div>
        <div className="col-span-2">Contract</div>
        <div className="col-span-1">Dev</div>
      </div>

      <div className="divide-y divide-muted/10">
        {players.map((player, index) => {
          const dev = getDevelopment(player)
          const contract = getContract(player)
          const jersey = getJerseyNumber(player)
          const persona = getPersona(player)

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: index * 0.03 }}
              onClick={() => onSelectPlayer(player)}
              data-tutorial={index === 0 ? 'player-row' : undefined}
              className={`
                grid grid-cols-12 gap-4 p-4 cursor-pointer transition-all
                hover:-translate-y-0.5 hover:bg-stadium/50
                ${selectedId === player.id ? 'bg-stadium/50 border-l-2 border-l-rust' : ''}
              `}
            >
              <div className="col-span-1 font-mono text-muted text-sm">
                {jersey}
              </div>
              <div className="col-span-3">
                <p className="font-display text-parchment text-[17px]">
                  {player.name}
                </p>
                {persona.unlocked && persona.name && (
                  <p className="font-mono text-gold text-[10px] mt-0.5">
                    {persona.name}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <span className="inline-block px-2 py-0.5 bg-rust/20 text-rust font-mono text-[11px]">
                  {player.position}
                </span>
              </div>
              <div className="col-span-1 font-mono text-muted text-sm text-right">
                {player.age}
              </div>
              <div className="col-span-1 font-mono text-cream text-sm text-right">
                {player.overall ?? '—'}
              </div>
              <div className="col-span-2 font-mono text-parchment text-sm text-right">
                ${((player.salary ?? 0) / 1000000).toFixed(1)}M
              </div>
              <div className="col-span-2 font-mono text-muted text-[11px]">
                {contract}
              </div>
              <div className="col-span-1">
                <span className={`font-mono text-[10px] uppercase ${
                  dev === 'breakout' ? 'text-gold' :
                  dev === 'improving' ? 'text-rust' :
                  dev === 'declining' ? 'text-ember' :
                  'text-muted'
                }`}>
                  {dev === 'peak' ? '★' :
                   dev === 'breakout' ? '↑↑' :
                   dev === 'improving' ? '↑' :
                   dev === 'declining' ? '↓' : '→'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
