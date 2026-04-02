import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PageHeader from '../components/PageHeader'
import { useActiveDraftClass, useDraftBoard, useCurrentGM, useSeasonState } from '../hooks'

function SortableProspect({ prospect, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prospect.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const combineBadge = {
    elite: { bg: 'bg-gold/20', text: 'text-gold', label: '★ Elite' },
    positive: { bg: 'bg-rust/20', text: 'text-rust', label: '↑ Above Avg' },
    negative: { bg: 'bg-ember/20', text: 'text-ember', label: '↓ Below Avg' },
    neutral: { bg: 'bg-muted/20', text: 'text-muted', label: '— Avg' },
  }[prospect.combineResult] || { bg: 'bg-muted/20', text: 'text-muted', label: '— Avg' }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-ink border border-muted/20 p-4 cursor-grab active:cursor-grabbing
        transition-all hover:-translate-y-0.5 hover:border-rust/50
        ${isDragging ? 'scale-[1.03] border-gold shadow-lg gold-glow' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 text-center">
          <span className="font-mono text-muted text-lg">{index + 1}</span>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-parchment text-[16px]">
                {prospect.name}
              </h3>
              <p className="font-mono text-muted text-[11px] mt-0.5">
                {prospect.college || '—'} · Age {prospect.age}
              </p>
            </div>
            <span className="px-2 py-0.5 bg-rust/20 text-rust font-mono text-[11px]">
              {prospect.position}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div>
              <p className="font-mono text-muted text-[10px] uppercase">Overall</p>
              <p className="font-mono text-parchment text-sm">{prospect.overall}</p>
            </div>
            <div>
              <p className="font-mono text-muted text-[10px] uppercase">Potential</p>
              <p className="font-mono text-cream text-sm">{prospect.potential}</p>
            </div>
            <div>
              <p className="font-mono text-muted text-[10px] uppercase">PPG</p>
              <p className="font-mono text-parchment text-sm">{prospect.points ?? '—'}</p>
            </div>
            <div>
              <p className="font-mono text-muted text-[10px] uppercase">RPG</p>
              <p className="font-mono text-parchment text-sm">{prospect.rebounds ?? '—'}</p>
            </div>
            <div>
              <p className="font-mono text-muted text-[10px] uppercase">APG</p>
              <p className="font-mono text-parchment text-sm">{prospect.assists ?? '—'}</p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted text-[10px] w-20">Speed</span>
              <span className="font-mono text-parchment text-xs">
                {prospect.speed ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted text-[10px] w-20">Defense</span>
              <span className="font-mono text-parchment text-xs">
                {prospect.defense ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted text-[10px] w-20">Athleticism</span>
              <span className="font-mono text-parchment text-xs">
                {prospect.athleticism ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted text-[10px] w-20">Strength</span>
              <span className="font-mono text-parchment text-xs">
                {prospect.strength ?? '—'}
              </span>
            </div>
          </div>

          {prospect.scouting_blurb && (
            <p className="font-mono text-muted text-[11px] mt-3 italic">
              "{prospect.scouting_blurb}"
            </p>
          )}
        </div>

        <div className={`px-2 py-1 ${combineBadge.bg} ${combineBadge.text} font-mono text-[10px] uppercase whitespace-nowrap`}>
          {combineBadge.label}
        </div>
      </div>
    </div>
  )
}

export default function DraftBoard() {
  const { data: gm } = useCurrentGM()
  const { draftClass, prospects: allProspects, loading } = useActiveDraftClass()
  const { data: board } = useDraftBoard(gm?.team_id, draftClass?.id)

  const [localOrder, setLocalOrder] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const prospects = localOrder ?? board?.map(b => b.prospects).filter(Boolean) ?? allProspects ?? []

  function handleDragEnd(event) {
    const { active, over } = event
    if (active.id !== over.id) {
      setLocalOrder((items) => {
        const oldIndex = items.findIndex((p) => p.id === active.id)
        const newIndex = items.findIndex((p) => p.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader
        title="Draft Board"
        subtitle={`${prospects.length} Prospects Scouted`}
        action="Scout More"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="font-mono text-muted text-sm animate-pulse">Loading draft board...</div>
        </div>
      ) : prospects.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={prospects.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {prospects.map((prospect, index) => (
                <SortableProspect
                  key={prospect.id}
                  prospect={prospect}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="font-mono text-muted text-sm">No prospects available. The draft may have concluded.</div>
        </div>
      )}

      <div className="mt-8 p-4 bg-ink border border-muted/20">
        <h3 className="font-mono text-muted text-[10px] uppercase tracking-wider mb-3">
          Draft Pick Assets
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="font-mono text-muted text-[10px]">2026</p>
            <p className="font-mono text-parchment text-sm">1st, 2nd Round</p>
          </div>
          <div>
            <p className="font-mono text-muted text-[10px]">2027</p>
            <p className="font-mono text-parchment text-sm">1st, 2nd Round</p>
          </div>
          <div>
            <p className="font-mono text-muted text-[10px]">2028</p>
            <p className="font-mono text-parchment text-sm">1st, 2nd Round</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
