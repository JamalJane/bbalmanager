import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useRoster, useCoachingStaff } from '../hooks';
import { useCountUp } from '../hooks';
import PageHeader from '../components/PageHeader';
import { 
  simPossessions, 
  GAME_SPEEDS, 
  PLAYBOOK_CALLS, 
  getPlaybookForCoach,
  applyGMIntervention,
  checkAutoTimeoutNeeded 
} from '../lib/simEngine';
import { supabase } from '../lib/supabase';

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
    chemistry: 50,
    coaches: [],
  };
}

function MomentumMeter({ momentum }) {
  const normalizedMomentum = Math.max(-5, Math.min(5, momentum));
  const percentage = ((normalizedMomentum + 5) / 10) * 100;
  
  return (
    <div className="bg-stadium rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-muted uppercase">Momentum</span>
        <span className={`text-sm font-mono ${normalizedMomentum > 0 ? 'text-ember' : normalizedMomentum < 0 ? 'text-gold' : 'text-muted'}`}>
          {normalizedMomentum > 0 ? `Opponent +${normalizedMomentum}` : normalizedMomentum < 0 ? `You +${Math.abs(normalizedMomentum)}` : 'Neutral'}
        </span>
      </div>
      <div className="relative h-3 bg-ink rounded-full overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-muted/30" />
        <motion.div
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', damping: 20 }}
          className={`absolute top-0 h-full ${
            normalizedMomentum > 0 
              ? 'right-1/2 bg-ember' 
              : normalizedMomentum < 0 
                ? 'left-1/2 bg-gold' 
                : 'left-1/2 bg-muted w-1/2'
          }`}
        />
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-cream/50 -translate-x-1/2" />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted/60 font-mono">Your Run</span>
        <span className="text-[10px] text-muted/60 font-mono">Opponent Run</span>
      </div>
    </div>
  );
}

function SpeedSelector({ selected, onSelect }) {
  return (
    <div className="flex gap-2">
      {Object.entries(GAME_SPEEDS).map(([key, speed]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
            selected === key
              ? 'bg-gold text-stadium'
              : 'bg-stadium text-muted hover:text-cream border border-muted/30'
          }`}
        >
          {speed.label} ⚡
        </button>
      ))}
    </div>
  );
}

function PlaybookPanel({ coachSpecialty, onPlayCall, currentPlay, disabled }) {
  const plays = getPlaybookForCoach(coachSpecialty);
  
  if (plays.length === 0) {
    return (
      <div className="bg-stadium rounded-lg p-4">
        <p className="text-xs text-muted/60 font-mono mb-3">Playbook</p>
        <p className="text-sm text-muted font-mono">Hire a coach to unlock playbook calls</p>
      </div>
    );
  }
  
  return (
    <div className="bg-stadium rounded-lg p-4">
      <p className="text-xs text-muted/60 font-mono mb-3">Playbook</p>
      <div className="flex flex-wrap gap-2">
        {plays.map(play => (
          <button
            key={play.id}
            onClick={() => onPlayCall(play)}
            disabled={disabled}
            className={`px-3 py-2 rounded text-xs font-mono transition-all ${
              currentPlay === play.id
                ? 'bg-gold text-stadium'
                : disabled
                  ? 'bg-ink text-muted/40 cursor-not-allowed'
                  : 'bg-ink text-cream hover:bg-ink/80 border border-gold/30 hover:border-gold'
            }`}
          >
            {play.icon} {play.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function AutoTimeoutPopup({ message, onUseTimeout, onLetRide, timeLeft }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-ink border-2 border-ember rounded-xl p-8 max-w-md text-center shadow-2xl"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          ⚠️
        </motion.div>
        <h3 className="font-display text-2xl text-ember mb-2">RUN DETECTED!</h3>
        <p className="font-mono text-cream/80 mb-6">{message}</p>
        
        <div className="mb-4">
          <div className="h-2 bg-stadium rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 5) * 100}%` }}
              className="h-full bg-ember"
            />
          </div>
          <p className="text-xs text-muted font-mono mt-1">{timeLeft}s</p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUseTimeout}
            className="flex-1 py-3 bg-gold text-stadium font-mono uppercase tracking-wider rounded-lg font-bold"
          >
            ⏸️ Use Timeout
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLetRide}
            className="flex-1 py-3 bg-stadium text-cream font-mono uppercase tracking-wider rounded-lg border border-muted/30"
          >
            🎲 Let it Ride
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuarterScores({ quarterScores, currentQuarter }) {
  return (
    <div className="flex justify-center gap-4 mt-4">
      {[1, 2, 3, 4].map(q => (
        <div
          key={q}
          className={`text-center px-3 py-1 rounded ${
            q === currentQuarter
              ? 'bg-gold/20 border border-gold'
              : q < currentQuarter
                ? 'bg-stadium'
                : 'bg-stadium/50'
          }`}
        >
          <p className={`text-xs font-mono ${q <= currentQuarter ? 'text-muted' : 'text-muted/40'}`}>Q{q}</p>
          <p className={`text-sm font-mono ${q <= currentQuarter ? 'text-cream' : 'text-muted/40'}`}>
            {q <= currentQuarter ? `${quarterScores?.home[q-1] || 0} - ${quarterScores?.away[q-1] || 0}` : '-'}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlayByPlayFeed({ plays, keyMoments }) {
  const allEvents = [
    ...plays.map(p => ({ ...p, type: 'play', sortTime: p.possession })),
    ...keyMoments.map(m => ({ ...m, type: 'moment', sortTime: m.quarter * 1000 })),
  ].sort((a, b) => b.sortTime - a.sortTime);

  return (
    <div className="space-y-1">
      {allEvents.slice(0, 15).map((event, i) => {
        if (event.type === 'moment') {
          return (
            <motion.div
              key={`moment-${i}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-2 rounded border-l-2 ${
                event.event_type === 'momentum_swing' ? 'bg-ember/10 border-ember' :
                event.event_type === 'career_night' ? 'bg-gold/10 border-gold' :
                event.event_type === 'clutch_moment' ? 'bg-ember/10 border-ember' :
                event.event_type === 'injury_scare' ? 'bg-rust/10 border-rust' :
                'bg-stadium border-muted'
              }`}
            >
              <p className={`text-xs font-mono ${
                event.event_type === 'momentum_swing' ? 'text-ember' :
                event.event_type === 'career_night' ? 'text-gold' :
                event.event_type === 'clutch_moment' ? 'text-ember' :
                event.event_type === 'injury_scare' ? 'text-rust' :
                'text-muted'
              }`}>
                {event.description}
              </p>
            </motion.div>
          );
        }
        
        const playEmoji = {
          dunk: '💪',
          jump_shot: '🏀',
          three_pointer: '🎯',
          turnover: '❌',
          missed_shot: '🤷',
          blocked_shot: '🛑',
        }[event.playType] || '🏀';
        
        return (
          <motion.div
            key={`play-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 py-1 px-2 text-xs font-mono"
          >
            <span className="text-muted/60 w-16">{event.time}</span>
            <span>{playEmoji}</span>
            <span className="text-cream/80 flex-1">
              {event.player} - {event.playType.replace('_', ' ')}
            </span>
            <span className="text-muted">
              {event.homeScore}-{event.awayScore}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function GameDay() {
  const navigate = useNavigate();
  const { gameState, activeTeam, activeSeason, addGameFeedItem, updateGameState, gmProfile } = useGame();
  const { data: roster } = useRoster(activeTeam?.id || null);
  const { data: coaches } = useCoachingStaff(activeTeam?.id || null);
  
  const [liveGame, setLiveGame] = useState(null);
  const [gameSpeed, setGameSpeed] = useState('standard');
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [currentPlay, setCurrentPlay] = useState(null);
  const [gameProgress, setGameProgress] = useState(0);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [momentum, setMomentum] = useState(0);
  const [timeoutsLeft, setTimeoutsLeft] = useState(6);
  const [showAutoTimeout, setShowAutoTimeout] = useState(false);
  const [autoTimeoutMessage, setAutoTimeoutMessage] = useState('');
  const [autoTimeoutTimeLeft, setAutoTimeoutTimeLeft] = useState(5);
  const [runPoints, setRunPoints] = useState(0);
  
  const timeoutRef = useRef(null);
  const autoTimeoutIntervalRef = useRef(null);
  
  const gmStyle = gmProfile?.rep_archetype || 'rebuilder';
  const isHome = activeTeam?.id === liveGame?.home_team?.id;
  
  const mainCoach = coaches?.find(c => c.specialty);
  const coachSpecialty = mainCoach?.specialty || null;

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
    if (!activeTeam?.id || !activeSeason?.id || liveGame !== null) return;
    
    const ensureGame = async () => {
      const { data: pending } = await supabase
        .from('game_log')
        .select('id')
        .or(`home_team_id.eq.${activeTeam.id},away_team_id.eq.${activeTeam.id}`)
        .eq('season_id', activeSeason.id)
        .is('home_score', null)
        .limit(1);
      if (pending && pending.length > 0) return;

      const { data: opponents } = await supabase
        .from('teams')
        .select('id, name, city, color_primary')
        .neq('id', activeTeam.id)
        .limit(30);
      if (!opponents || opponents.length === 0) return;

      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const { data: homeData } = await supabase
        .from('teams')
        .select('id, name, city, color_primary')
        .eq('id', activeTeam.id)
        .single();

      if (homeData) {
        setLiveGame({
          id: 'ad-hoc-' + Date.now(),
          home_team: homeData,
          away_team: opponent,
          home_score: 0,
          away_score: 0,
          status: 'scheduled',
          isAdHoc: true,
        });
      }
    };
    ensureGame();
  }, [activeTeam?.id, activeSeason?.id, liveGame]);

  const handlePlayCall = useCallback((play) => {
    setCurrentPlay(play);
  }, []);

  const handleUseTimeout = useCallback(() => {
    setTimeoutsLeft(prev => Math.max(0, prev - 1));
    setMomentum(0);
    setRunPoints(0);
    setShowAutoTimeout(false);
    if (autoTimeoutIntervalRef.current) {
      clearInterval(autoTimeoutIntervalRef.current);
    }
  }, []);

  const handleLetRide = useCallback(() => {
    setShowAutoTimeout(false);
    if (autoTimeoutIntervalRef.current) {
      clearInterval(autoTimeoutIntervalRef.current);
    }
  }, []);

  const handlePlayGame = useCallback(async () => {
    if (!liveGame || !activeTeam || !activeSeason || isSimulating) return;
    if (!roster || roster.length === 0) {
      alert('Roster not loaded yet. Please wait a moment and try again.');
      return;
    }
    
    setIsSimulating(true);
    setGameResult(null);
    setCurrentPlay(null);
    setMomentum(0);
    setTimeoutsLeft(6);
    setRunPoints(0);
    setCurrentQuarter(1);
    setGameProgress(0);
    
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
      
      if (coaches && coaches.length > 0) {
        homeTeam.coaches = coaches;
      }

      const result = simPossessions(homeTeam, awayTeam, {
        speed: gameSpeed,
        homeCoachSpecialty: coachSpecialty,
        gmStyle,
      });

      const won = isHome ? result.homeScore > result.awayScore : result.awayScore > result.homeScore;
      
      const liveMoments = [];
      let currentRunPoints = 0;
      let runDirection = 0;
      
      for (let i = 0; i < result.playByPlay.length; i++) {
        const play = result.playByPlay[i];
        setGameProgress((i + 1) / result.playByPlay.length);
        setCurrentQuarter(Math.ceil((i + 1) / (result.playByPlay.length / 4)));
        
        setMomentum(play.momentum);
        
        if (play.points > 0) {
          if (play.team === (isHome ? liveGame.home_team.name : liveGame.away_team.name)) {
            currentRunPoints += play.points;
            runDirection = 1;
          } else {
            currentRunPoints = play.points;
            runDirection = -1;
          }
        }
        
        setRunPoints(currentRunPoints * runDirection);
        
        if (Math.abs(currentRunPoints) >= 6 && !showAutoTimeout) {
          const check = checkAutoTimeoutNeeded({ 
            momentum: play.momentum, 
            opponentRunPoints: Math.abs(currentRunPoints) 
          });
          if (check.needed && check.direction === 'against') {
            setAutoTimeoutMessage(check.message);
            setAutoTimeoutTimeLeft(5);
            setShowAutoTimeout(true);
            
            autoTimeoutIntervalRef.current = setInterval(() => {
              setAutoTimeoutTimeLeft(prev => {
                if (prev <= 1) {
                  handleLetRide();
                  return 5;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
        
        if (GAME_SPEEDS[gameSpeed].delay > 100) {
          await new Promise(resolve => setTimeout(resolve, GAME_SPEEDS[gameSpeed].delay));
        }
      }

      setGameResult({
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        won,
        quarterScores: result.quarterScores,
        moments: result.moments,
        plays: result.playByPlay,
        opponentBonus: result.opponentBonus,
      });

      setLiveGame(prev => ({
        ...prev,
        home_score: result.homeScore,
        away_score: result.awayScore,
        status: 'completed',
      }));

      if (!liveGame.isAdHoc) {
        const { error: updateError } = await supabase
          .from('game_log')
          .update({ home_score: result.homeScore, away_score: result.awayScore })
          .eq('id', liveGame.id);
        if (updateError) throw updateError;

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
      setShowAutoTimeout(false);
      if (autoTimeoutIntervalRef.current) {
        clearInterval(autoTimeoutIntervalRef.current);
      }
    }
  }, [liveGame, activeTeam, activeSeason, isSimulating, roster, coaches, gameSpeed, coachSpecialty, gmStyle, addGameFeedItem, updateGameState, gameState.teamRecord, showAutoTimeout, handleLetRide]);

  const homeScore = useCountUp(gameResult?.homeScore || liveGame?.home_score || 0, 1000);
  const awayScore = useCountUp(gameResult?.awayScore || liveGame?.away_score || 0, 1000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <AnimatePresence>
        {showAutoTimeout && (
          <AutoTimeoutPopup
            message={autoTimeoutMessage}
            onUseTimeout={handleUseTimeout}
            onLetRide={handleLetRide}
            timeLeft={autoTimeoutTimeLeft}
          />
        )}
      </AnimatePresence>

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

          <div className="flex items-center justify-between">
            <SpeedSelector selected={gameSpeed} onSelect={setGameSpeed} />
            {isSimulating && (
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-stadium rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${gameProgress * 100}%` }}
                    className="h-full bg-gold"
                  />
                </div>
                <span className="text-xs font-mono text-muted">
                  {Math.round(gameProgress * 100)}%
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-ink rounded-lg border border-stadium overflow-hidden">
                <div className="bg-stadium px-6 py-4 border-b border-muted/20">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-sm font-mono rounded ${
                      liveGame?.status === 'live' ? 'bg-ember/20 text-ember' :
                      liveGame?.status === 'completed' ? 'bg-gold/20 text-gold' :
                      'bg-muted/20 text-muted'
                    }`}>
                      {liveGame?.status === 'completed' ? 'FINAL' : 
                       liveGame?.status === 'live' ? 'LIVE' : 
                       'SCHEDULED'}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      {liveGame?.home_team?.city} vs {liveGame?.away_team?.city}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center flex-1">
                      <p className="font-display text-lg text-cream mb-1">
                        {isHome ? liveGame?.home_team?.city : liveGame?.away_team?.city}
                      </p>
                      <p className="font-mono text-5xl text-gold" key={homeScore}>
                        {homeScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-2xl text-muted">vs</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="font-display text-lg text-cream mb-1">
                        {isHome ? liveGame?.away_team?.city : liveGame?.home_team?.city}
                      </p>
                      <p className="font-mono text-5xl text-gold" key={awayScore}>
                        {awayScore}
                      </p>
                    </div>
                  </div>
                  
                  <QuarterScores 
                    quarterScores={gameResult?.quarterScores} 
                    currentQuarter={currentQuarter}
                  />
                </div>
              </div>

              <MomentumMeter momentum={momentum} />

              <PlaybookPanel 
                coachSpecialty={coachSpecialty}
                onPlayCall={handlePlayCall}
                currentPlay={currentPlay?.id}
                disabled={isSimulating || liveGame?.status === 'completed'}
              />

              <div className="bg-ink rounded-lg border border-stadium p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-sm text-cream">GM Actions</h3>
                  <span className="text-xs font-mono text-muted">
                    Timeouts: {timeoutsLeft}/6
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (timeoutsLeft > 0) {
                        handleUseTimeout();
                      }
                    }}
                    disabled={timeoutsLeft === 0 || isSimulating || liveGame?.status === 'completed'}
                    className="flex-1 py-2 px-3 bg-stadium text-cream rounded font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink"
                  >
                    ⏸️ Timeout ({timeoutsLeft})
                  </button>
                  <button
                    disabled={isSimulating || liveGame?.status === 'completed'}
                    className="flex-1 py-2 px-3 bg-stadium text-cream rounded font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink"
                  >
                    ↻ Substitution
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-ink rounded-lg border border-stadium overflow-hidden">
                <div className="bg-stadium px-4 py-3 border-b border-muted/20">
                  <h3 className="font-mono text-sm text-cream">
                    {isSimulating ? 'Live ' : ''}Play-by-Play
                  </h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto p-4">
                  <PlayByPlayFeed 
                    plays={gameResult?.plays || []} 
                    keyMoments={gameResult?.moments || []}
                  />
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
