import { motion } from 'framer-motion';
import { useSeasonRecap, useAwards, useStandings } from '../hooks';
import { useGame } from '../context/GameContext';
import PageHeader from '../components/PageHeader';
import { useCountUp } from '../hooks';

const AWARD_LABELS = {
  'mvp': 'Most Valuable Player',
  'dpoy': 'Defensive Player of the Year',
  'mip': 'Most Improved Player',
  'roy': 'Rookie of the Year',
  'smoy': 'Sixth Man of the Year'
};

function AwardCard({ award, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-ink rounded-lg border border-stadium"
    >
      <p className="text-xs text-gold font-mono mb-1">{AWARD_LABELS[type]?.toUpperCase()}</p>
      <p className="font-display text-lg text-cream">{award.player?.name}</p>
      <p className="text-sm text-muted/60 font-mono">
        {award.player?.position} · {award.team?.name}
      </p>
    </motion.div>
  );
}

function StatRow({ label, value, highlight = false }) {
  return (
    <div className={`flex items-center justify-between py-3 ${highlight ? 'border-b border-muted/20' : 'border-b border-muted/10'}`}>
      <span className={`font-mono ${highlight ? 'text-cream' : 'text-muted/60'}`}>{label}</span>
      <span className={`font-mono ${highlight ? 'text-gold text-lg' : 'text-cream'}`}>{value}</span>
    </div>
  );
}

export default function SeasonRecap() {
  const { activeTeam, activeSeason } = useGame();
  const { data: recap, loading } = useSeasonRecap(activeSeason?.id);
  const { data: awards } = useAwards(activeSeason?.id);
  const { data: standings } = useStandings();

  const teamRecord = standings?.find(t => t.id === activeTeam?.id);
  const wins = useCountUp(teamRecord?.wins || 0, 1000);
  const losses = useCountUp(teamRecord?.losses || 0, 1000);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-muted/60">Loading season recap...</p>
      </div>
    );
  }

  const seasonComplete = (teamRecord?.wins || 0) + (teamRecord?.losses || 0) >= 24;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <PageHeader
        title="Season Recap"
        subtitle={activeSeason ? `Season ${activeSeason.year}` : '2025-26'}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-ink rounded-lg border border-stadium p-8 text-center"
      >
        <p className="text-muted/60 font-mono mb-2">FINAL RECORD</p>
        <div className="flex items-center justify-center gap-6">
          <span className="font-mono text-6xl text-gold">{wins}</span>
          <span className="font-mono text-4xl text-muted">-</span>
          <span className="font-mono text-6xl text-cream">{losses}</span>
        </div>
        <p className="text-lg text-muted/60 mt-4 font-serif italic">
          {recap?.narrative || '"A season of growth and determination."'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">SEED</p>
          <p className="font-mono text-4xl text-gold">{recap?.seed || teamRecord?.seed || '-'}</p>
        </div>
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">PLAYOFF RESULT</p>
          <p className="font-mono text-2xl text-cream">{recap?.playoff_result || 'TBD'}</p>
        </div>
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">HOME RECORD</p>
          <p className="font-mono text-4xl text-cream">
            {recap?.home_record || '0-0'}
          </p>
        </div>
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <p className="text-xs text-muted/60 font-mono mb-2">AWAY RECORD</p>
          <p className="font-mono text-4xl text-cream">
            {recap?.road_record || '0-0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-ink rounded-lg border border-stadium overflow-hidden">
          <div className="bg-stadium px-6 py-4 border-b border-muted/20">
            <h3 className="font-mono text-sm text-cream">SEASON AWARDS</h3>
          </div>
          <div className="p-4">
            {awards?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {awards.map((award, i) => (
                  <AwardCard key={i} award={award} type={award.type} />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted/60 font-mono">Awards pending...</p>
            )}
          </div>
        </div>

        <div className="bg-ink rounded-lg border border-stadium overflow-hidden">
          <div className="bg-stadium px-6 py-4 border-b border-muted/20">
            <h3 className="font-mono text-sm text-cream">SEASON STATS</h3>
          </div>
          <div className="p-4">
            <StatRow label="Points Per Game" value={recap?.ppg || '0.0'} highlight />
            <StatRow label="Assists Per Game" value={recap?.apg || '0.0'} />
            <StatRow label="Rebounds Per Game" value={recap?.rpg || '0.0'} />
            <StatRow label="Opponent PPG" value={recap?.opp_ppg || '0.0'} />
            <StatRow label="Team FG%" value={`${recap?.fg_pct || 0}%`} />
            <StatRow label="3PT FG%" value={`${recap?.three_pct || 0}%`} />
            <StatRow label="Win Streak" value={`${recap?.win_streak || 0} games`} highlight />
            <StatRow label="Loss Streak" value={`${recap?.loss_streak || 0} games`} />
          </div>
        </div>
      </div>

      {recap?.top_scoring_games && recap.top_scoring_games.length > 0 && (
        <div className="bg-ink rounded-lg border border-stadium p-6">
          <h3 className="font-mono text-sm text-gold mb-4">TOP PERFORMANCES</h3>
          <div className="space-y-3">
            {recap.top_scoring_games.map((game, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-stadium rounded">
                <div>
                  <p className="font-mono text-cream">{game.player}</p>
                  <p className="text-xs text-muted/60">{game.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl text-gold">{game.points} PTS</p>
                  <p className="text-xs text-muted/60">{game.rebounds} REB · {game.assists} AST</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
