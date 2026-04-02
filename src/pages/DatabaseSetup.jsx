import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const INIT_SQL = `-- Run this once in your Supabase SQL Editor (SQL Editor tab)
create or replace function exec(sql text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  execute sql;
end;
$$;`

const STEPS = [
  { id: 'connect', label: 'Connect to Supabase' },
  { id: 'schema', label: 'Create Schema' },
  { id: 'seed', label: 'Seed Data' },
  { id: 'migrate', label: 'Run Migrations' },
  { id: 'done', label: 'Complete' },
]

function StepIcon({ status }) {
  if (status === 'done') return <span className="text-gold">✓</span>
  if (status === 'error') return <span className="text-ember">✕</span>
  if (status === 'running') return <span className="text-rust animate-pulse">◌</span>
  return <span className="text-muted/40">○</span>
}

export default function DatabaseSetup() {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatuses, setStepStatuses] = useState(
    STEPS.map(s => ({ id: s.id, status: 'pending', log: '' }))
  )
  const [isRunning, setIsRunning] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [execReady, setExecReady] = useState(null)
  const [showInit, setShowInit] = useState(false)

  const log = useCallback((stepId, msg) => {
    setStepStatuses(prev => prev.map(s =>
      s.id === stepId
        ? { ...s, log: s.log + (s.log ? '\n' : '') + `[${new Date().toLocaleTimeString()}] ${msg}` }
        : s
    ))
  }, [])

  const setStatus = useCallback((stepId, status) => {
    setStepStatuses(prev => prev.map(s =>
      s.id === stepId ? { ...s, status } : s
    ))
  }, [])

  const runStep = async (stepId, fn) => {
    setStatus(stepId, 'running')
    try {
      await fn()
      setStatus(stepId, 'done')
      return true
    } catch (err) {
      log(stepId, `ERROR: ${err.message}`)
      setStatus(stepId, 'error')
      return false
    }
  }

  const checkExec = async () => {
    if (execReady !== null) return execReady
    try {
      await supabase.rpc('exec', { sql: 'select 1' })
      setExecReady(true)
      return true
    } catch {
      setExecReady(false)
      return false
    }
  }

  const handleSetup = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    setStepStatuses(STEPS.map(s => ({ id: s.id, status: 'pending', log: '' })))

    const stepConnect = STEPS[0].id
    const stepSchema = STEPS[1].id
    const stepSeed = STEPS[2].id
    const stepMigrate = STEPS[3].id

    const ok0 = await runStep(stepConnect, async () => {
      log(stepConnect, 'Testing connection...')
      const hasExec = await checkExec()
      if (!hasExec) {
        throw new Error('exec() function not found. Run the init SQL in Supabase SQL Editor first.')
      }
      log(stepConnect, 'exec() function found. Connected!')
    })
    setCurrentStep(1)
    if (!ok0) { setIsRunning(false); return }

    const ok1 = await runStep(stepSchema, async () => {
      log(stepSchema, 'Loading schema SQL...')
      const schemaSql = await import('../sql/hardwood_complete.sql?raw')
      const statements = parseSql(schemaSql.default, resetMode)
      log(stepSchema, `Executing ${statements.length} statements...`)
      let errors = 0
      for (const stmt of statements) {
        const trimmed = stmt.trim()
        if (!trimmed || trimmed.startsWith('--')) continue
        try {
          const { error } = await supabase.rpc('exec', { sql: trimmed })
          if (error && !isExpectedError(error.message)) {
            log(stepSchema, `WARN: ${trimmed.slice(0, 50)}... — ${error.message}`)
            errors++
          }
        } catch (e) { errors++ }
      }
      log(stepSchema, `Schema done. ${errors} warnings (usually safe to ignore).`)
    })
    setCurrentStep(2)
    if (!ok1) { setIsRunning(false); return }

    const ok2 = await runStep(stepSeed, async () => {
      log(stepSeed, 'Loading seed SQL...')
      const schemaSql = await import('../sql/hardwood_complete.sql?raw')
      const statements = parseSql(schemaSql.default, false)
      const seedStmts = statements.filter(s =>
        s.trim().toLowerCase().startsWith('insert')
      )
      log(stepSeed, `Executing ${seedStmts.length} INSERT statements...`)
      for (const stmt of seedStmts) {
        const trimmed = stmt.trim()
        if (!trimmed) continue
        try {
          await supabase.rpc('exec', { sql: trimmed })
        } catch (e) { /* skip duplicates */ }
      }
      log(stepSeed, 'Seed data complete!')
    })
    setCurrentStep(3)

    const ok3 = await runStep(stepMigrate, async () => {
      log(stepMigrate, 'Running migration SQL...')
      try {
        const migrateSql = await import('../sql/oldsql.sql?raw')
        const statements = parseSql(migrateSql.default, false)
        log(stepMigrate, `Executing ${statements.length} statements...`)
        for (const stmt of statements) {
          const trimmed = stmt.trim()
          if (!trimmed || trimmed.startsWith('--')) continue
          try {
            const { error } = await supabase.rpc('exec', { sql: trimmed })
            if (error && !isExpectedError(error.message)) {
              log(stepMigrate, `WARN: ${error.message}`)
            }
          } catch (e) { /* skip */ }
        }
        log(stepMigrate, 'Migrations complete!')
      } catch (e) {
        log(stepMigrate, 'Migration file not found, skipping.')
      }
    })

    setCurrentStep(4)
    setAllDone(ok1 && ok2 && ok3)
    setIsRunning(false)
  }

  const currentStatus = stepStatuses[currentStep]

  return (
    <div className="min-h-screen bg-stadium flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-cream tracking-wider mb-3">
            DATABASE SETUP
          </h1>
          <p className="font-serif text-lg text-muted/60 italic">
            Build your Hardwood Manager database on Supabase
          </p>
        </div>

        <div className="bg-ink border border-muted/20 rounded-xl p-8 space-y-6">
          {execReady === false && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-ember/10 border border-ember/30 rounded-lg space-y-3"
            >
              <p className="font-mono text-ember text-sm font-bold">
                ⚠ Step 1: Create the exec() function first
              </p>
              <p className="text-xs text-muted/60 font-mono">
                Copy this SQL and run it in your Supabase SQL Editor:
              </p>
              <pre className="text-xs font-mono bg-stadium p-3 rounded overflow-x-auto whitespace-pre text-cream/80">
                {INIT_SQL}
              </pre>
              <button
                onClick={() => setShowInit(true)}
                className="text-xs text-gold underline font-mono"
              >
                {showInit ? 'Hide' : 'Show full init SQL'}
              </button>
              {showInit && (
                <pre className="text-xs font-mono bg-stadium p-3 rounded overflow-x-auto whitespace-pre text-cream/80">
                  {INIT_SQL}
                </pre>
              )}
              <button
                onClick={async () => {
                  const ok = await checkExec()
                  if (ok) log('connect', 'exec() function confirmed!')
                  else log('connect', 'Still not found. Make sure you ran the SQL in Supabase.')
                }}
                className="w-full py-2 bg-gold text-stadium rounded font-mono text-sm"
              >
                Check Again
              </button>
            </motion.div>
          )}

          <div>
            <p className="text-xs text-muted/60 font-mono uppercase tracking-widest mb-3">
              {resetMode ? '⚠ RESET MODE' : 'SAFE MODE'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResetMode(false)}
                className={`flex-1 py-3 rounded font-mono text-sm transition-all ${
                  !resetMode ? 'bg-gold/20 text-gold border border-gold/50' : 'bg-stadium text-muted border border-transparent'
                }`}
              >
                Safe Mode (skip existing)
              </button>
              <button
                onClick={() => setResetMode(true)}
                className={`flex-1 py-3 rounded font-mono text-sm transition-all ${
                  resetMode ? 'bg-ember/20 text-ember border border-ember/50' : 'bg-stadium text-muted border border-transparent'
                }`}
              >
                Reset Mode (recreate all)
              </button>
            </div>
            <p className="text-xs text-muted/60 mt-2 font-mono">
              {resetMode
                ? 'Drops all tables and recreates from scratch. Use if tables are corrupted.'
                : 'Only creates tables that don\'t exist. Safer for existing data.'}
            </p>
          </div>

          <div className="h-px bg-muted/20" />

          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const s = stepStatuses[i]
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <StepIcon status={s.status} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-mono text-sm ${
                      s.status === 'done' ? 'text-gold' :
                      s.status === 'error' ? 'text-ember' :
                      s.status === 'running' ? 'text-rust' :
                      'text-muted/60'
                    }`}>
                      {i + 1}. {step.label}
                    </p>
                    {s.log && (
                      <pre className="mt-1 text-xs text-muted/60 font-mono whitespace-pre-wrap bg-stadium p-2 rounded max-h-24 overflow-y-auto">
                        {s.log}
                      </pre>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="h-px bg-muted/20" />

          <AnimatePresence mode="wait">
            {allDone ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <p className="font-display text-2xl text-gold mb-2">Database Ready!</p>
                  <p className="text-muted/60 font-mono text-sm">
                    All tables created and seeded. Head to New Game to start!
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = '/new-game'}
                    className="flex-1 py-4 bg-gold text-stadium rounded font-mono text-lg hover:bg-gold/90 transition-colors"
                  >
                    Start New Game
                  </button>
                </div>
              </motion.div>
            ) : isRunning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2"
              >
                <p className="font-mono text-rust animate-pulse">
                  Running... please wait
                </p>
                <p className="text-xs text-muted/60 mt-1 font-mono">
                  {currentStatus?.log?.split('\n').pop() || ''}
                </p>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSetup}
                className="w-full py-4 bg-gold text-stadium rounded font-mono text-lg hover:bg-gold/90 transition-colors"
              >
                {stepStatuses.some(s => s.status === 'error')
                  ? 'Retry Setup'
                  : 'Setup Database'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted/40 mt-6 font-mono">
          Requires exec() function. Run init SQL in Supabase SQL Editor first.
        </p>
      </motion.div>
    </div>
  )
}

function parseSql(sql, includeDrop = true) {
  let text = sql
  if (!includeDrop) {
    text = text.replace(/^drop table if exists.*?;/gms, '')
  }
  const statements = text.split(/;\s*$/m)
  return statements
}

function isExpectedError(msg) {
  if (!msg) return true
  const lower = msg.toLowerCase()
  return lower.includes('does not exist') ||
    lower.includes('duplicate') ||
    lower.includes('already exists') ||
    lower.includes('policy') ||
    lower.includes('rls') ||
    lower.includes('hint:')
}
