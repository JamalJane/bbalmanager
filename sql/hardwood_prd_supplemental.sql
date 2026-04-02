-- ============================================================
-- SUPPLEMENTAL TABLES FOR PRD v1.0 COMPLIANCE
-- Adds missing tables: dev_pathway_definitions, 
-- persona_pathway_compatibility, story_templates, 
-- chemistry_compatibility_matrix, quirk_pool, signature_move_pool,
-- hof_nominees, season_phases, playoff_brackets
-- ============================================================

-- ============================================================
-- DEVELOPMENT PATHWAY DEFINITIONS (8 pathways)
-- ============================================================

CREATE TABLE IF NOT EXISTS dev_pathway_definitions (
  id text primary key,
  name text not null,
  description text,
  tags text[],
  attributes text[],
  synergy_bonus numeric(3,2) default 1.5,
  conflict_penalty numeric(3,2) default 0.55
);

-- ============================================================
-- PERSONA-PATHWAY COMPATIBILITY MATRIX
-- ============================================================

CREATE TABLE IF NOT EXISTS persona_pathway_compatibility (
  id uuid primary key default gen_random_uuid(),
  persona_category text not null,
  pathway_id text not null references dev_pathway_definitions(id),
  synergy_multiplier numeric(3,2) default 1.0,
  conflict_multiplier numeric(3,2) default 1.0,
  notes text,
  unique (persona_category, pathway_id)
);

-- ============================================================
-- CHEMISTRY COMPATIBILITY MATRIX
-- ============================================================

CREATE TABLE IF NOT EXISTS chemistry_compatibility_matrix (
  id uuid primary key default gen_random_uuid(),
  persona_a text not null,
  persona_b text not null,
  ceiling int default 70,
  relationship_tendency text default 'neutral',
  unique (persona_a, persona_b)
);

-- ============================================================
-- STORY TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS story_templates (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  title text not null,
  description text not null,
  priority text default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  trigger_conditions jsonb default '{}',
  created_at timestamp default now()
);

-- ============================================================
-- QUIRK POOL (79 quirks)
-- ============================================================

CREATE TABLE IF NOT EXISTS quirk_pool (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  category text,
  rarity text default 'common' check (rarity in ('common', 'rare', 'legendary')),
  effect_type text,
  effect_value numeric
);

-- ============================================================
-- SIGNATURE MOVE POOL (40 named moves)
-- ============================================================

CREATE TABLE IF NOT EXISTS signature_move_pool (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  category text,
  difficulty int default 1 check (difficulty between 1 and 5),
  trigger_condition text
);

-- ============================================================
-- HOF NOMINEES
-- ============================================================

CREATE TABLE IF NOT EXISTS hof_nominees (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  season_id uuid references seasons(id),
  eligibility text default 'immediate' check (eligibility in ('immediate', 'wait_period', 'ineligible')),
  criteria_met int default 0,
  details jsonb default '{}',
  nominated_at timestamp default now()
);

-- ============================================================
-- SEASON PHASES
-- ============================================================

CREATE TABLE IF NOT EXISTS season_phases (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id),
  phase text not null check (phase in ('early', 'mid', 'late', 'playoffs', 'offseason')),
  week_start int not null,
  week_end int,
  is_active boolean default false,
  unique (season_id, phase)
);

-- ============================================================
-- PLAYOFF BRACKETS
-- ============================================================

CREATE TABLE IF NOT EXISTS playoff_brackets (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id),
  round int not null check (round between 1 and 3),
  matchup int not null,
  team_seed_1 int,
  team_seed_2 int,
  winner_id uuid references teams(id),
  games_won_1 int default 0,
  games_won_2 int default 0,
  is_complete boolean default false,
  unique (season_id, round, matchup)
);

-- ============================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================

ALTER TABLE dev_pathway_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_pathway_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemistry_compatibility_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quirk_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_move_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE hof_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE playoff_brackets ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "public_access_dev_pathways" ON dev_pathway_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_pathway_compat" ON persona_pathway_compatibility FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_chem_compat" ON chemistry_compatibility_matrix FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_story_templates" ON story_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_quirks" ON quirk_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_signature_moves" ON signature_move_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_hof_nominees" ON hof_nominees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_season_phases" ON season_phases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_playoff_brackets" ON playoff_brackets FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: DEVELOPMENT PATHWAY DEFINITIONS
-- ============================================================

INSERT INTO dev_pathway_definitions (id, name, description, tags, attributes) VALUES
('slasher', 'Slasher', 'Finishing, speed, athleticism', ARRAY['Relentless', 'Foul Magnet'], ARRAY['speed', 'points', 'athleticism']),
('sharpshooter', 'Sharpshooter', 'Shooting, off-ball movement', ARRAY['Hot Hand', 'Corner Specialist'], ARRAY['points', 'shooting_3pt', 'shooting_mid']),
('floor_general', 'Floor General', 'Playmaking, IQ', ARRAY['Dimer', 'Court Vision'], ARRAY['assists', 'speed', 'iq']),
('lockdown', 'Lockdown', 'Defense, any position', ARRAY['Pest', 'Stopper'], ARRAY['defense', 'speed', 'athleticism']),
('stretch_big', 'Stretch Big', 'Shooting for bigs', ARRAY['Floor Spacer', 'Face-Up Threat'], ARRAY['points', 'shooting_3pt', 'rebounds']),
('enforcer', 'Enforcer', 'Interior, rebounding', ARRAY['Brick Wall', 'Rim Protector'], ARRAY['rebounds', 'defense', 'strength']),
('facilitator', 'Facilitator', 'Passing, hustle', ARRAY['Glue Guy', 'Secondary Playmaker'], ARRAY['assists', 'hustle', 'speed']),
('two_way', 'Two-Way', 'Balanced growth', ARRAY['Swiss Army', 'Two-Way Player'], ARRAY['defense', 'points', 'speed'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: PERSONA-PATHWAY COMPATIBILITY
-- ============================================================

INSERT INTO persona_pathway_compatibility (persona_category, pathway_id, synergy_multiplier, conflict_multiplier, notes) VALUES
-- Raw Diamond
('raw_diamond', 'slasher', 1.4, 0.65, 'Athleticism development synergizes well'),
('raw_diamond', 'sharpshooter', 1.2, 0.7, 'Skill development takes longer'),
('raw_diamond', 'floor_general', 1.1, 0.75, 'IQ development is gradual'),
('raw_diamond', 'lockdown', 1.15, 0.7, 'Defensive instincts developing'),
('raw_diamond', 'stretch_big', 1.25, 0.65, 'Size advantage utilized'),
('raw_diamond', 'enforcer', 1.3, 0.6, 'Physical tools raw but trainable'),
('raw_diamond', 'facilitator', 1.2, 0.7, 'Team concepts learned'),
('raw_diamond', 'two_way', 1.35, 0.6, 'Balanced development works well'),

-- Quiet Assassin
('quiet_assassin', 'slasher', 1.3, 0.75, 'Efficient finishing'),
('quiet_assassin', 'sharpshooter', 1.5, 0.55, 'Perfect synergy - low maintenance scorer'),
('quiet_assassin', 'floor_general', 1.15, 0.8, 'Focus on own game'),
('quiet_assassin', 'lockdown', 1.25, 0.7, 'Multi-position defender'),
('quiet_assassin', 'stretch_big', 1.1, 0.8, 'Floor spacing ability'),
('quiet_assassin', 'enforcer', 0.9, 0.85, 'Not physical profile'),
('quiet_assassin', 'facilitator', 1.05, 0.9, 'Prefers scoring'),
('quiet_assassin', 'two_way', 1.2, 0.75, 'Balanced skill set'),

-- Locker Room Cancer
('locker_room_cancer', 'slasher', 1.2, 0.8, 'Iso-heavy style fits'),
('locker_room_cancer', 'sharpshooter', 1.1, 0.85, 'Shot-chucking works'),
('locker_room_cancer', 'floor_general', 0.7, 0.95, 'Needs to share ball'),
('locker_room_cancer', 'lockdown', 1.0, 0.9, 'Individual defense okay'),
('locker_room_cancer', 'stretch_big', 1.0, 0.9, 'Shot creation'),
('locker_room_cancer', 'enforcer', 1.2, 0.75, 'Physical play'),
('locker_room_cancer', 'facilitator', 0.5, 0.95, 'Cannot share ball'),
('locker_room_cancer', 'two_way', 0.85, 0.9, 'Team concept struggles'),

-- Underdog
('underdog', 'slasher', 1.4, 0.65, 'Relentless attacking style'),
('underdog', 'sharpshooter', 1.2, 0.75, 'Proving doubters wrong'),
('underdog', 'floor_general', 1.35, 0.65, 'Smart play style'),
('underdog', 'lockdown', 1.4, 0.6, 'Pest mentality perfect'),
('underdog', 'stretch_big', 1.2, 0.75, 'Surprise element'),
('underdog', 'enforcer', 1.3, 0.65, 'Hustle plays'),
('underdog', 'facilitator', 1.3, 0.7, 'Team-first mentality'),
('underdog', 'two_way', 1.4, 0.6, 'Versatile development'),

-- Fading Legend
('fading_legend', 'slasher', 0.75, 0.95, 'Athleticism declining'),
('fading_legend', 'sharpshooter', 1.15, 0.75, 'Efficiency over athleticism'),
('fading_legend', 'floor_general', 1.35, 0.65, 'Wisdom over athleticism'),
('fading_legend', 'lockdown', 1.05, 0.85, 'Experience matters'),
('fading_legend', 'stretch_big', 1.0, 0.9, 'Shot selection'),
('fading_legend', 'enforcer', 0.95, 0.9, 'Physical decline'),
('fading_legend', 'facilitator', 1.25, 0.7, 'Leadership style'),
('fading_legend', 'two_way', 0.95, 0.9, 'Declining athleticism'),

-- Franchise Cornerstone
('franchise_cornerstone', 'slasher', 1.3, 0.75, 'Alpha scoring style'),
('franchise_cornerstone', 'sharpshooter', 1.3, 0.7, 'Primary option shooting'),
('franchise_cornerstone', 'floor_general', 1.5, 0.55, 'Lead initiator'),
('franchise_cornerstone', 'lockdown', 1.2, 0.8, 'Two-way star'),
('franchise_cornerstone', 'stretch_big', 1.3, 0.7, 'Modern big'),
('franchise_cornerstone', 'enforcer', 1.2, 0.75, 'Physical presence'),
('franchise_cornerstone', 'facilitator', 1.35, 0.65, 'Team leader'),
('franchise_cornerstone', 'two_way', 1.4, 0.6, 'Complete player'),

-- Mercenary
('mercenary', 'slasher', 1.3, 0.75, 'Individual scoring'),
('mercenary', 'sharpshooter', 1.3, 0.75, 'Efficient scoring'),
('mercenary', 'floor_general', 1.1, 0.85, 'Needs to share ball'),
('mercenary', 'lockdown', 1.1, 0.85, 'Individual defense'),
('mercenary', 'stretch_big', 1.2, 0.8, 'Modern spacing'),
('mercenary', 'enforcer', 1.0, 0.9, 'Physical role'),
('mercenary', 'facilitator', 0.85, 0.95, 'Ball dominant'),
('mercenary', 'two_way', 1.1, 0.85, 'Versatile scorer'),

-- Late Bloomer
('late_bloomer', 'slasher', 1.2, 0.8, 'Athleticism late bloom'),
('late_bloomer', 'sharpshooter', 1.4, 0.6, 'Skill development'),
('late_bloomer', 'floor_general', 1.35, 0.65, 'IQ growth'),
('late_bloomer', 'lockdown', 1.15, 0.8, 'Defensive growth'),
('late_bloomer', 'stretch_big', 1.4, 0.6, 'Size-skill combo'),
('late_bloomer', 'enforcer', 1.15, 0.8, 'Physical growth'),
('late_bloomer', 'facilitator', 1.35, 0.65, 'Team understanding'),
('late_bloomer', 'two_way', 1.35, 0.65, 'Complete development')
ON CONFLICT (persona_category, pathway_id) DO NOTHING;

-- ============================================================
-- SEED: CHEMISTRY COMPATIBILITY MATRIX
-- ============================================================

INSERT INTO chemistry_compatibility_matrix (persona_a, persona_b, ceiling, relationship_tendency) VALUES
-- Raw Diamond pairs
('raw_diamond', 'franchise_cornerstone', 90, 'mentor'),
('raw_diamond', 'quiet_assassin', 80, 'growth'),
('raw_diamond', 'underdog', 85, 'competition'),
('raw_diamond', 'fading_legend', 85, 'mentor'),
('raw_diamond', 'facilitator', 80, 'growth'),
('raw_diamond', 'locker_room_cancer', 50, 'conflict'),
('raw_diamond', 'mercenary', 65, 'neutral'),
('raw_diamond', 'late_bloomer', 75, 'growth'),

-- Quiet Assassin pairs
('quiet_assassin', 'quiet_assassin', 75, 'balanced'),
('quiet_assassin', 'floor_general', 85, 'partnership'),
('quiet_assassin', 'franchise_cornerstone', 90, 'support'),
('quiet_assassin', 'lockdown', 85, 'defense'),
('quiet_assassin', 'locker_room_cancer', 45, 'tension'),
('quiet_assassin', 'mercenary', 60, 'neutral'),
('quiet_assassin', 'underdog', 75, 'respect'),
('quiet_assassin', 'facilitator', 80, 'balanced'),
('quiet_assassin', 'fading_legend', 80, 'respect'),
('quiet_assassin', 'late_bloomer', 70, 'neutral'),

-- Locker Room Cancer - low ceilings with most
('locker_room_cancer', 'locker_room_cancer', 40, 'rivalry'),
('locker_room_cancer', 'mercenary', 70, 'alliance'),
('locker_room_cancer', 'franchise_cornerstone', 45, 'conflict'),
('locker_room_cancer', 'quiet_assassin', 45, 'tension'),
('locker_room_cancer', 'floor_general', 40, 'conflict'),
('locker_room_cancer', 'underdog', 50, 'tension'),
('locker_room_cancer', 'fading_legend', 50, 'tension'),
('locker_room_cancer', 'facilitator', 40, 'conflict'),
('locker_room_cancer', 'raw_diamond', 50, 'conflict'),
('locker_room_cancer', 'late_bloomer', 45, 'conflict'),

-- Underdog - high ceilings
('underdog', 'underdog', 85, 'bond'),
('underdog', 'franchise_cornerstone', 85, 'bond'),
('underdog', 'facilitator', 85, 'bond'),
('underdog', 'quiet_assassin', 75, 'respect'),
('underdog', 'fading_legend', 80, 'mentor'),
('underdog', 'floor_general', 80, 'growth'),
('underdog', 'late_bloomer', 80, 'bond'),
('underdog', 'raw_diamond', 85, 'competition'),

-- Fading Legend
('fading_legend', 'fading_legend', 75, 'bond'),
('fading_legend', 'franchise_cornerstone', 85, 'bond'),
('fading_legend', 'facilitator', 85, 'bond'),
('fading_legend', 'floor_general', 85, 'bond'),
('fading_legend', 'quiet_assassin', 80, 'respect'),
('fading_legend', 'underdog', 80, 'mentor'),
('fading_legend', 'late_bloomer', 80, 'mentor'),
('fading_legend', 'raw_diamond', 85, 'mentor'),

-- Franchise Cornerstone - highest ceilings
('franchise_cornerstone', 'franchise_cornerstone', 75, 'competition'),
('franchise_cornerstone', 'floor_general', 90, 'partnership'),
('franchise_cornerstone', 'quiet_assassin', 90, 'partnership'),
('franchise_cornerstone', 'facilitator', 90, 'bond'),
('franchise_cornerstone', 'fading_legend', 85, 'bond'),
('franchise_cornerstone', 'underdog', 85, 'bond'),
('franchise_cornerstone', 'raw_diamond', 90, 'mentor'),
('franchise_cornerstone', 'late_bloomer', 85, 'bond'),

-- Mercenary - neutral to low
('mercenary', 'mercenary', 60, 'competition'),
('mercenary', 'quiet_assassin', 60, 'neutral'),
('mercenary', 'franchise_cornerstone', 60, 'neutral'),
('mercenary', 'floor_general', 55, 'neutral'),
('mercenary', 'underdog', 65, 'neutral'),
('mercenary', 'fading_legend', 60, 'neutral'),
('mercenary', 'facilitator', 55, 'neutral'),
('mercenary', 'raw_diamond', 65, 'neutral'),
('mercenary', 'late_bloomer', 60, 'neutral'),

-- Late Bloomer
('late_bloomer', 'late_bloomer', 80, 'bond'),
('late_bloomer', 'underdog', 80, 'bond'),
('late_bloomer', 'franchise_cornerstone', 85, 'bond'),
('late_bloomer', 'fading_legend', 85, 'mentor'),
('late_bloomer', 'facilitator', 80, 'growth'),
('late_bloomer', 'floor_general', 80, 'growth'),
('late_bloomer', 'quiet_assassin', 70, 'respect'),
('late_bloomer', 'raw_diamond', 75, 'growth')
ON CONFLICT (persona_a, persona_b) DO NOTHING;

-- ============================================================
-- SEED: STORY TEMPLATES (55+ across 12 event types)
-- ============================================================

INSERT INTO story_templates (event_type, title, description, priority) VALUES
-- Pathway Switch (6)
('pathway_switch', 'Dev Assignment Needed', '{player} needs pathway assignment after {weeks} weeks.', 'medium'),
('pathway_switch', 'Coach Recommendation', 'Staff recommends {pathway} for {player}.', 'medium'),
('pathway_switch', 'Bottleneck Alert', 'Development stalled for {player} - pathway required.', 'high'),
('pathway_switch', 'Potential Warning', '{player} ceiling limited without direction.', 'medium'),
('pathway_switch', 'Scout Report', '{player} needs focus. {pathway} suggested.', 'low'),
('pathway_switch', 'Decision Time', '{player} ready for pathway choice.', 'medium'),

-- Breakout Game (8)
('breakout_game', 'Career Night', '{player} explodes for {points} points!', 'high'),
('breakout_game', 'Statement Performance', '{player} announces arrival with {points} points.', 'high'),
('breakout_game', 'Breakout Alert', '{player} drops {points} - best game of career.', 'medium'),
('breakout_game', 'Rising Star', 'The league notices {player} after {points}-point game.', 'medium'),
('breakout_game', 'Dominant Display', '{player} unstoppable with {points} and {assists} assists.', 'high'),
('breakout_game', 'Expected Emergence', 'Scouts predicted this: {player} breaks out.', 'low'),
('breakout_game', 'From Shadows', '{player} steps into spotlight with {points} points.', 'medium'),
('breakout_game', 'Milestone Night', 'Career-high {points} for {player}.', 'medium'),

-- Persona Conflict (7)
('persona_conflict', 'Tension Rising', '{player1} vs {player2} - locker room tension.', 'high'),
('persona_conflict', 'Style Clash', '{player1} ({persona1}) vs {player2} ({persona2}).', 'medium'),
('persona_conflict', 'Near Altercation', '{player1} and {player2} nearly come to blows.', 'high'),
('persona_conflict', 'Trade Demand', '{player1} blames {player2} for struggles.', 'high'),
('persona_conflict', 'Patience Gone', '{player1} frustrated with {player2} style.', 'medium'),
('persona_conflict', 'Toxic Pairing', '{player1}-{player2} chemistry at dangerous low.', 'high'),
('persona_conflict', 'Mediation Needed', 'Coaches step in between {player1} and {player2}.', 'medium'),

-- Position Shift (6)
('position_shift', 'Position Change', '{player} tested at {newPosition}.', 'medium'),
('position_shift', 'Tactical Shift', '{player} moves to {newPosition} role.', 'medium'),
('position_shift', 'Future Vision', 'Staff sees {player} as future {newPosition}.', 'low'),
('position_shift', 'Experiment Time', '{player} getting reps at {newPosition}.', 'medium'),
('position_shift', 'Position Debate', 'Should {player} play {newPosition}?', 'low'),
('position_shift', 'Versatility Test', '{player} shows promise at {newPosition}.', 'medium'),

-- Controversial Trade (7)
('controversial_trade', 'Mixed Reactions', 'Fan reaction to {player} trade split.', 'medium'),
('controversial_trade', 'Former Player Speaks', '{player} addresses trade on social media.', 'medium'),
('controversial_trade', 'Trade Debate', 'Experts still debating {player} trade.', 'low'),
('controversial_trade', 'Blockbuster Analysis', 'Breaking down the {player} deal.', 'medium'),
('controversial_trade', 'Social Media Storm', 'NBA Twitter reacts to {player} trade.', 'low'),
('controversial_trade', 'Grade Report', 'Experts give {player} trade grade: {grade}.', 'medium'),
('controversial_trade', 'Inside the Deal', 'How {player} trade came together.', 'low'),

-- Dev League Ready (8)
('dev_league_ready', 'Ready for Call-Up', '{player} readiness score: {score}. Promotion imminent?', 'high'),
('dev_league_ready', 'G-League Complete', '{player} NBA-ready after development.', 'high'),
('dev_league_ready', 'Scout Recommendation', 'Promote {player} to main roster.', 'medium'),
('dev_league_ready', 'Dominant Performance', '{player} too good for development league.', 'medium'),
('dev_league_ready', 'Roster Spot Available', '{player} deserves NBA minutes.', 'medium'),
('dev_league_ready', 'Development Complete', 'Staff satisfied with {player} progress.', 'low'),
('dev_league_ready', 'Elite Potential', '{player} shows star-level ability.', 'high'),
('dev_league_ready', 'Next Step', '{player} ready for the big stage.', 'medium'),

-- Momentum Swing (8)
('momentum_swing', 'Run Started', '{team} goes on {points}-2 run.', 'medium'),
('momentum_swing', 'Momentum Shift', 'Game turning in favor of {team}.', 'medium'),
('momentum_swing', 'Spark Plug', '{player} sparks crucial run.', 'low'),
('momentum_swing', 'Rally Time', '{team} with 15-5 run that changes game.', 'medium'),
('momentum_swing', 'Crowd Energized', '{team} run has arena on feet.', 'low'),
('momentum_swing', 'Unstoppable', "{player} can't miss! {team} on {points}-0 run.", 'medium'),
('momentum_swing', 'Lead Evaporates', '{team} watches lead disappear with run.', 'medium'),
('momentum_swing', 'Spark Recaptured', '{team} reclaims momentum with surge.', 'low'),

-- Clutch Moment (8)
('clutch_moment', 'For All Marbles', '{player} calls for ball in closing seconds.', 'high'),
('clutch_moment', 'Crunch Time', '{player} has ball, season on line.', 'high'),
('clutch_moment', 'Pressure Moment', '{player} embraces the moment.', 'medium'),
('clutch_moment', 'Game Winner', '{player} rises up for potentially winning shot...', 'high'),
('clutch_moment', 'Hero Ball', 'Down to wire - {player} chance to be hero.', 'medium'),
('clutch_moment', 'Crowd Holds Breath', '{player} brings ball up slowly.', 'medium'),
('clutch_moment', 'Clutch Shot', '{player} delivers with step-back jumper!', 'high'),
('clutch_moment', 'Free Throws', '{player} ice in veins - seals it at line.', 'medium'),

-- Injury Scare (8)
('injury_scare', 'Scary Moment', '{player} grabs leg after play.', 'high'),
('injury_scare', 'Goes Down', 'Scary moment as {player} stays down.', 'high'),
('injury_scare', 'Limps Off', '{player} shaken but walks off.', 'medium'),
('injury_scare', 'Collective Gasp', '{player} needs medical attention.', 'high'),
('injury_scare', 'Tweak Report', '{player} looked to have tweaked something.', 'medium'),
('injury_scare', 'Medical Timeout', '{player} receives trainer attention.', 'medium'),
('injury_scare', 'Shakes It Off', '{player} recovers and stays in.', 'low'),
('injury_scare', 'Update Pending', 'Status of {player} still being evaluated.', 'high'),

-- Persona Revealed (7)
('persona_revealed', 'Persona Clear', '{player} revealed as {persona}.', 'medium'),
('persona_revealed', 'Identity Confirmed', 'The scouting report on {player} is complete.', 'medium'),
('persona_revealed', 'Style Crystallized', '{player} identity confirmed: {persona}.', 'low'),
('persona_revealed', 'Analysis Complete', 'Persona analysis done: {player} is {persona}.', 'medium'),
('persona_revealed', 'Long-term Scout', 'After weeks: {player} is a {persona}.', 'medium'),
('persona_revealed', 'Label Fits', 'What we suspected confirmed: {player} = {persona}.', 'low'),
('persona_revealed', 'Clarity Emerges', '{player} play style explained by {persona} tag.', 'medium'),

-- Season Start (6)
('season_start', 'Season Begins', '{team} tips off new season at {wins}-{losses}.', 'medium'),
('season_start', 'New Campaign', '{team} targets playoffs in {year}.', 'low'),
('season_start', '24-Game Gauntlet', 'The grind starts. {team} has 24 weeks.', 'medium'),
('season_start', 'Tip-Off', 'Season tip-off! {team} kicks off tonight.', 'medium'),
('season_start', 'Championship Run', '{team} locked and loaded for title push.', 'low'),
('season_start', 'Training Camp', '{team} opens camp with championship hopes.', 'low'),

-- Playoff Push (8)
('playoff_push', 'Final Stretch', '{team} needs {needed} wins in {remaining} to make playoffs.', 'high'),
('playoff_push', 'Race Heating Up', '{team} in {seed} seed with {remaining} to go.', 'medium'),
('playoff_push', 'Crunch Time', 'Postseason within reach for {team}.', 'medium'),
('playoff_push', 'Magic Number', '{needed} wins needed. {team} controls destiny.', 'high'),
('playoff_push', 'Must Win', '{team} faces must-win vs {opponent}.', 'high'),
('playoff_push', 'Probability Up', 'Playoff odds spike for {team} after win streak.', 'medium'),
('playoff_push', 'Seed Locked', '{team} clinches {seed} seed with clutch win.', 'high'),
('playoff_push', 'Home Court', '{team} secures home court advantage.', 'high'),

-- Championship Win (7)
('championship_win', 'Champions!', '{team} wins championship! {player} Finals MVP.', 'critical'),
('championship_win', 'Dynasty Complete', '{team} dynasty with dominant Finals.', 'critical'),
('championship_win', 'Trophy Time', '{team} wins it all!', 'critical'),
('championship_win', 'Legendary Performance', '{player} delivers in clinching game.', 'critical'),
('championship_win', 'History Made', '{team} celebrates championship triumph.', 'critical'),
('championship_win', 'Confetti Falls', '{team} crowned champions.', 'critical'),
('championship_win', 'City Erupts', '{team} are {year} champions!', 'critical'),

-- Trade Demand (5)
('trade_demand', 'Request Submitted', '{player} has requested a trade.', 'high'),
('trade_demand', 'Breaking News', 'Sources: {player} wants out.', 'high'),
('trade_demand', 'Camp Notification', '{player} camp informed team of trade desire.', 'medium'),
('trade_demand', 'Era Ending', '{player} time in {team} appears over.', 'medium'),
('trade_demand', 'Preferred Destinations', '{player} has list of preferred teams.', 'medium'),

-- All-Star Selection (5)
('all_star_selection', 'All-Star', '{player} voted All-Star!', 'high'),
('all_star_selection', 'Well Earned', '{player} deserves All-Star nod.', 'medium'),
('all_star_selection', 'Reserves Announced', '{player} makes All-Star team.', 'high'),
('all_star_selection', 'Elite Company', '{player} joins All-Star ranks.', 'medium'),
('all_star_selection', 'Career Milestone', '{player} named to {year} All-Star team.', 'high'),

-- GM Reputation (4)
('gm_reputation_change', 'Reputation Building', "{gm}'s {rep_type} approach winning respect.", 'low'),
('gm_reputation_change', 'Executive Survey', "{gm} rated among top {rep_type} GMs.", 'medium'),
('gm_reputation_change', 'League Standings', "{gm}'s {rep_type} tactics noted.", 'low'),
('gm_reputation_change', 'Trade Leverage', "{gm}'s {rep_type} reputation opens doors.", 'medium'),

-- Contract Extension (4)
('contract_extension', 'Extension Signed', '{player} signs {years}-year deal!', 'high'),
('contract_extension', 'Deal Done', '{player} commits future to {team}.', 'medium'),
('contract_extension', 'Security', '{player} locks in long-term with {team}.', 'medium'),
('contract_extension', 'Loyalty Pays', '{player} stays with {team} for the long haul.', 'medium'),

-- Free Agency (4)
('free_agency_signing', 'Signing Complete', '{player} agrees to terms with {team}!', 'high'),
('free_agency_signing', 'Blockbuster', '{player} picks {team} over other suitors.', 'high'),
('free_agency_signing', 'Official', '{player} makes move official.', 'medium'),
('free_agency_signing', 'Market Winner', '{player} sweepstakes over: {team} wins.', 'medium')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: QUIRK POOL (Sample 30 quirks)
-- ============================================================

INSERT INTO quirk_pool (name, description, category, rarity, effect_type, effect_value) VALUES
('Clutch Performer', 'Rises in crucial moments', 'mental', 'rare', 'clutch_bonus', 0.1),
('Iron Man', 'Rarely misses games', 'durability', 'common', 'injury_resist', 0.15),
('Frequent Foul Trouble', 'Prone to early fouls', 'negative', 'common', 'foul_rate', 0.2),
('Slow Starter', 'Takes time to heat up', 'mental', 'common', 'first_half_penalty', 0.1),
('Fourth Quarter Monster', 'Gets better as game progresses', 'mental', 'rare', 'fourth_quarter_bonus', 0.15),
('Homecourt Hero', 'Plays better at home', 'situational', 'common', 'home_bonus', 0.08),
('Road Warrior', 'Excels in hostile environments', 'situational', 'common', 'away_bonus', 0.08),
('Locker Room Cancer', 'Negatively affects team morale', 'negative', 'legendary', 'morale_penalty', -0.15),
('Team Leader', 'Boosts team morale', 'positive', 'rare', 'morale_boost', 0.1),
('Workhorse', 'Handles heavy minutes well', 'stamina', 'common', 'stamina_bonus', 0.1),
('Perimeter Pest', 'Annoying defender', 'defensive', 'common', 'steal_bonus', 0.05),
('Shot Blocker', 'Protects the rim', 'defensive', 'common', 'block_bonus', 0.1),
('Rebounding Machine', 'Dominates the boards', 'rebounding', 'common', 'rebound_bonus', 0.1),
('3PT Specialist', 'Deadly from deep', 'shooting', 'common', 'three_pt_bonus', 0.08),
('Midrange Assassin', 'Unstoppable in mid-range', 'shooting', 'common', 'midrange_bonus', 0.08),
('Finishing Machine', 'Dominant at the rim', 'finishing', 'common', 'finish_bonus', 0.1),
('Floor General', 'Elevates team play', 'playmaking', 'rare', 'assist_bonus', 0.1),
('Pick and Roll Master', 'Excels in PnR situations', 'offense', 'common', 'pnr_bonus', 0.1),
('Transition Threat', 'Lethal in fast break', 'offense', 'common', 'transition_bonus', 0.1),
('Isolation Expert', 'Wins in iso situations', 'offense', 'common', 'iso_bonus', 0.08),
('Help Defender', 'Reads passing lanes', 'defensive', 'common', 'help_defense', 0.08),
('Communication King', 'Leads defensive rotations', 'defensive', 'rare', 'defensive_boost', 0.1),
('Practice Warrior', 'Gets better through reps', 'development', 'common', 'dev_bonus', 0.05),
('Quick Learner', 'Picks up concepts fast', 'development', 'rare', 'dev_bonus', 0.1),
('High Motor', 'Never stops moving', 'effort', 'common', 'hustle_bonus', 0.1),
('Pace Controller', 'Sets offensive tempo', 'playmaking', 'rare', 'pace_control', 0.08),
('Clutch Free Throws', 'Nails FTs when it counts', 'shooting', 'common', 'clutch_ft_bonus', 0.1),
('Chill Vibes', 'Keeps team relaxed', 'mental', 'common', 'pressure_penalty', -0.05),
('Attention Seeker', 'Needs to be the star', 'mental', 'common', 'ballhog_tendency', 0.1),
('Veteran Presence', 'Steadies young teammates', 'positive', 'rare', 'youth_dev_bonus', 0.08)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: SIGNATURE MOVE POOL (20 sample moves)
-- ============================================================

INSERT INTO signature_move_pool (name, description, category, difficulty, trigger_condition) VALUES
('Step-Back Jumper', 'Signature step-back three-pointer', 'shooting', 4, 'isolation'),
('Post Fadeaway', 'Unguardable post move', 'scoring', 3, 'post_up'),
('Spin Move', 'Devastating spin into the lane', 'finishing', 3, 'driving'),
('Euro Step', 'Shifty finishing move', 'finishing', 2, 'driving'),
('Shamgod', 'Devastating dribble move', 'dribbling', 5, 'isolation'),
('Float Game', 'Soft touch in the lane', 'finishing', 3, 'driving'),
('Post Up and Spin', 'Classic big man move', 'scoring', 3, 'post_up'),
('Pull-Up Jumper', 'Quick release mid-range', 'shooting', 2, 'pick_roll'),
('Corner Three', 'Catch-and-shoot specialist', 'shooting', 2, 'off_ball'),
('Free Throw Line Jumper', 'Signature mid-range', 'shooting', 4, 'isolation'),
('Up and Under', 'Classic post move', 'scoring', 3, 'post_up'),
('Hesi Pull-Up', ' hesitation into pull-up', 'shooting', 4, 'pick_roll'),
('Dunk Package', 'Varied dunk attempts', 'finishing', 2, 'transition'),
('Floater', 'Soft touch over bigs', 'finishing', 2, 'driving'),
('One-Legged Jumper', 'Leaners from any angle', 'shooting', 4, 'isolation'),
('Alley-Oop Finish', 'Lob finisher', 'finishing', 2, 'transition'),
('Rip Through', 'Draws contact on shots', 'finishing', 3, 'isolation'),
('Fadeaway Three', 'Contested deep shot', 'shooting', 5, 'isolation'),
('Pump Fake', 'Free throw line extension', 'scoring', 2, 'isolation'),
('Layup Package', 'Varied finishing at rim', 'finishing', 2, 'driving')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- UPDATE SEASONS FOR 24 GAMES
-- ============================================================

UPDATE seasons SET games_per_season = 24 WHERE games_per_season != 24;
