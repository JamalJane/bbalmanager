import React from 'react'
import { motion } from 'framer-motion'

export default function PageHeader({ title, subtitle, action }) {
  const isObj = action && typeof action === 'object' && 'onClick' in action

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mb-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-cream text-4xl uppercase tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <p className="font-mono text-muted text-[13px] mt-2">{subtitle}</p>
          )}
        </div>
        {action && (
          <button
            onClick={isObj ? action.onClick : undefined}
            disabled={isObj ? action.disabled : undefined}
            className={`px-4 py-2 bg-ink text-cream font-mono text-[13px] uppercase tracking-wider border border-muted/30 hover:border-rust hover:text-rust transition-colors ${
              isObj && action.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isObj ? action.label : action}
          </button>
        )}
      </div>
      <div className="h-px bg-rust mt-6" />
    </motion.div>
  )
}
