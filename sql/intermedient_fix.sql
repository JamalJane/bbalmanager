-- ============================================================
-- HARDWOOD MANAGER — INTERMEDIATE FIX MIGRATION
-- Run this in Supabase SQL Editor after hardwood_complete.sql
-- and oldsql.sql have already been run.
--
-- This script is safe to run multiple times (all idempotent).
-- It fixes:
--   1. Missing tables that oldsql.sql defines (run oldsql.sql first)
--   2. RLS + policies for all tables missing them
--   3. RPC functions the frontend calls
--   4. Creates DB views to alias wrong table names used in frontend
-- ============================================================


-- ============================================================
-- SECTION 1: ENSURE oldsql.sql TABLES EXIST
-- These should already exist if you ran oldsql.sql, but we
-- create them safely here in case any were missed.
-- ============================================================

-- game_state (from v2)
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

-- story_templates (from v2)
create table if not exists story_templates (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  template text not null,
  tone text default 'neutral',
  created_at timestamp default now()
);

-- dev_pathway_definitions (from v2)
create table if not exists dev_pathway_definitions (
  id uuid primary key default gen_random_uuid(),
  pathway text not null unique,
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

-- persona_pathway_compatibility (from v2)
create table if not exists persona_pathway_compatibility (
  id uuid primary key default gen_random_uuid(),
  persona_category text not null,
  persona_sub text,
  pathway text not null,
  compatibility text not null check (compatibility in ('synergy','neutral','conflict')),
  dev_multiplier numeric(3,2) not null,
  morale_effect int default 0,
  notes text,
  unique (persona_category, persona_sub, pathway)
);

-- draft_classes (from v3)
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

-- prospects (from v3)
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
  persona_category text,
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

-- draft_picks (from v3)
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

-- scouting_assignments (from v3)
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

-- draft_board (from v3)
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

-- free_agent_pool (from v4)
create table if not exists free_agent_pool (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  reason text not null check (reason in ('contract_expired','opt_out','buyout','undrafted','released')),
  demand_salary int,
  demand_years int check (demand_years between 1 and 5),
  demand_role text check (demand_role in ('starter','rotation','bench')),
  demand_pathway text,
  has_pathway_clause boolean default false,
  window_open boolean default true,
  window_closes_week int,
  signed_by_team_id uuid references teams(id) on delete set null,
  signed_at timestamp,
  created_at timestamp default now()
);

-- ai_game_results (from v4)
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

-- hall_of_fame (from v4)
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

-- franchise_records (from v4)
create table if not exists franchise_records (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  record_type text not null,
  record_value numeric not null,
  record_holder_player_id uuid references players(id) on delete set null,
  record_holder_season_id uuid references seasons(id) on delete set null,
  record_holder_name text,
  set_at timestamp default now(),
  unique (gm_profile_id, record_type)
);

-- season_awards (from v4)
create table if not exists season_awards (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  award_type text not null check (award_type in ('mvp','dpoy','mip','all_star','playoff_mvp','champion')),
  player_id uuid references players(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  stat_line text,
  is_player_team boolean default false,
  created_at timestamp default now()
);

-- trade_offers (from v4)
create table if not exists trade_offers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  initiating_team_id uuid references teams(id) on delete cascade,
  receiving_team_id uuid references teams(id) on delete cascade,
  status text default 'pending' check (status in ('pending','accepted','countered','rejected','collapsed')),
  round int default 1 check (round between 1 and 3),
  is_player_initiated boolean default true,
  created_at timestamp default now(),
  resolved_at timestamp
);

-- trade_offer_players (from v4)
create table if not exists trade_offer_players (
  id uuid primary key default gen_random_uuid(),
  trade_offer_id uuid references trade_offers(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  from_team_id uuid references teams(id) on delete cascade,
  to_team_id uuid references teams(id) on delete cascade,
  calculated_value int
);

-- season_recaps (from v4)
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

-- legacy_score_log (from v4)
create table if not exists legacy_score_log (
  id uuid primary key default gen_random_uuid(),
  gm_profile_id uuid references gm_profiles(id) on delete cascade,
  season_id uuid references seasons(id) on delete set null,
  event text not null,
  points int not null,
  running_total int,
  logged_at timestamp default now()
);

-- ai_team_profiles (from v4)
create table if not exists ai_team_profiles (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade unique,
  gm_personality text not null default 'analyst' check (gm_personality in ('shark','builder','closer','analyst','loyalist')),
  willingness int default 50 check (willingness between 0 and 100),
  pg_need int default 50, sg_need int default 50, sf_need int default 50,
  pf_need int default 50, c_need int default 50,
  created_at timestamp default now()
);

-- Seed ai_team_profiles if empty
insert into ai_team_profiles (team_id, gm_personality, willingness)
select
  id,
  case (row_number() over (order by name) % 5)
    when 0 then 'shark' when 1 then 'builder' when 2 then 'closer' when 3 then 'analyst' else 'loyalist' end,
  45 + floor(random() * 30)::int
from teams
on conflict (team_id) do nothing;


-- ============================================================
-- SECTION 2: VIEWS — alias wrong table names used in frontend
-- These make frontend queries work without code changes.
-- ============================================================

-- Frontend uses "game_logs" but table is "game_log"
create or replace view game_logs as select * from game_log;

-- Frontend uses "free_agents" but table is "free_agent_pool"
create or replace view free_agents as select * from free_agent_pool;

-- Frontend uses "trade_proposals" — alias to trade_offers
create or replace view trade_proposals as select * from trade_offers;

-- Frontend uses "trade_assets" — alias to trade_offer_players
create or replace view trade_assets as select * from trade_offer_players;

-- Frontend expects trade_offer_picks in trade offers
create or replace view trade_offer_picks as
select
  top.id,
  top.trade_offer_id,
  top.draft_pick_id,
  top.from_team_id,
  top.to_team_id,
  top.pick_value,
  dp.round,
  dp.pick_number,
  dp.projected_value,
  ft.name as from_team_name,
  ft.city as from_team_city
from trade_offer_picks top
left join draft_picks dp on dp.id = top.draft_pick_id
left join teams ft on ft.id = top.from_team_id;

-- trade_block needs asking_price and a view for frontend
alter table trade_block add column if not exists asking_price int default 0;

create or replace view trade_block as
select
  tb.id,
  tb.team_id,
  tb.player_id,
  tb.listed_at,
  tb.weeks_on_block,
  tb.asking_price,
  p.name as player_name,
  p.position as player_position,
  p.overall as player_overall,
  p.age as player_age,
  p.salary as player_salary,
  p.contract_years as player_contract_years
from trade_block tb
left join players p on p.id = tb.player_id;


-- ============================================================
-- SECTION 3: RPC FUNCTIONS
-- All functions the frontend calls that may not exist yet.
-- ============================================================

-- increment_team_wins
create or replace function increment_team_wins(p_team_id uuid, p_increment int default 1)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update teams set wins = coalesce(wins, 0) + p_increment where id = p_team_id;
end; $$;

-- increment_team_losses
create or replace function increment_team_losses(p_team_id uuid, p_increment int default 1)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update teams set losses = coalesce(losses, 0) + p_increment where id = p_team_id;
end; $$;

-- generate_draft_class: creates a draft_class record for a season
create or replace function generate_draft_class(p_season_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  insert into draft_classes (season_id)
    values (p_season_id)
    returning id into new_id;
  return new_id;
end; $$;

-- run_combine: marks combine complete on a draft class
create or replace function run_combine(p_draft_class_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update draft_classes set combine_complete = true where id = p_draft_class_id;
end; $$;

-- draft_player: marks a prospect as drafted and assigns to team
create or replace function draft_player(
  p_prospect_id uuid,
  p_team_id uuid,
  p_round int,
  p_pick_number int
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update prospects set
    is_drafted = true,
    drafted_by_team_id = p_team_id,
    draft_round = p_round,
    draft_pick_number = p_pick_number
  where id = p_prospect_id;
end; $$;

-- Legacy functions from v4 (safe to re-create)
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
  return new_week;
end; $$;

create or replace function resolve_narrative_event(p_event_id uuid, p_choice text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update narrative_events set is_resolved = true, chosen_option = p_choice where id = p_event_id;
end; $$;

-- exec() RPC (needed by DatabaseSetup.jsx)
create or replace function exec(sql text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  execute sql;
end; $$;


-- ============================================================
-- SECTION 4: RLS POLICIES FOR ALL NEW TABLES
-- Public access for game context (no auth required).
-- ============================================================

alter table if exists game_state enable row level security;
alter table if exists story_templates enable row level security;
alter table if exists dev_pathway_definitions enable row level security;
alter table if exists persona_pathway_compatibility enable row level security;
alter table if exists draft_classes enable row level security;
alter table if exists prospects enable row level security;
alter table if exists draft_picks enable row level security;
alter table if exists scouting_assignments enable row level security;
alter table if exists draft_board enable row level security;
alter table if exists free_agent_pool enable row level security;
alter table if exists ai_game_results enable row level security;
alter table if exists hall_of_fame enable row level security;
alter table if exists franchise_records enable row level security;
alter table if exists season_awards enable row level security;
alter table if exists trade_offers enable row level security;
alter table if exists trade_offer_players enable row level security;
alter table if exists season_recaps enable row level security;
alter table if exists legacy_score_log enable row level security;
alter table if exists ai_team_profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'game_state' and policyname = 'public access') then
    create policy "public access" on game_state for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'story_templates' and policyname = 'public access') then
    create policy "public access" on story_templates for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'dev_pathway_definitions' and policyname = 'public access') then
    create policy "public access" on dev_pathway_definitions for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'persona_pathway_compatibility' and policyname = 'public access') then
    create policy "public access" on persona_pathway_compatibility for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'draft_classes' and policyname = 'public access') then
    create policy "public access" on draft_classes for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'prospects' and policyname = 'public access') then
    create policy "public access" on prospects for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'draft_picks' and policyname = 'public access') then
    create policy "public access" on draft_picks for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'scouting_assignments' and policyname = 'public access') then
    create policy "public access" on scouting_assignments for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'draft_board' and policyname = 'public access') then
    create policy "public access" on draft_board for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'free_agent_pool' and policyname = 'public access') then
    create policy "public access" on free_agent_pool for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'ai_game_results' and policyname = 'public access') then
    create policy "public access" on ai_game_results for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'hall_of_fame' and policyname = 'public access') then
    create policy "public access" on hall_of_fame for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'franchise_records' and policyname = 'public access') then
    create policy "public access" on franchise_records for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'season_awards' and policyname = 'public access') then
    create policy "public access" on season_awards for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'trade_offers' and policyname = 'public access') then
    create policy "public access" on trade_offers for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'trade_offer_players' and policyname = 'public access') then
    create policy "public access" on trade_offer_players for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'season_recaps' and policyname = 'public access') then
    create policy "public access" on season_recaps for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'legacy_score_log' and policyname = 'public access') then
    create policy "public access" on legacy_score_log for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'ai_team_profiles' and policyname = 'public access') then
    create policy "public access" on ai_team_profiles for all using (true) with check (true);
  end if;
end $$;


-- ============================================================
-- SECTION 5: gm_profiles column additions (safe)
-- ============================================================

alter table gm_profiles
  add column if not exists preferred_view_mode text default 'highlights',
  add column if not exists total_interventions int default 0,
  add column if not exists total_games_managed int default 0,
  add column if not exists legacy_score int default 0,
  add column if not exists total_championships int default 0,
  add column if not exists total_playoff_appearances int default 0,
  add column if not exists total_hof_inductees int default 0;

alter table coaching_staff
  add column if not exists upgraded_this_season boolean default false,
  add column if not exists contract_seasons int default 2,
  add column if not exists contract_expires_season int;


-- ============================================================
-- SECTION 6: Missing contracts table
-- ============================================================

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  years_remaining int default 1,
  annual_value int default 0,
  total_value int default 0,
  is_active boolean default true,
  signed_at timestamp default now()
);

alter table contracts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'contracts' and policyname = 'public access') then
    create policy "public access" on contracts for all using (true) with check (true);
  end if;
end $$;

-- ============================================================
-- DONE — Intermediate Fix Migration Complete
-- ============================================================
