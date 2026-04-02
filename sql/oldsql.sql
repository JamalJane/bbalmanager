-- ============================================================
-- HARDWOOD MANAGER — ADDITIVE MIGRATION v2
-- Run this AFTER hardwood_complete.sql
-- Adds: dev pathways, story templates, sim engine tables,
--       game view mode preference
-- ============================================================


-- ============================================================
-- 1. ADD DEV PATHWAY TO ROSTERS
-- Each roster slot gets a pathway assignment per season
-- ============================================================

alter table rosters
  add column if not exists dev_pathway text
    check (dev_pathway in (
      'slasher','sharpshooter','floor_general',
      'lockdown','stretch_big','enforcer',
      'facilitator','two_way'
    )),
  add column if not exists pathway_assigned_at timestamp,
  add column if not exists pathway_weeks_active int default 0,
  add column if not exists pathway_switch_penalty_weeks int default 0;


-- ============================================================
-- 2. DEV PATHWAY DEFINITIONS
-- Lookup table: what each pathway builds + conflicts
-- ============================================================

create table if not exists dev_pathway_definitions (
  id uuid primary key default gen_random_uuid(),
  pathway text not null unique
    check (pathway in (
      'slasher','sharpshooter','floor_general',
      'lockdown','stretch_big','enforcer',
      'facilitator','two_way'
    )),
  display_name text not null,
  primary_attributes text[] not null,
  eligible_positions text[] not null,
  ineligible_positions text[],
  position_penalty numeric(3,2) default 0.7,
  position_shift_target text,
  seasons_for_shift int default 2,
  trait_tags_unlockable text[] default '{}',
  description text
);

insert into dev_pathway_definitions
  (pathway, display_name, primary_attributes, eligible_positions,
   ineligible_positions, position_penalty, position_shift_target,
   seasons_for_shift, trait_tags_unlockable, description)
values
  ('slasher', 'Slasher',
   array['finishing','speed','athleticism'],
   array['PG','SG','SF'],
   array['PF','C'], 0.65,
   'SG', 2,
   array['Relentless','Foul Magnet','Glass Cleaner'],
   'Builds finishing and athleticism. Athletic wings and guards thrive here.'),

  ('sharpshooter', 'Sharpshooter',
   array['shooting','off_ball_movement','consistency'],
   array['PG','SG','SF','PF'],
   array['C'], 0.6,
   'SF', 2,
   array['Catch and Shoot','Hot Hand','Corner Specialist'],
   'Builds shooting and off-ball movement. Bigs take a heavy penalty.'),

  ('floor_general', 'Floor General',
   array['playmaking','iq','vision'],
   array['PG','SG'],
   array['PF','C'], 0.55,
   'PG', 2,
   array['Dimer','Pick and Roll Maestro','Court Vision'],
   'Builds playmaking and basketball IQ. Guard-only pathway.'),

  ('lockdown', 'Lockdown',
   array['defense','lateral_quickness','instincts'],
   array['PG','SG','SF','PF','C'],
   array[]::text[], 1.0,
   null, null,
   array['Pest','Help Defender','Stopper'],
   'Builds defense across all attributes. Any position eligible.'),

  ('stretch_big', 'Stretch Big',
   array['shooting','footwork','face_up'],
   array['PF','C'],
   array['PG','SG','SF'], 0.5,
   'PF', 2,
   array['Floor Spacer','Face-Up Threat','Drop Step'],
   'Shooting and footwork for bigs. Guards take a severe penalty.'),

  ('enforcer', 'Enforcer',
   array['strength','interior_defense','rebounding'],
   array['PF','C'],
   array['PG','SG'], 0.55,
   'C', 2,
   array['Brick Wall','Rim Protector','Bully Ball'],
   'Interior presence and rebounding. Best for big men.'),

  ('facilitator', 'Facilitator',
   array['passing','iq','hustle'],
   array['PG','SG','SF','PF','C'],
   array[]::text[], 1.0,
   null, null,
   array['Secondary Playmaker','Glue Guy','Transition Trigger'],
   'Passing and hustle for any position. Boosts team chemistry.'),

  ('two_way', 'Two-Way',
   array['offense','defense','versatility'],
   array['PG','SG','SF','PF','C'],
   array[]::text[], 1.0,
   null, 3,
   array['Swiss Army','Two-Way Player','Versatile'],
   'Balanced growth, slower ceiling. Position can shift one slot either direction.')
on conflict (pathway) do nothing;


-- ============================================================
-- 3. PERSONA × PATHWAY COMPATIBILITY
-- Defines synergy/conflict multipliers for each combo
-- ============================================================

create table if not exists persona_pathway_compatibility (
  id uuid primary key default gen_random_uuid(),
  persona_category text not null,
  persona_sub text,
  pathway text not null,
  compatibility text not null
    check (compatibility in ('synergy','neutral','conflict')),
  dev_multiplier numeric(3,2) not null,
  morale_effect int default 0,
  notes text,
  unique (persona_category, persona_sub, pathway)
);

insert into persona_pathway_compatibility
  (persona_category, persona_sub, pathway, compatibility, dev_multiplier, morale_effect, notes)
values
  ('raw_diamond', 'gym_rat',          'sharpshooter',  'synergy',  1.5,  5,  'Gym Rat + Sharpshooter is the dream combo'),
  ('raw_diamond', 'gym_rat',          'floor_general', 'synergy',  1.4,  5,  'Work ethic amplifies IQ pathway'),
  ('raw_diamond', 'physical_freak',   'lockdown',      'synergy',  1.4,  3,  'Athleticism becomes defensive weapon'),
  ('raw_diamond', 'physical_freak',   'slasher',       'synergy',  1.4,  3,  'Physical tools built for slashing'),
  ('raw_diamond', 'chip_on_shoulder', 'slasher',       'synergy',  1.4, -2,  'Aggression fuels the slasher path'),
  ('raw_diamond', 'quiet_grinder',    'two_way',       'synergy',  1.3,  5,  'Grinder mentality fits balanced dev'),
  ('raw_diamond', 'chip_on_shoulder', 'facilitator',   'conflict', 0.7, -5,  'Too selfish to run the facilitator path'),
  ('raw_diamond', 'one_sport_wonder', 'two_way',        'conflict', 0.65,-3,  'One-trick pony resists balanced dev'),
  ('quiet_assassin', 'stone_cold',      'sharpshooter', 'synergy', 1.4,  5, 'Cold blood + shooting = elite scorer'),
  ('quiet_assassin', 'ice_in_veins',    'sharpshooter', 'synergy', 1.5,  5, 'Peak synergy — Clutch tag guaranteed'),
  ('quiet_assassin', 'the_professional','lockdown',     'synergy', 1.3,  5, 'No ego, does the dirty work'),
  ('quiet_assassin', 'humble_workhorse','facilitator',  'synergy', 1.3,  5, 'Glue guy in the making'),
  ('quiet_assassin', 'the_ghost',       'floor_general','conflict', 0.75, 0, 'Ghost does not want the spotlight'),
  ('locker_room_cancer', 'stat_padder',    'floor_general', 'conflict', 0.6, -8, 'Stat padder will not pass'),
  ('locker_room_cancer', 'stat_padder',    'facilitator',   'conflict', 0.55,-10, 'Complete contradiction'),
  ('locker_room_cancer', 'the_diva',       'lockdown',      'conflict', 0.65,-8,  'Diva wont do the dirty work'),
  ('locker_room_cancer', 'clique_builder', 'facilitator',   'conflict', 0.6, -10, 'Actively harmful to team chemistry'),
  ('locker_room_cancer', 'selfish_scorer', 'sharpshooter',  'synergy',  1.2, -3, 'Selfish scorer thrives in isolation sets'),
  ('locker_room_cancer', 'stat_padder',    'slasher',       'synergy',  1.1, -2, 'Gets his stats either way'),
  ('underdog', 'waived_and_hungry',  'lockdown',     'synergy', 1.4,  5, 'Desperate energy = elite defense'),
  ('underdog', 'prove_em_wrong',     'slasher',      'synergy', 1.4,  5, 'Aggression fuels the slash'),
  ('underdog', 'grinder_with_motor', 'two_way',      'synergy', 1.4,  5, 'Motor player fits balanced grind'),
  ('underdog', 'walk_on_mentality',  'facilitator',  'synergy', 1.3,  5, 'Team-first mentality'),
  ('underdog', 'last_chance_player', 'lockdown',     'synergy', 1.3,  3, 'Nothing to lose, plays with edge'),
  ('fading_legend', 'locker_room_elder', 'facilitator', 'synergy',  1.2,  5, 'Elder statesman as facilitator makes sense'),
  ('fading_legend', 'glass_cannon',      'enforcer',    'conflict', 0.7, -3, 'Body cant handle enforcer path'),
  ('fading_legend', 'last_dance_vet',    'two_way',     'neutral',  1.0,  0, 'Jack of all trades late career'),
  ('fading_legend', 'graceful_decline',  'lockdown',    'synergy',  1.1,  3, 'Vets know how to defend'),
  ('franchise_cornerstone', 'alpha_dog',        'sharpshooter', 'synergy',  1.3,  3, 'Alpha thrives in volume shooting'),
  ('franchise_cornerstone', 'culture_setter',   'facilitator',  'synergy',  1.4,  8, 'Culture setter + facilitator = perfect'),
  ('franchise_cornerstone', 'natural_captain',  'floor_general','synergy',  1.3,  5, 'Born leader runs the point'),
  ('franchise_cornerstone', 'alpha_dog',        'facilitator',  'conflict', 0.7, -5, 'Alpha does not pass first'),
  ('mercenary', 'hired_gun',      'sharpshooter', 'synergy',  1.2,  0, 'Does his job, gets buckets'),
  ('mercenary', 'ring_chaser',    'lockdown',     'synergy',  1.1,  0, 'Will do dirty work for a ring'),
  ('mercenary', 'itchy_feet',     'two_way',      'conflict', 0.75,-5, 'Not invested enough for long dev path'),
  ('mercenary', 'fair_weather',   'facilitator',  'conflict', 0.65,-8, 'Fair weather player wont sacrifice'),
  ('late_bloomer', 'slow_starter',      'two_way',      'synergy',  1.4,  3, 'Two-way suits the slow build perfectly'),
  ('late_bloomer', 'developmental_bet', 'floor_general','synergy',  1.5,  5, 'Hidden IQ unlocked by right pathway'),
  ('late_bloomer', 'hidden_motor',      'lockdown',     'synergy',  1.4,  3, 'Motor translates to elite defense'),
  ('late_bloomer', 'raw_athlete',       'slasher',      'synergy',  1.4,  3, 'Raw athleticism built for slashing'),
  ('late_bloomer', 'uncoachable_early', 'floor_general','conflict', 0.65,-5, 'Resists the structure of this path early'),
  ('late_bloomer', 'system_player',     'enforcer',     'conflict', 0.7, -3, 'Too finesse for the enforcer grind')
on conflict (persona_category, persona_sub, pathway) do nothing;


-- ============================================================
-- 4. STORY TEMPLATES
-- Template pool for the story beat engine
-- ============================================================

create table if not exists story_templates (
  id uuid primary key default gen_random_uuid(),
  event_type text not null
    check (event_type in (
      'pathway_switch','breakout_game','persona_conflict',
      'position_shift','controversial_trade','dev_league_ready',
      'momentum_swing','clutch_moment','injury_scare',
      'persona_revealed','season_start','playoff_push'
    )),
  template text not null,
  tone text default 'neutral'
    check (tone in ('hype','dramatic','quiet','tense','heartfelt')),
  created_at timestamp default now()
);

insert into story_templates (event_type, tone, template) values
  ('pathway_switch','quiet',    'Sources close to {player_name} say the {team_name} coaching staff has quietly shifted his development focus. The {old_pathway} work is on pause.'),
  ('pathway_switch','dramatic', '{player_name} was spotted putting in extra sessions this week — but on something different. The move to {new_pathway} has been bumpy so far.'),
  ('pathway_switch','quiet',    'Quietly, {player_name}''s development focus has changed. Whether the {new_pathway} path pays off remains to be seen.'),
  ('pathway_switch','tense',    'The {team_name} front office made a call on {player_name}''s future. A {persona_sub} adapting mid-season is never a sure thing.'),
  ('pathway_switch','tense',    'A switch this late in the season is a gamble. {player_name} is now on the {new_pathway} path and the clock is ticking.'),
  ('breakout_game','hype',      '{player_name} looked like a different player tonight. {points} points on {team_name}''s biggest stage — the league is taking notice.'),
  ('breakout_game','hype',      'Nobody in the building expected {player_name} to take over like that. {assists} dimes and zero turnovers. File this one away.'),
  ('breakout_game','dramatic',  'A {persona_sub} making a statement. {player_name} was everywhere tonight and the numbers don''t even tell the full story.'),
  ('breakout_game','quiet',     '{player_name} just put up the kind of game that changes how scouts talk about him. {points} points, {rebounds} boards. That''s a line.'),
  ('breakout_game','quiet',     'Quietly becoming something. {player_name} has been building to this and tonight it all came together for {team_name}.'),
  ('persona_conflict','tense',    'Something is off between {player_a} and {player_b} in practice. Chemistry is dropping and it''s starting to show on the floor.'),
  ('persona_conflict','dramatic', 'The {team_name} locker room has been quieter than usual. {player_a} and {player_b} haven''t seen eye to eye in days.'),
  ('persona_conflict','tense',    'Two different personalities, one roster. {player_a}''s {persona_a} energy is clashing hard with {player_b}''s approach.'),
  ('persona_conflict','dramatic', 'Sources say tension between {player_a} and {player_b} has been simmering for weeks. It finally boiled over this week.'),
  ('persona_conflict','quiet',    '{player_a} and {player_b} are reportedly not on speaking terms. The {team_name} coaching staff is monitoring the situation closely.'),
  ('position_shift','quiet',    'Something has changed in how {player_name} sees the floor. The coaching staff is quietly discussing a move to {new_position}.'),
  ('position_shift','dramatic', '{player_name} has outgrown his {old_position} role. Two seasons on the {pathway} path have changed what he is.'),
  ('position_shift','tense',    'The numbers don''t lie — {player_name} is no longer just a {old_position}. The {team_name} front office has a decision to make.'),
  ('position_shift','hype',     'A {persona_sub} evolving in real time. {player_name} is making a case to be listed at {new_position} by next season.'),
  ('position_shift','quiet',    '{team_name} insiders say the coaching staff has been experimenting with {player_name} at {new_position}. Early results are promising.'),
  ('controversial_trade','dramatic', 'The {team_name} front office made a move that has the league talking. {player_name} is gone and fans aren''t happy.'),
  ('controversial_trade','tense',    'Bold move from {manager_name}. Trading {player_name} mid-season either looks genius in June or haunts this franchise for years.'),
  ('controversial_trade','quiet',    '{player_name} reacted to the trade with a brief statement: ''It''s a business.'' The {team_name} locker room felt it.'),
  ('controversial_trade','dramatic', '{manager_name} pulled the trigger on a deal most didn''t see coming. {player_name} to a new home. The fanbase is divided.'),
  ('controversial_trade','tense',    'Not everyone agrees with {manager_name}''s call here. {player_name} was a fan favorite and the silence from the locker room says enough.'),
  ('dev_league_ready','hype',      '{player_name} has been putting in the work down in the dev league. The numbers say he''s ready. The question is whether you agree.'),
  ('dev_league_ready','heartfelt', 'A {persona_sub} who was written off by most scouts is now knocking on the door of your main roster. {player_name} is ready.'),
  ('dev_league_ready','quiet',     'Dev league sources say {player_name} has been the best player in practice for three straight weeks. Time to make the call.'),
  ('dev_league_ready','heartfelt', '{player_name} has done everything asked of him at the dev league level. The ball is in {manager_name}''s court now.'),
  ('dev_league_ready','hype',      'Readiness confirmed. {player_name}''s numbers over the last month have been impossible to ignore. He''s earned the call-up conversation.'),
  ('momentum_swing','hype',    '{team_name} on a {run_size}-0 run. The crowd is alive and {opponent_name} has called timeout to stop the bleeding.'),
  ('momentum_swing','tense',   'Everything has swung. {opponent_name} rips off {run_size} straight and the lead is gone just like that.'),
  ('momentum_swing','dramatic','The building has completely changed. {player_name} is responsible for {run_size} of the last {run_size} points.'),
  ('clutch_moment','hype',      '{player_name} with the ball, {seconds} seconds left, down {deficit}. This is why you signed him.'),
  ('clutch_moment','tense',     'It all comes down to this. {player_name} at the line, one shot at the lead. The gym is silent.'),
  ('clutch_moment','dramatic',  'A {persona_sub} in their element. {player_name} has been here before and the {team_name} faithful believe.'),
  ('injury_scare','tense',    '{player_name} is down on the floor and {team_name}''s medical staff is on the court. Everyone in the building is holding their breath.'),
  ('injury_scare','dramatic', 'The game stops. {player_name} leaves the floor under his own power but you can see the concern on the coaching staff''s face.'),
  ('injury_scare','quiet',    '{player_name} is being evaluated in the locker room. No update yet from the {team_name} front office.'),
  ('persona_revealed','dramatic', 'You''ve seen enough. {player_name} is exactly who you thought he was — a {persona_sub}. That shapes everything from here.'),
  ('persona_revealed','quiet',    'After half a season with {player_name} you finally understand what you have. A {persona_sub}. The development plan just got clearer.'),
  ('persona_revealed','heartfelt','Scouts missed it. You didn''t. {player_name} is a {persona_sub} and you saw it before anyone else. Now build around it.'),
  ('season_start','hype',      'Season {season_number} begins. {team_name} opens at home and {manager_name}''s vision gets its first real test tonight.'),
  ('season_start','heartfelt', 'A new chapter for {team_name}. {manager_name} has spent the offseason building something. Time to find out if it works.'),
  ('season_start','dramatic',  'The roster is set. The pathway plans are in place. {team_name} is ready. Season {season_number} starts now.'),
  ('playoff_push','hype',      '{team_name} is {games_back} back with {games_left} to play. The math still works. Every game from here is a playoff game.'),
  ('playoff_push','tense',     'The margin for error is gone. {team_name} needs to win and needs help. {manager_name} knows what''s at stake.'),
  ('playoff_push','dramatic',  'Everything {manager_name} has built this season comes down to the next {games_left} games. {team_name} is locked in.')
on conflict do nothing;


-- ============================================================
-- 5. SIM ENGINE — GAME STATE
-- Tracks the live state of a game being simulated
-- ============================================================

create table if not exists game_state (
  id uuid primary key default gen_random_uuid(),
  game_log_id uuid references game_log(id) on delete cascade,
  quarter int default 1 check (quarter between 1 and 4),
  seconds_remaining int default 720,
  home_score int default 0,
  away_score int default 0,
  home_momentum int default 50 check (home_momentum between 0 and 100),
  possession text check (possession in ('home','away')),
  is_clutch_time boolean default false,
  current_run_team text,
  current_run_size int default 0,
  view_mode text default 'highlights'
    check (view_mode in ('broadcast','highlights','scoreboard')),
  is_complete boolean default false,
  created_at timestamp default now()
);


-- ============================================================
-- 6. SIM ENGINE — PLAY BY PLAY LOG
-- Every flagged moment in a game gets logged here
-- ============================================================

create table if not exists play_by_play (
  id uuid primary key default gen_random_uuid(),
  game_log_id uuid references game_log(id) on delete cascade,
  player_id uuid references players(id) on delete set null,
  quarter int,
  seconds_remaining int,
  event_type text not null
    check (event_type in (
      'score','assist','rebound','steal','block','turnover','foul',
      'momentum_swing','clutch_moment','injury_scare',
      'breakout_alert','persona_moment','substitution'
    )),
  description text,
  is_key_moment boolean default false,
  home_score_after int,
  away_score_after int,
  created_at timestamp default now()
);


-- ============================================================
-- 7. GM VIEW MODE PREFERENCE
-- ============================================================

alter table gm_profiles
  add column if not exists preferred_view_mode text default 'highlights'
    check (preferred_view_mode in ('broadcast','highlights','scoreboard')),
  add column if not exists total_interventions int default 0,
  add column if not exists total_games_managed int default 0;


-- ============================================================
-- 8. INDEXES
-- ============================================================

create index if not exists idx_rosters_pathway on rosters(dev_pathway);
create index if not exists idx_play_by_play_game on play_by_play(game_log_id);
create index if not exists idx_play_by_play_key_moments on play_by_play(is_key_moment) where is_key_moment = true;
create index if not exists idx_game_state_game on game_state(game_log_id);
create index if not exists idx_story_templates_event on story_templates(event_type);
create index if not exists idx_persona_pathway_compat on persona_pathway_compatibility(persona_category, pathway);


-- ============================================================
-- DONE v2
-- ============================================================


-- ============================================================
-- HARDWOOD MANAGER — DRAFT SYSTEM MIGRATION v3
-- Run after hardwood_migration_v2.sql
-- ============================================================


create table if not exists draft_classes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  total_prospects int default 90,
  rounds int default 3,
  picks_per_round int default 30,
  scouting_window_open boolean default false,
  combine_complete boolean default false,
  draft_complete boolean default false,
  lottery_complete boolean default false,
  created_at timestamp default now()
);

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  draft_class_id uuid references draft_classes(id) on delete cascade,
  name text not null,
  age int check (age between 18 and 23),
  position text not null check (position in ('PG','SG','SF','PF','C')),
  overall int check (overall between 40 and 75),
  potential int check (potential between 50 and 99),
  points int, assists int, rebounds int,
  speed int, defense int, athleticism int, strength int,
  persona_category text check (persona_category in (
    'raw_diamond','quiet_assassin','locker_room_cancer','underdog',
    'fading_legend','franchise_cornerstone','mercenary','late_bloomer'
  )),
  persona_sub text,
  overall_revealed boolean default false,
  potential_revealed boolean default false,
  skills_revealed boolean default false,
  physicals_revealed boolean default false,
  persona_revealed boolean default false,
  scouting_blurb text,
  is_drafted boolean default false,
  drafted_by_team_id uuid references teams(id) on delete set null,
  draft_pick_number int,
  draft_round int,
  player_id uuid references players(id) on delete set null,
  created_at timestamp default now()
);

create table if not exists draft_picks (
  id uuid primary key default gen_random_uuid(),
  draft_class_id uuid references draft_classes(id) on delete cascade,
  season_id uuid references seasons(id) on delete cascade,
  round int not null check (round between 1 and 3),
  pick_number int not null,
  original_team_id uuid references teams(id) on delete set null,
  current_team_id uuid references teams(id) on delete set null,
  is_used boolean default false,
  used_on_prospect_id uuid references prospects(id) on delete set null,
  projected_value text default 'mid' check (projected_value in ('top5','lottery','mid','late','comp')),
  is_future_pick boolean default false,
  future_season_number int,
  created_at timestamp default now(),
  unique (draft_class_id, round, pick_number)
);

create table if not exists scouting_assignments (
  id uuid primary key default gen_random_uuid(),
  draft_class_id uuid references draft_classes(id) on delete cascade,
  prospect_id uuid references prospects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  scout_id uuid references coaching_staff(id) on delete set null,
  weeks_assigned int default 0,
  attributes_revealed int default 0,
  overall_revealed boolean default false,
  potential_revealed boolean default false,
  skills_revealed boolean default false,
  persona_revealed boolean default false,
  is_active boolean default true,
  assigned_at timestamp default now(),
  completed_at timestamp,
  unique (draft_class_id, prospect_id, team_id)
);

create table if not exists combine_results (
  id uuid primary key default gen_random_uuid(),
  draft_class_id uuid references draft_classes(id) on delete cascade,
  prospect_id uuid references prospects(id) on delete cascade,
  speed_score int,
  athleticism_score int,
  strength_score int,
  agility_grade text check (agility_grade in ('A','B','C','D','F')),
  vertical_grade text check (vertical_grade in ('A','B','C','D','F')),
  strength_grade text check (strength_grade in ('A','B','C','D','F')),
  combine_blurb text,
  is_surprise boolean default false,
  is_disappointment boolean default false,
  recorded_at timestamp default now(),
  unique (draft_class_id, prospect_id)
);

create table if not exists draft_board (
  id uuid primary key default gen_random_uuid(),
  draft_class_id uuid references draft_classes(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  prospect_id uuid references prospects(id) on delete cascade,
  rank int not null,
  notes text,
  is_flagged boolean default false,
  updated_at timestamp default now(),
  unique (draft_class_id, team_id, prospect_id),
  unique (draft_class_id, team_id, rank)
);

create table if not exists draft_pick_trades (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references trades(id) on delete cascade,
  draft_pick_id uuid references draft_picks(id) on delete cascade,
  from_team_id uuid references teams(id) on delete cascade,
  to_team_id uuid references teams(id) on delete cascade,
  traded_at timestamp default now()
);

create table if not exists draft_lottery (
  id uuid primary key default gen_random_uuid(),
  draft_class_id uuid references draft_classes(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  lottery_balls int not null,
  assigned_pick int,
  pre_lottery_position int,
  is_winner boolean default false,
  created_at timestamp default now(),
  unique (draft_class_id, team_id)
);

create table if not exists prospect_blurb_templates (
  id uuid primary key default gen_random_uuid(),
  persona_category text check (persona_category in (
    'raw_diamond','quiet_assassin','locker_room_cancer','underdog',
    'fading_legend','franchise_cornerstone','mercenary','late_bloomer'
  )),
  position text check (position in ('PG','SG','SF','PF','C')),
  template text not null,
  tone text check (tone in ('hype','cautious','mysterious','critical','heartfelt'))
);

insert into prospect_blurb_templates (persona_category, position, template, tone) values
  ('raw_diamond', 'PG', 'Elite athleticism and court vision that belies his age. Needs structure but the tools are undeniable.', 'hype'),
  ('raw_diamond', 'SG', 'Plays above the rim and makes the highlight reel every night. Decision-making is a work in progress.', 'hype'),
  ('raw_diamond', 'SF', 'Long, athletic, and hungry. Scouts love the upside but warn he needs the right environment to reach it.', 'cautious'),
  ('raw_diamond', 'PF', 'Raw power forward with a motor that never stops. Skill set is unpolished but the potential jumps off the page.', 'hype'),
  ('raw_diamond', 'C',  'Massive frame with surprising agility. Has not played organized basketball long but the instincts are real.', 'mysterious'),
  ('quiet_assassin', 'PG', 'Quiet kid who lets his game do the talking. Quietly one of the best prospects in this class.', 'mysterious'),
  ('quiet_assassin', 'SG', 'No flash, all substance. Puts up efficient numbers and disappears from interviews. Teams love the profile.', 'cautious'),
  ('quiet_assassin', 'SF', 'Does not seek attention. Scouts had to watch three times before they realized how good he actually is.', 'mysterious'),
  ('quiet_assassin', 'PF', 'Consistent, reliable, and completely overlooked by casual observers. The tape tells a different story.', 'cautious'),
  ('quiet_assassin', 'C',  'Anchors his team without demanding credit. Interior presence that shows up in the win column.', 'mysterious'),
  ('locker_room_cancer', 'PG', 'Talented floor general with character concerns that have followed him from program to program.', 'critical'),
  ('locker_room_cancer', 'SG', 'Elite scorer who dominates the ball and the headlines — not always for the right reasons.', 'critical'),
  ('locker_room_cancer', 'SF', 'The talent is real. The question is whether any front office wants to take on the baggage.', 'critical'),
  ('locker_room_cancer', 'PF', 'Loaded with skill but sources from his college program paint a complicated picture off the court.', 'critical'),
  ('locker_room_cancer', 'C',  'Physically dominant. Several teams have removed him from their boards citing locker room concerns.', 'critical'),
  ('underdog', 'PG', 'Went unnoticed for two years before a breakout season put him on the map. Scouts are still catching up.', 'heartfelt'),
  ('underdog', 'SG', 'Was cut from his high school team. Will remind you of that every chance he gets.', 'heartfelt'),
  ('underdog', 'SF', 'Undrafted prospect energy in a draftable body. Chips on both shoulders and a motor to match.', 'hype'),
  ('underdog', 'PF', 'Nobody gave him a chance. He has spent four years proving everyone wrong and is not done yet.', 'heartfelt'),
  ('underdog', 'C',  'Late bloomer who found basketball later than most. The hunger in his game is impossible to fake.', 'heartfelt'),
  ('franchise_cornerstone', 'PG', 'Born leader. His teammates play better around him and scouts cannot fully explain why.', 'hype'),
  ('franchise_cornerstone', 'SG', 'The kind of player a city falls in love with. Franchise energy from the moment he walks in the room.', 'hype'),
  ('franchise_cornerstone', 'SF', 'Sets the standard everywhere he goes. Culture builder with elite two-way tools to match.', 'hype'),
  ('franchise_cornerstone', 'PF', 'Every program he has been a part of has won. Coincidence is no longer a reasonable explanation.', 'hype'),
  ('franchise_cornerstone', 'C',  'Generational presence. The kind of anchor that changes what a franchise can become.', 'hype'),
  ('mercenary', 'PG', 'Talented but transactional. Already talking about his second contract before the first one is signed.', 'critical'),
  ('mercenary', 'SG', 'Production is there. Loyalty is not. Front offices considering him should go in with eyes open.', 'critical'),
  ('mercenary', 'SF', 'Will give you everything he has — for the right price, on the right team, in the right situation.', 'cautious'),
  ('mercenary', 'PF', 'Business-first mentality that rubs some organizations the wrong way. The numbers are hard to ignore though.', 'cautious'),
  ('mercenary', 'C',  'Elite tools paired with an agent who has already begun shopping his draft rights. Proceed carefully.', 'critical'),
  ('late_bloomer', 'PG', 'Numbers do not pop yet but every coach who has worked with him says the same thing: give him time.', 'cautious'),
  ('late_bloomer', 'SG', 'Rough around the edges in ways that film sessions cannot fully explain. Something is developing here.', 'mysterious'),
  ('late_bloomer', 'SF', 'Scouts are split. Half see a project. Half see something nobody else has found yet. Worth the risk.', 'mysterious'),
  ('late_bloomer', 'PF', 'Physically ready, mentally still catching up. The tools suggest a ceiling nobody has reached yet.', 'cautious'),
  ('late_bloomer', 'C',  'Raw in every sense of the word. But the coaches who know him best say he is closer than he looks.', 'mysterious')
on conflict do nothing;

create index if not exists idx_prospects_draft_class on prospects(draft_class_id);
create index if not exists idx_prospects_drafted on prospects(is_drafted);
create index if not exists idx_prospects_position on prospects(position);
create index if not exists idx_draft_picks_team on draft_picks(current_team_id);
create index if not exists idx_draft_picks_season on draft_picks(season_id);
create index if not exists idx_draft_picks_future on draft_picks(is_future_pick);
create index if not exists idx_scouting_team on scouting_assignments(team_id);
create index if not exists idx_scouting_prospect on scouting_assignments(prospect_id);
create index if not exists idx_draft_board_team on draft_board(team_id, draft_class_id);
create index if not exists idx_combine_results_class on combine_results(draft_class_id);
create index if not exists idx_blurb_templates_persona on prospect_blurb_templates(persona_category, position);


-- ============================================================
-- DONE v3
-- ============================================================


-- ============================================================
-- HARDWOOD MANAGER — MIGRATION v4
-- Run after hardwood_migration_v3_draft.sql
-- ============================================================


-- FREE AGENCY & CONTRACTS

create table if not exists free_agent_pool (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  reason text not null check (reason in ('contract_expired', 'opt_out', 'buyout', 'undrafted', 'released')),
  demand_salary int,
  demand_years int check (demand_years between 1 and 5),
  demand_role text check (demand_role in ('starter', 'rotation', 'bench')),
  demand_pathway text check (demand_pathway in (
    'slasher','sharpshooter','floor_general','lockdown',
    'stretch_big','enforcer','facilitator','two_way'
  )),
  has_pathway_clause boolean default false,
  window_open boolean default true,
  window_closes_week int,
  signed_by_team_id uuid references teams(id) on delete set null,
  signed_at timestamp,
  created_at timestamp default now()
);

create table if not exists contract_offers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  offer_salary int not null,
  offer_years int not null check (offer_years between 1 and 5),
  offer_role text check (offer_role in ('starter', 'rotation', 'bench')),
  pathway_clause text check (pathway_clause in (
    'slasher','sharpshooter','floor_general','lockdown',
    'stretch_big','enforcer','facilitator','two_way', null
  )),
  has_no_trade_clause boolean default false,
  status text default 'pending' check (status in ('pending', 'accepted', 'countered', 'rejected', 'expired')),
  counter_salary int,
  counter_years int,
  round int default 1 check (round between 1 and 3),
  is_extension boolean default false,
  created_at timestamp default now(),
  resolved_at timestamp
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  season_id uuid references seasons(id) on delete cascade,
  salary int not null,
  total_years int not null,
  years_remaining int not null,
  role_guarantee text check (role_guarantee in ('starter', 'rotation', 'bench')),
  pathway_clause text check (pathway_clause in (
    'slasher','sharpshooter','floor_general','lockdown',
    'stretch_big','enforcer','facilitator','two_way', null
  )),
  has_no_trade_clause boolean default false,
  is_active boolean default true,
  signed_at timestamp default now(),
  expires_after_season int
);


-- PLAYER SIGNATURES

create table if not exists player_signatures (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade unique,
  tendency text,
  tendency_unlocked boolean default false,
  signature_move_name text,
  signature_move_unlocked boolean default false,
  signature_move_pathway text,
  signature_move_unlocked_season int,
  quirk_text text,
  quirk_revealed boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists signature_move_pool (
  id uuid primary key default gen_random_uuid(),
  pathway text not null check (pathway in (
    'slasher','sharpshooter','floor_general','lockdown',
    'stretch_big','enforcer','facilitator','two_way'
  )),
  move_name text not null,
  unique (pathway, move_name)
);

insert into signature_move_pool (pathway, move_name) values
  ('slasher', 'The Baseline Rip'), ('slasher', 'Contact Finish'), ('slasher', 'The Euro Step'),
  ('slasher', 'Reverse Layup'), ('slasher', 'The Floater'),
  ('sharpshooter', 'The Elbow Fade'), ('sharpshooter', 'Corner Sniper'), ('sharpshooter', 'The Step-Back'),
  ('sharpshooter', 'Off-Screen Pull-Up'), ('sharpshooter', 'The Catch and Fire'),
  ('floor_general', 'The Pocket Pass'), ('floor_general', 'No-Look Dish'), ('floor_general', 'The Lob'),
  ('floor_general', 'Pick and Roll Maestro'), ('floor_general', 'The Behind-the-Back'),
  ('lockdown', 'The Swipe'), ('lockdown', 'Chest Pass Steal'), ('lockdown', 'The Body Up'),
  ('lockdown', 'Help Side Block'), ('lockdown', 'The Takeaway'),
  ('stretch_big', 'The Face-Up'), ('stretch_big', 'Drop Step Fade'), ('stretch_big', 'Corner Three'),
  ('stretch_big', 'The Hi-Lo'), ('stretch_big', 'Mid-Post Spin'),
  ('enforcer', 'The Seal'), ('enforcer', 'Putback Slam'), ('enforcer', 'The Box Out'),
  ('enforcer', 'Second Chance Special'), ('enforcer', 'The Screen'),
  ('facilitator', 'The Kick Out'), ('facilitator', 'Fast Break Trigger'), ('facilitator', 'The Extra Pass'),
  ('facilitator', 'Pressure Release'), ('facilitator', 'The Hockey Assist'),
  ('two_way', 'The Transition Stop'), ('two_way', 'The Switch'), ('two_way', 'Both Ends Special'),
  ('two_way', 'The Hustle Play'), ('two_way', 'The Glue')
on conflict (pathway, move_name) do nothing;

create table if not exists quirk_pool (
  id uuid primary key default gen_random_uuid(),
  persona_sub text not null unique,
  quirk_text text not null
);

insert into quirk_pool (persona_sub, quirk_text) values
  ('street_ball_prodigy',   'Learned the game in pickup. Still plays like it.'),
  ('late_transfer',         'Carries his bags everywhere. Never fully unpacked.'),
  ('chip_on_shoulder',      'Keeps a list of everyone who doubted him.'),
  ('foreign_import',        'Calls his mother after every game. Win or lose.'),
  ('gym_rat',               'Gets to the facility two hours before anyone else.'),
  ('one_sport_wonder',      'Still thinks like an athlete first, a basketball player second.'),
  ('overlooked_recruit',    'Has every rejection letter saved on his phone.'),
  ('physical_freak',        'Eats the same meal before every game. Has for six years.'),
  ('quiet_grinder',         'Never asks for anything. You have to notice him yourself.'),
  ('second_chance_kid',     'Treats every practice like it could be his last.'),
  ('stone_cold',            'Never celebrates. Just jogs back on defense.'),
  ('the_ghost',             'Disappears from the locker room before interviews.'),
  ('humble_workhorse',      'Stays after practice to rebound for teammates.'),
  ('silent_leader',         'Taps every teammate on the chest before tip-off. Every game.'),
  ('ice_in_veins',          'Sleeps better the night before big games than regular ones.'),
  ('assassin_in_waiting',   'Studies film of the starter he is trying to replace.'),
  ('under_the_radar',       'Has never once mentioned his own stats in an interview.'),
  ('steady_eddie',          'Same pregame routine for eleven years. Down to the minute.'),
  ('the_professional',       'Responds to every message within the hour. Even at midnight.'),
  ('shadow_star',           'His teammates know. The cameras do not. He prefers it that way.'),
  ('stat_padder',           'Checks the box score before he checks the final score.'),
  ('the_diva',              'Travels with more luggage than the entire coaching staff.'),
  ('drama_magnet',          'Something always happens when he is in the building.'),
  ('selfish_scorer',        'His phone background is a photo of himself.'),
  ('entitled_prospect',     'Was told he was special so many times he believed it too early.'),
  ('agent_problem',         'His agent returns calls faster than he does.'),
  ('social_media',          'Posted during halftime once. Team found out. Season got weird.'),
  ('contract_holdout',      'Has the salary cap memorized. Knows exactly what he is worth.'),
  ('clique_builder',        'Always eats with the same three guys. Everyone notices.'),
  ('the_complainer',        'Has never once said the referees were fair.'),
  ('waived_and_hungry',     'Still has the waiver wire notification screenshot on his phone.'),
  ('walk_on_mentality',     'Treats every rep in practice like a tryout.'),
  ('disrespected_vet',      'Remembers every slight. Files them away. Says nothing.'),
  ('prove_em_wrong',        'Writes the name of his doubters on his sneakers. Inside, where nobody sees.'),
  ('last_chance_player',    'Prays before every game. Has since he almost lost it all.'),
  ('cut_from_draft',        'His draft night is the first thing he thinks about every morning.'),
  ('invisible_prospect',    'Nobody knew his name two years ago. He has not forgotten that.'),
  ('grinder_with_motor',    'Has never taken a day off in four years. Not one.'),
  ('rejected_transfer',     'Still wears his old school warmup under his jersey sometimes.'),
  ('the_believer',          'Told everyone he would make it when nobody else thought so. He was right.'),
  ('last_dance_vet',        'Keeps his first ever jersey in his locker. Does not talk about it.'),
  ('reluctant_mentor',      'Gives advice when asked. Never volunteers it. But he is always watching.'),
  ('the_journeyman',        'Has a go-bag packed at all times. Old habit.'),
  ('one_more_run',          'The ring is the only thing left on the list.'),
  ('former_star',           'The highlight reel still lives on the internet. He does not watch it.'),
  ('graceful_decline',      'Asked the coach to come off the bench. Coach said no. He asked again.'),
  ('glass_cannon',          'Knows every physio in the league by first name.'),
  ('grizzled_presence',     'The young guys quiet down when he walks in. He has never asked them to.'),
  ('locker_room_elder',     'Leaves notes in younger players lockers. Never signs them.'),
  ('twilight_performer',     'Still gets butterflies before playoff games. Only playoff games.'),
  ('natural_captain',       'Was voted captain in every locker room he has ever been in.'),
  ('community_icon',        'Knows the names of every arena worker on a first-name basis.'),
  ('culture_setter',        'The first one in the building. Sets the standard without saying a word.'),
  ('vocal_leader',          'Will tell you the truth to your face. The whole team trusts him for it.'),
  ('the_face',              'The city sees themselves in him. He feels the weight of that every day.'),
  ('hometown_hero',         'Still lives in the same neighborhood he grew up in.'),
  ('generational_talent',    'Makes the game look slow. It is not. He is just that fast.'),
  ('alpha_dog',            'When it is close he wants the ball. Always has. Always will.'),
  ('heart_of_the_team',    'When he is hurt the locker room changes. Everyone feels it.'),
  ('the_standard',          'New players watch him in warmups before they watch anyone else.'),
  ('ring_chaser',          'Has a map on his phone showing every contenders record in real time.'),
  ('hired_gun',            'Does the job. Cashes the check. Goes home. No drama.'),
  ('max_contract',          'His handshake deal is worth more than most players contracts.'),
  ('rental_player',         'Already knows his next destination. He just has not told you yet.'),
  ('business_decision',     'Told his last team he loved them. Left two weeks later.'),
  ('highest_bidder',        'His agents number is the most called contact in his phone.'),
  ('itchy_feet',            'Has lived in seven cities in eight years. Still has not unpacked the art.'),
  ('fair_weather',          'His energy in shootaround directly correlates to the win-loss record.'),
  ('the_nomad',            'Does not hang anything on his locker. Never has.'),
  ('system_player',         'Took three coaches before one finally figured out how to use him.'),
  ('slow_starter',          'His first season stats haunt him. He uses them as fuel.'),
  ('rough_around_edges',    'Still learning things most players figured out in high school.'),
  ('raw_athlete',           'Could have played three sports professionally. Chose this one late.'),
  ('hidden_motor',          'The coaches see it on film. The fans are still catching up.'),
  ('sleeper_pick',          'Fell asleep on draft night before his name was called.'),
  ('project_player',        'Every coach who has had him says the same thing: be patient.'),
  ('second_round_gem',     'His draft position is the chip that never leaves his shoulder.'),
  ('developmental_bet',     'You saw something in him nobody else did. He knows it. He will not forget it.'),
  ('uncoachable_early',    'Fought every system he was put in. Until one day he stopped fighting.')
on conflict (persona_sub) do nothing;


-- TRADE ENGINE TABLES

create table if not exists ai_team_profiles (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade unique,
  gm_personality text not null default 'analyst' check (gm_personality in ('shark', 'builder', 'closer', 'analyst', 'loyalist')),
  willingness int default 50 check (willingness between 0 and 100),
  pg_need int default 50, sg_need int default 50, sf_need int default 50,
  pf_need int default 50, c_need int default 50,
  created_at timestamp default now()
);

create table if not exists team_relationships (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  ai_team_id uuid references teams(id) on delete cascade,
  relationship_score int default 50 check (relationship_score between 0 and 100),
  total_trades int default 0,
  last_interaction timestamp,
  unique (gm_profile_id, ai_team_id)
);

create table if not exists trade_offers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  initiating_team_id uuid references teams(id) on delete cascade,
  receiving_team_id uuid references teams(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'countered', 'rejected', 'collapsed')),
  round int default 1 check (round between 1 and 3),
  is_player_initiated boolean default true,
  created_at timestamp default now(),
  resolved_at timestamp
);

create table if not exists trade_offer_players (
  id uuid primary key default gen_random_uuid(),
  trade_offer_id uuid references trade_offers(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  from_team_id uuid references teams(id) on delete cascade,
  to_team_id uuid references teams(id) on delete cascade,
  calculated_value int
);

create table if not exists trade_offer_picks (
  id uuid primary key default gen_random_uuid(),
  trade_offer_id uuid references trade_offers(id) on delete cascade,
  draft_pick_id uuid references draft_picks(id) on delete cascade,
  from_team_id uuid references teams(id) on delete cascade,
  to_team_id uuid references teams(id) on delete cascade,
  pick_value int
);

create table if not exists trade_block (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  listed_at timestamp default now(),
  weeks_on_block int default 0,
  unique (team_id, player_id)
);


-- SEASON PROGRESSION & PLAYOFFS

create table if not exists season_phases (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade unique,
  current_phase text default 'early' check (current_phase in ('early', 'mid', 'late', 'playoffs', 'offseason')),
  current_week int default 1,
  all_star_complete boolean default false,
  trade_deadline_complete boolean default false,
  playoffs_started boolean default false,
  season_complete boolean default false,
  updated_at timestamp default now()
);

create table if not exists playoff_brackets (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade unique,
  seed_1_team_id uuid references teams(id) on delete set null,
  seed_2_team_id uuid references teams(id) on delete set null,
  seed_3_team_id uuid references teams(id) on delete set null,
  seed_4_team_id uuid references teams(id) on delete set null,
  seed_5_team_id uuid references teams(id) on delete set null,
  seed_6_team_id uuid references teams(id) on delete set null,
  champion_team_id uuid references teams(id) on delete set null,
  created_at timestamp default now()
);

create table if not exists playoff_series (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  bracket_id uuid references playoff_brackets(id) on delete cascade,
  round int not null check (round between 1 and 3),
  high_seed_team_id uuid references teams(id) on delete cascade,
  low_seed_team_id uuid references teams(id) on delete cascade,
  high_seed_wins int default 0,
  low_seed_wins int default 0,
  winner_team_id uuid references teams(id) on delete set null,
  is_complete boolean default false,
  created_at timestamp default now()
);

create table if not exists season_awards (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  award_type text not null check (award_type in ('mvp', 'dpoy', 'mip', 'all_star', 'playoff_mvp', 'champion')),
  player_id uuid references players(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  stat_line text,
  is_player_team boolean default false,
  created_at timestamp default now()
);

create table if not exists season_recaps (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade unique,
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  final_record text,
  playoff_result text,
  the_moves text,
  the_breakthrough text,
  the_drama text,
  the_playoffs text,
  the_verdict text,
  franchise_goal_hit boolean default false,
  created_at timestamp default now()
);


-- CHEMISTRY COMPATIBILITY MATRIX

create table if not exists chemistry_compatibility_matrix (
  id uuid primary key default gen_random_uuid(),
  persona_a text not null check (persona_a in (
    'raw_diamond','quiet_assassin','locker_room_cancer','underdog',
    'fading_legend','franchise_cornerstone','mercenary','late_bloomer'
  )),
  persona_b text not null check (persona_b in (
    'raw_diamond','quiet_assassin','locker_room_cancer','underdog',
    'fading_legend','franchise_cornerstone','mercenary','late_bloomer'
  )),
  ceiling int not null check (ceiling between 0 and 100),
  relationship_bias text default 'neutral' check (relationship_bias in ('bond', 'neutral', 'tension')),
  unique (persona_a, persona_b)
);

insert into chemistry_compatibility_matrix (persona_a, persona_b, ceiling, relationship_bias) values
  ('raw_diamond',          'raw_diamond',          75, 'neutral'),
  ('raw_diamond',          'quiet_assassin',        70, 'neutral'),
  ('raw_diamond',          'locker_room_cancer',    40, 'tension'),
  ('raw_diamond',          'underdog',              80, 'bond'),
  ('raw_diamond',          'fading_legend',         88, 'bond'),
  ('raw_diamond',          'franchise_cornerstone', 90, 'bond'),
  ('raw_diamond',          'mercenary',             50, 'neutral'),
  ('raw_diamond',          'late_bloomer',          78, 'bond'),
  ('quiet_assassin',       'quiet_assassin',        85, 'bond'),
  ('quiet_assassin',       'locker_room_cancer',   35, 'tension'),
  ('quiet_assassin',       'underdog',              72, 'neutral'),
  ('quiet_assassin',       'fading_legend',         80, 'bond'),
  ('quiet_assassin',       'franchise_cornerstone', 82, 'bond'),
  ('quiet_assassin',       'mercenary',             45, 'neutral'),
  ('quiet_assassin',       'late_bloomer',         70, 'neutral'),
  ('locker_room_cancer',   'locker_room_cancer',   25, 'tension'),
  ('locker_room_cancer',   'underdog',            38, 'tension'),
  ('locker_room_cancer',   'fading_legend',       50, 'tension'),
  ('locker_room_cancer',   'franchise_cornerstone',35, 'tension'),
  ('locker_room_cancer',   'mercenary',            55, 'neutral'),
  ('locker_room_cancer',   'late_bloomer',        42, 'tension'),
  ('underdog',             'underdog',             82, 'bond'),
  ('underdog',             'fading_legend',        75, 'bond'),
  ('underdog',             'franchise_cornerstone', 78, 'bond'),
  ('underdog',             'mercenary',             40, 'neutral'),
  ('underdog',             'late_bloomer',         80, 'bond'),
  ('fading_legend',        'fading_legend',        70, 'neutral'),
  ('fading_legend',        'franchise_cornerstone', 85, 'bond'),
  ('fading_legend',        'mercenary',             55, 'neutral'),
  ('fading_legend',        'late_bloomer',          82, 'bond'),
  ('franchise_cornerstone','franchise_cornerstone', 80, 'neutral'),
  ('franchise_cornerstone','mercenary',            40, 'tension'),
  ('franchise_cornerstone','late_bloomer',         75, 'bond'),
  ('mercenary',            'mercenary',             60, 'neutral'),
  ('mercenary',            'late_bloomer',         50, 'neutral'),
  ('late_bloomer',         'late_bloomer',         76, 'neutral')
on conflict (persona_a, persona_b) do nothing;

insert into chemistry_compatibility_matrix (persona_a, persona_b, ceiling, relationship_bias)
select persona_b, persona_a, ceiling, relationship_bias
from chemistry_compatibility_matrix
where persona_a != persona_b
on conflict (persona_a, persona_b) do nothing;


-- COACHING STAFF UPGRADES

create table if not exists coaching_upgrade_log (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaching_staff(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  season_id uuid references seasons(id) on delete cascade,
  old_level int,
  new_level int,
  upgrade_cost int,
  upgrade_reason text,
  upgraded_at timestamp default now()
);

alter table coaching_staff
  add column if not exists upgraded_this_season boolean default false,
  add column if not exists contract_seasons int default 2,
  add column if not exists contract_expires_season int;


-- HALL OF FAME

create table if not exists hall_of_fame (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  inducted_season_id uuid references seasons(id) on delete set null,
  inducted_season_number int,
  career_seasons int,
  career_peak_overall int,
  career_championships int,
  career_awards text[],
  career_avg_points numeric(4,1),
  seasons_with_franchise int,
  persona_sub_at_induction text,
  quirk_at_induction text,
  signature_move_at_induction text,
  legacy_line text,
  inducted_at timestamp default now()
);

create table if not exists hof_nominees (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  criteria_met text[],
  criteria_count int,
  gm_decision text check (gm_decision in ('inducted', 'passed', 'pending')),
  decided_at timestamp,
  created_at timestamp default now()
);


-- FRANCHISE RECORDS

create table if not exists franchise_records (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  record_type text not null check (record_type in (
    'most_wins_season', 'highest_chemistry', 'most_points_game',
    'best_player_overall', 'most_awards_season', 'most_seasons_managed',
    'most_championships', 'highest_legacy_score', 'most_hof_inductees',
    'best_draft_pick_overall', 'longest_win_streak', 'worst_season_wins',
    'highest_player_developed', 'fastest_raw_diamond_to_80',
    'most_games_played_player'
  )),
  record_value numeric not null,
  record_holder_player_id uuid references players(id) on delete set null,
  record_holder_season_id uuid references seasons(id) on delete set null,
  record_holder_name text,
  set_at timestamp default now(),
  unique (gm_profile_id, record_type)
);


-- LEGACY SCORE LOG

create table if not exists legacy_score_log (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  season_id uuid references seasons(id) on delete set null,
  event text not null,
  points int not null,
  running_total int,
  logged_at timestamp default now()
);

alter table gm_profiles
  add column if not exists legacy_score int default 0,
  add column if not exists total_championships int default 0,
  add column if not exists total_playoff_appearances int default 0,
  add column if not exists total_hof_inductees int default 0;


-- OFFSEASON FLOW

create table if not exists franchise_goals (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  season_id uuid references seasons(id) on delete cascade,
  goal_type text not null check (goal_type in (
    'make_playoffs', 'win_championship', 'develop_player',
    'reach_record', 'rebuild', 'prove_yourself', 'dynasty'
  )),
  goal_description text not null,
  target_player_id uuid references players(id) on delete set null,
  target_value int,
  is_achieved boolean default false,
  evaluated_at timestamp,
  created_at timestamp default now(),
  unique (gm_profile_id, season_id)
);

create table if not exists offseason_log (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  season_id uuid references seasons(id) on delete cascade,
  action_type text not null check (action_type in (
    'extension_offered', 'extension_accepted', 'extension_rejected',
    'free_agent_signed', 'player_released', 'coach_hired',
    'coach_fired', 'coach_upgraded', 'pathway_reset',
    'goal_set', 'hof_inducted', 'player_retired'
  )),
  player_id uuid references players(id) on delete set null,
  coach_id uuid references coaching_staff(id) on delete set null,
  details jsonb,
  actioned_at timestamp default now()
);

create table if not exists player_retirements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  season_id uuid references seasons(id) on delete set null,
  gm_profile_id uuid references gm_profiles(id) on delete set null,
  seasons_played int,
  peak_overall int,
  championships int,
  final_team_id uuid references teams(id) on delete set null,
  farewell_text text,
  retired_at timestamp default now()
);


-- AI TEAM SIMULATION SUPPORT

create table if not exists ai_game_results (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  week_number int not null,
  home_team_id uuid references teams(id) on delete cascade,
  away_team_id uuid references teams(id) on delete cascade,
  home_score int,
  away_score int,
  winner_team_id uuid references teams(id) on delete set null,
  simulated_at timestamp default now()
);

insert into ai_team_profiles (team_id, gm_personality, willingness)
select
  id,
  case (row_number() over (order by name) % 5)
    when 0 then 'shark' when 1 then 'builder' when 2 then 'closer' when 3 then 'analyst' else 'loyalist' end,
  45 + floor(random() * 30)::int
from teams
on conflict (team_id) do nothing;


-- INDEXES v4

create index if not exists idx_free_agent_pool_season on free_agent_pool(season_id);
create index if not exists idx_free_agent_pool_open on free_agent_pool(window_open) where window_open = true;
create index if not exists idx_contracts_player on contracts(player_id);
create index if not exists idx_contracts_team on contracts(team_id);
create index if not exists idx_contracts_active on contracts(is_active) where is_active = true;
create index if not exists idx_contract_offers_team on contract_offers(team_id);
create index if not exists idx_contract_offers_pending on contract_offers(status) where status = 'pending';
create index if not exists idx_player_signatures_player on player_signatures(player_id);
create index if not exists idx_trade_offers_season on trade_offers(season_id);
create index if not exists idx_trade_offers_pending on trade_offers(status) where status = 'pending';
create index if not exists idx_trade_block_team on trade_block(team_id);
create index if not exists idx_season_awards_season on season_awards(season_id);
create index if not exists idx_season_awards_player on season_awards(player_id);
create index if not exists idx_playoff_series_season on playoff_series(season_id);
create index if not exists idx_hof_nominees_season on hof_nominees(season_id);
create index if not exists idx_hof_nominees_pending on hof_nominees(gm_decision) where gm_decision = 'pending';
create index if not exists idx_hall_of_fame_gm on hall_of_fame(gm_profile_id);
create index if not exists idx_franchise_records_gm on franchise_records(gm_profile_id);
create index if not exists idx_legacy_log_gm on legacy_score_log(gm_profile_id);
create index if not exists idx_franchise_goals_gm on franchise_goals(gm_profile_id);
create index if not exists idx_offseason_log_gm on offseason_log(gm_profile_id, season_id);
create index if not exists idx_ai_game_results_season on ai_game_results(season_id, week_number);
create index if not exists idx_team_relationships_gm on team_relationships(gm_profile_id);
create index if not exists idx_chemistry_matrix_lookup on chemistry_compatibility_matrix(persona_a, persona_b);
create index if not exists idx_quirk_pool_persona on quirk_pool(persona_sub);
create index if not exists idx_sig_move_pool_pathway on signature_move_pool(pathway);


-- RPC FUNCTIONS

create or replace function increment_legacy_score(gm_id uuid, delta int)
returns int language plpgsql security definer set search_path = '' as $$
declare new_score int;
begin
  update gm_profiles set legacy_score = greatest(0, coalesce(legacy_score, 0) + delta)
    where id = gm_id returning legacy_score into new_score;
  return new_score;
end; $$;

create or replace function increment_relationship(p_gm_id uuid, p_ai_team_id uuid, delta int)
returns int language plpgsql security definer set search_path = '' as $$
declare new_score int;
begin
  update team_relationships
    set relationship_score = greatest(0, least(100, relationship_score + delta))
    where gm_profile_id = p_gm_id and ai_team_id = p_ai_team_id
    returning relationship_score into new_score;
  return new_score;
end; $$;

create or replace function advance_season_week(p_season_id uuid)
returns int language plpgsql security definer set search_path = '' as $$
declare new_week int;
begin
  update seasons set games_played = games_played + 1 where id = p_season_id returning games_played into new_week;
  update season_phases set current_week = new_week, updated_at = now() where season_id = p_season_id;
  return new_week;
end; $$;

create or replace function resolve_narrative_event(p_event_id uuid, p_choice text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update narrative_events set is_resolved = true, chosen_option = p_choice where id = p_event_id;
end; $$;


-- RLS FOR v2/v3/v4 TABLES

alter table persona_pathway_compatibility enable row level security;
alter table dev_pathway_definitions enable row level security;
alter table story_templates enable row level security;
alter table signature_move_pool enable row level security;
alter table quirk_pool enable row level security;
alter table chemistry_compatibility_matrix enable row level security;
alter table ai_team_profiles enable row level security;
alter table prospect_blurb_templates enable row level security;

create policy "public read" on persona_pathway_compatibility for select using (true);
create policy "public read" on dev_pathway_definitions for select using (true);
create policy "public read" on story_templates for select using (true);
create policy "public read" on signature_move_pool for select using (true);
create policy "public read" on quirk_pool for select using (true);
create policy "public read" on chemistry_compatibility_matrix for select using (true);
create policy "public read" on ai_team_profiles for select using (true);
create policy "public read" on prospect_blurb_templates for select using (true);


-- ============================================================
-- DONE v4
-- ============================================================
