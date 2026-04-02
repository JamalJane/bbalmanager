import { motion } from 'framer-motion';
import { useFranchiseRecords, useLegacyLog } from '../hooks';
import { useGame } from '../context/GameContext';
import PageHeader from '../components/PageHeader';
import { useCountUp } from '../hooks';

function RecordCard({ record }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-ink rounded-lg border border-stadium"
    >
      <p className="text-xs text-muted/60 font-mono mb-1">{record.category}</p>
      <p className="font-display text-lg text-cream mb-2">{record.record_name}</p>
      <div className="flex items-center justify-between">
        <div>
          {record.player?.name ? (
            <p className="text-sm text-gold font-mono">{record.player.name}</p>
          ) : record.team?.name ? (
            <p className="text-sm text-gold font-mono">{record.team.name}</p>
          ) : (
            <p className="text-sm text-muted/60">N/A</p>
          )}
        </div>
        <p className="font-mono text-2xl text-gold">{record.value}</p>
      </div>
      {record.season && (
        <p className="text-xs text-muted/60 mt-2">Season {record.season}</p>
      )}
    </motion.div>
  );
}

function LegacyLogItem({ entry }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-muted/10">
      <div>
        <p className="text-sm text-cream">{entry.description}</p>
        <p className="text-xs text-muted/60 font-mono">
          {new Date(entry.created_at).toLocaleDateString()}
        </p>
      </div>
      <span className={`font-mono text-sm ${entry.points >= 0 ? 'text-gold' : 'text-ember'}`}>
        {entry.points >= 0 ? '+' : ''}{entry.points}
      </span>
    </div>
  );
}

export default function Records() {
  const { gmProfile } = useGame();
  const { data: records, loading: recordsLoading } = useFranchiseRecords();
  const { data: legacyLog, loading: logLoading } = useLegacyLog(gmProfile?.id);

  const legacyScore = useCountUp(gmProfile?.legacy_score || 0, 2000);

  const recordCategories = records?.reduce((acc, record) => {
    if (!acc[record.category]) acc[record.category] = [];
    acc[record.category].push(record);
    return acc;
  }, {}) || {};

  if (recordsLoading || logLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-muted/60">Loading records...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <PageHeader
        title="Franchise Records"
        subtitle="All-time statistics"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">LEGACY SCORE</p>
          <p className="font-mono text-4xl text-gold">{legacyScore}</p>
          <p className="text-sm text-muted/60 mt-2">
            Rank #{gmProfile?.legacy_rank || '?'} all-time
          </p>
        </div>

        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">SEASONS</p>
          <p className="font-mono text-4xl text-cream">{gmProfile?.seasons_managed || 0}</p>
        </div>

        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">CHAMPIONSHIPS</p>
          <p className="font-mono text-4xl text-gold">{gmProfile?.championships || 0}</p>
        </div>

        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">MVP AWARDS</p>
          <p className="font-mono text-4xl text-cream">{gmProfile?.mvp || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(recordCategories).map(([category, categoryRecords]) => (
            <div key={category}>
              <h3 className="font-mono text-sm text-gold mb-4">{category.toUpperCase()}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryRecords.map(record => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-ink rounded-lg border border-stadium p-6 h-fit">
          <h3 className="font-mono text-sm text-cream mb-4">LEGACY LOG</h3>
          <div className="max-h-96 overflow-y-auto">
            {legacyLog?.map(entry => (
              <LegacyLogItem key={entry.id} entry={entry} />
            ))}
            {(!legacyLog || legacyLog.length === 0) && (
              <p className="text-sm text-muted/60 font-mono text-center py-4">
                No legacy events yet
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
