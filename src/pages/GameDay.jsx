import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useRoster } from '../hooks';
import { useCountUp, useTypewriter } from '../hooks';
import PageHeader from '../components/PageHeader';
import { simGame, applyGMIntervention, generateKeyMoments } from '../lib/simEngine';
import { supabase } from '../lib/supabase';

const INTERVENTION_TYPES = [
  { id: 'substitution', label: 'Substitution', description: 'Fresh player for next 3 possessions', icon: '↻' },
  { id: 'timeout', label: 'Timeout', description: 'Reset opponent momentum', icon: '⏸' },
  { id: 'play_call', label: 'Play Call', description: 'Focus offense through top player (1.08x)', icon: '🎯' },
  { id: 'double_team', label: 'Double Team', description: 'Reduce opponent clutch probability by 40%', icon: '👥' }
];

function buildTeamObj(team, roster) {
  const starters = (roster || [])
    .filter(r => r.role === 'starter' && r.players)
    .map(r => ({ ...r.players }))
    .slice(0, 5);
  const bench = (roster || [])
    .filter(r => r.role === 'reserve' && r.players)
    .map(r => ({ ...r.players }));
  return {
    ...team,
    starters,
    bench,
    chemistry: 50, // Default chemistry value
    coaches: [],
  };
}

function PlayByPlayItem({ moment, index }) {
  const isKey = moment.is_key_moment;
  const isClutch = moment.event_type === 'clutch_moment';
  const isInjury = moment.event_type === 'injury_scare';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`py-3 px-4 border-l-2 ${
        isKey ? 'border-gold bg-gold/5' :
        isClutch ? 'border-ember bg-ember/5' :
        isInjury ? 'border-rust bg-rust/5' :
        'border-muted/30'
      }`}
    >
      <p className={`font-mono text-sm ${isKey ? 'text-gold' : 'text-cream/80'}`}>
        {moment.description}
      </p>
      <span className="text-xs text-muted/60 font-mono">
        {moment.timestamp ? new Date(moment.timestamp).toLocaleTimeString() : moment.created_at ? new Date(moment.created_at).toLocaleTimeString() : ''}
      </span>
    </motion.div>
  );
}

function InterventionCard({ intervention, onSelect, selected }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(intervention.id)}
      className={`p-4 rounded-lg border text-left transition-all ${
        selected === intervention.id
          ? 'border-rust bg-rust/10'
          : 'border-ink bg-ink hover:border-rust/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{intervention.icon}</span>
        <span className="font-display text-lg text-cream">{intervention.label}</span>
      </div>
      <p className="text-sm text-muted/80 font-mono">{intervention.description}</p>
    </motion.button>
  );
}

function GameScoreboard({ game }) {
  const homeScore = useCountUp(game?.home_score || 0, 1000);
  const awayScore = useCountUp(game?.away_score || 0, 1000);

  return (
    <div className="flex items-center justify-center gap-12 py-8">
      <div className="text-center">
        <p className="font-display text-2xl text-cream mb-2">{game?.home_team?.city}</p>
        <p className="font-mono text-5xl text-gold" key={homeScore}>
          {homeScore}
        </p>
      </div>
      <div className="text-center">
        <p className="font-mono text-2xl text-muted">vs</p>
      </div>
      <div className="text-center">
        <p className="font-display text-2xl text-cream mb-2">{game?.away_team?.city}</p>
        <p className="font-mono text-5xl text-gold" key={awayScore}>
          {awayScore}
        </p>
      </div>
    </div>
  );
}

export default function GameDay() {
  const navigate = useNavigate();
  const { gameState, activeTeam, activeSeason, addGameFeedItem, updateGameState } = useGame();
  const [liveGame, setLiveGame] = useState(null);
  const [moments, setMoments] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: roster } = useRoster(activeTeam?.id || null);

  const typewriterState = useTypewriter(
    moments.length > 0
      ? moments[moments.length - 1].description
      : 'Waiting for game to start...',
    30
  );

  useEffect(() => {
    if (!activeTeam?.id || !activeSeason?.id) return;

    const loadNextGame = async () => {
      try {
        const { data, error } = await supabase
          .from('game_log')
          .select(`
            *,
            home_team:teams!game_log_home_team_id_fkey (id, name, city, color_primary),
            away_team:teams!game_log_away_team_id_fkey (id, name, city, color_primary)
          `)
          .or(`home_team_id.eq.${activeTeam.id},away_team_id.eq.${activeTeam.id}`)
          .eq('season_id', activeSeason.id)
          .is('home_score', null)
          .order('played_at', { ascending: true })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setLiveGame({
            ...data[0],
            home_team: { ...data[0].home_team },
            away_team: { ...data[0].away_team },
            home_score: 0,
            away_score: 0,
            status: 'scheduled',
          });
        } else {
          setLiveGame(null);
        }
      } catch (err) {
        console.error('Failed to load next game:', err);
        setLiveGame(null);
      }
    };

    loadNextGame();
  }, [activeTeam?.id, activeSeason?.id]);

  useEffect(() => {
    if (!activeTeam?.id || !activeSeason?.id || liveGame !== null) return
    const ensureGame = async () => {
      const { data: pending } = await supabase
        .from('game_log')
        .select('id')
        .or(`home_team_id.eq.${activeTeam.id},away_team_id.eq.${activeTeam.id}`)
        .eq('season_id', activeSeason.id)
        .is('home_score', null)
        .limit(1)
      if (pending && pending.length > 0) return

      const { data: opponents } = await supabase
        .from('teams')
        .select('id, name, city, color_primary')
        .neq('id', activeTeam.id)
        .limit(30)
      if (!opponents || opponents.length === 0) return

      const opponent = opponents[Math.floor(Math.random() * opponents.length)]
      const { data: homeData } = await supabase
        .from('teams')
        .select('id, name, city, color_primary')
        .eq('id', activeTeam.id)
        .single()

      if (homeData) {
        setLiveGame({
          id: 'ad-hoc-' + Date.now(),
          home_team: homeData,
          away_team: opponent,
          home_score: 0,
          away_score: 0,
          status: 'scheduled',
          isAdHoc: true,
        })
      }
    }
    ensureGame()
  }, [activeTeam?.id, activeSeason?.id, liveGame])

  const handlePlayGame = useCallback(async () => {
    if (!liveGame || !activeTeam || !activeSeason || isSimulating) return;
    if (!roster || roster.length === 0) {
      alert('Roster not loaded yet. Please wait a moment and try again.');
      return;
    }
    setIsSimulating(true);
    setMoments([]);
    setLiveGame(prev => ({ ...prev, status: 'live' }));

    try {
      const isHome = liveGame.home_team.id === activeTeam.id;
      const opponentId = isHome ? liveGame.away_team.id : liveGame.home_team.id;

      const { data: opponentRoster } = await supabase
        .from('rosters')
        .select(`
          id, role, is_dev_league, minutes_avg, dev_pathway,
          players (
            id, name, age, position, overall, potential, morale,
            persona_category, persona_sub, is_revealed, trait_tags,
            speed, defense, points, assists, rebounds,
            contract_years, salary
          )
        `)
        .eq('team_id', opponentId)
        .eq('is_dev_league', false);

      const homeTeam = buildTeamObj(liveGame.home_team, roster);
      const awayTeam = buildTeamObj(liveGame.away_team, opponentRoster || []);

      const result = simGame(homeTeam, awayTeam);
      const won = isHome ? result.homeScore > result.awayScore : result.awayScore > result.homeScore;

      const keyMoments = generateKeyMoments(homeTeam, awayTeam, result.homeScore, result.awayScore);

      setLiveGame(prev => ({
        ...prev,
        home_score: result.homeScore,
        away_score: result.awayScore,
        status: 'completed',
      }));
      setMoments(keyMoments.map(m => ({ ...m, timestamp: new Date().toISOString() })));

      if (!liveGame.isAdHoc) {
        const { error: updateError } = await supabase
          .from('game_log')
          .update({ home_score: result.homeScore, away_score: result.awayScore })
          .eq('id', liveGame.id);
        if (updateError) throw updateError;

        for (const moment of keyMoments) {
          await supabase.from('play_by_play').insert({
            game_log_id: liveGame.id,
            event_type: moment.event_type,
            description: moment.description,
            player_id: moment.player_id || null,
            is_key_moment: moment.is_key_moment || false,
            home_score_after: result.homeScore,
            away_score_after: result.awayScore,
          });
        }

        const winnerId = result.homeScore > result.awayScore ? liveGame.home_team.id : liveGame.away_team.id;
        const loserId = winnerId === liveGame.home_team.id ? liveGame.away_team.id : liveGame.home_team.id;
        const { data: wData } = await supabase.from('teams').select('wins').eq('id', winnerId).single();
        await supabase.from('teams').update({ wins: (wData?.wins || 0) + 1 }).eq('id', winnerId);
        const { data: lData } = await supabase.from('teams').select('losses').eq('id', loserId).single();
        await supabase.from('teams').update({ losses: (lData?.losses || 0) + 1 }).eq('id', loserId);
      }

      const feedLabel = `${liveGame.home_team.city} ${liveGame.home_team.name} ${result.homeScore} — ${result.awayScore} ${liveGame.away_team.city} ${liveGame.away_team.name}`;
      addGameFeedItem({ category: 'game', description: feedLabel, result: won ? 'win' : 'loss' });

      updateGameState({
        teamRecord: {
          wins: (gameState.teamRecord?.wins ?? 0) + (won ? 1 : 0),
          losses: (gameState.teamRecord?.losses ?? 0) + (won ? 0 : 1),
        },
        gamesPlayedThisWeek: true,
      });

    } catch (err) {
      console.error('Game simulation failed:', err);
      setLiveGame(prev => ({ ...prev, status: 'scheduled' }));
    } finally {
      setIsSimulating(false);
    }
  }, [liveGame, activeTeam, activeSeason, isSimulating, roster, addGameFeedItem, updateGameState, gameState.teamRecord]);

  const handleIntervention = (type) => {
    setSelectedIntervention(type);
    if (liveGame) {
      applyGMIntervention(type, {}, {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {!activeTeam ? (
        <>
          <PageHeader title="Game Day" subtitle="No team selected" />
          <div className="flex items-center justify-center h-64">
            <p className="font-mono text-muted/60">Start a new game to simulate games.</p>
          </div>
        </>
      ) : (
        <>
          <PageHeader
            title="Game Day"
            subtitle={activeSeason ? `Week ${activeSeason.current_week || 1}` : 'Live Game'}
            action={
              !liveGame ? null : liveGame.status === 'completed' ? {
                label: 'Week Complete',
                onClick: () => navigate('/dashboard'),
                disabled: false,
              } : {
                label: isSimulating ? 'Playing...' : 'Play Game',
                onClick: handlePlayGame,
                disabled: isSimulating,
                'data-tutorial': 'play-button',
              }
            }
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-ink rounded-lg border border-stadium overflow-hidden">
                <div className="bg-stadium px-6 py-4 border-b border-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-sm font-mono rounded ${
                        liveGame?.status === 'live' ? 'bg-ember/20 text-ember' :
                        liveGame?.status === 'completed' ? 'bg-gold/20 text-gold' :
                        'bg-muted/20 text-muted'
                      }`}>
                        {liveGame?.status === 'live' ? 'LIVE' :
                         liveGame?.status === 'completed' ? 'FINAL' :
                         liveGame?.status === 'scheduled' ? 'SCHEDULED' :
                         'NO GAME'}
                      </span>
                      <span className="font-mono text-cream/80">
                        {liveGame?.status === 'completed' ? 'FINAL' : 'PRE-GAME'}
                      </span>
                    </div>
                  </div>
                </div>

                <GameScoreboard game={liveGame} />

                <AnimatePresence mode="wait">
                  {moments.length > 0 && (
                    <motion.div
                      key="latest"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-4 bg-gold/5 border-t border-gold/20"
                    >
                      <p className="font-serif text-lg text-cream italic">
                        "{typewriterState.displayed}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-ink rounded-lg border border-stadium p-6">
                <h3 className="font-display text-lg text-cream mb-4">GM Interventions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {INTERVENTION_TYPES.map(intervention => (
                    <InterventionCard
                      key={intervention.id}
                      intervention={intervention}
                      selected={selectedIntervention}
                      onSelect={handleIntervention}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-ink rounded-lg border border-stadium overflow-hidden">
                <div className="bg-stadium px-4 py-3 border-b border-muted/20">
                  <h3 className="font-mono text-sm text-cream">Play-by-Play</h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto divide-y divide-muted/10">
                  {moments.length === 0 ? (
                    <p className="p-4 text-sm text-muted/60 font-mono text-center">
                      No plays yet
                    </p>
                  ) : (
                    moments.map((moment, i) => (
                      <PlayByPlayItem key={i} moment={moment} index={i} />
                    ))
                  )}
                </div>
              </div>

              <div className="bg-ink rounded-lg border border-stadium p-4">
                <h3 className="font-mono text-sm text-cream mb-3">Your Starters</h3>
                <div className="space-y-2">
                  {roster?.filter(r => r.role === 'starter').map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-2 px-3 bg-stadium rounded"
                    >
                      <div>
                        <p className="font-mono text-sm text-cream">{entry.players?.name}</p>
                        <p className="text-xs text-muted/60">{entry.players?.position}</p>
                      </div>
                      <span className="font-mono text-gold">{entry.players?.overall}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
