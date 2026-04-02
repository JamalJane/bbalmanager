-- ============================================================
-- HARDWOOD MANAGER — COMPREHENSIVE FIX MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. FIX RLS POLICIES FOR CORE TABLES (blocking all anon reads)
alter table if exists players enable row level security;
alter table if exists teams enable row level security;
alter table if exists rosters enable row level security;
alter table if exists seasons enable row level security;
alter table if exists gm_profiles enable row level security;
alter table if exists coaching_staff enable row level security;
alter table if exists player_chemistry enable row level security;
alter table if exists game_log enable row level security;
alter table if exists play_by_play enable row level security;
alter table if exists contracts enable row level security;

drop policy if exists "public_access" on players;
drop policy if exists "public_access" on teams;
drop policy if exists "public_access" on rosters;
drop policy if exists "public_access" on seasons;
drop policy if exists "public_access" on gm_profiles;
drop policy if exists "public_access" on coaching_staff;
drop policy if exists "public_access" on player_chemistry;
drop policy if exists "public_access" on game_log;
drop policy if exists "public_access" on play_by_play;
drop policy if exists "public_access" on contracts;

create policy "public_access" on players for all using (true) with check (true);
create policy "public_access" on teams for all using (true) with check (true);
create policy "public_access" on rosters for all using (true) with check (true);
create policy "public_access" on seasons for all using (true) with check (true);
create policy "public_access" on gm_profiles for all using (true) with check (true);
create policy "public_access" on coaching_staff for all using (true) with check (true);
create policy "public_access" on player_chemistry for all using (true) with check (true);
create policy "public_access" on game_log for all using (true) with check (true);
create policy "public_access" on play_by_play for all using (true) with check (true);
create policy "public_access" on contracts for all using (true) with check (true);

-- 2. FIX CONTRACTS TABLE (add missing columns, add RLS)
alter table contracts add column if not exists is_active boolean default true;
alter table contracts add column if not exists signed_at timestamp default now();
alter table contracts add column if not exists team_id uuid references teams(id) on delete set null;

-- Drop and recreate contracts policy with new columns
drop policy if exists "public access" on contracts;
create policy "public_access" on contracts for all using (true) with check (true);

-- 3. FIX DRAFT_PICKS FK CONSTRAINT NAMES
-- The frontend references specific FK constraint names that may not exist.
-- Add indexes to ensure joins work efficiently regardless of constraint names.
create index if not exists idx_draft_picks_original_team on draft_picks(original_team_id);
create index if not exists idx_draft_picks_current_team on draft_picks(current_team_id);
create index if not exists idx_draft_picks_draft_class on draft_picks(draft_class_id);
create index if not exists idx_draft_picks_season on draft_picks(season_id);

-- 4. FIX TRADE_OFFERS FK CONSTRAINT NAMES
create index if not exists idx_trade_offers_initiating on trade_offers(initiating_team_id);
create index if exists idx_trade_offers_receiving on trade_offers(receiving_team_id);

-- 5. FIX FREE_AGENT_POOL INDEXES
create index if not exists idx_fap_season on free_agent_pool(season_id);
create index if not exists idx_fap_signed on free_agent_pool(signed_by_team_id);

-- 6. FIX SEASONS TABLE - ensure required columns exist
alter table seasons add column if not exists games_per_season int default 12;

-- 7. SEED A SEASON IF NONE EXISTS
insert into seasons (season_number, games_played, games_per_season, is_active)
select 1, 0, 12, true
where not exists (select 1 from seasons limit 1);

-- 8. ENSURE TRADE_BLOCK HAS ASKING_PRICE COLUMN
alter table trade_block add column if not exists asking_price int default 0;

-- 9. SEED TRADE_BLOCK VIEW (if view doesn't exist)
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

-- 10. SEED TRADE_OFFER_PICKS VIEW
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

-- 11. SEED GAME_LOGS VIEW
create or replace view game_logs as select * from game_log;

-- 12. SEED FREE_AGENTS VIEW
create or replace view free_agents as select * from free_agent_pool;

-- 13. SEED TRADE_PROPOSALS VIEW
create or replace view trade_proposals as select * from trade_offers;

-- 14. SEED TRADE_ASSETS VIEW
create or replace view trade_assets as select * from trade_offer_players;

-- 15. SEED RPC FUNCTIONS
create or replace function increment_team_wins(p_team_id uuid, p_increment int default 1)
returns void language plpgsql security definer set search_path = '' as $$
begin update teams set wins = coalesce(wins, 0) + p_increment where id = p_team_id; end; $$;

create or replace function increment_team_losses(p_team_id uuid, p_increment int default 1)
returns void language plpgsql security definer set search_path = '' as $$
begin update teams set losses = coalesce(losses, 0) + p_increment where id = p_team_id; end; $$;

create or replace function advance_season_week(p_season_id uuid)
returns int language plpgsql security definer set search_path = '' as $$
declare new_week int;
begin update seasons set games_played = games_played + 1 where id = p_season_id returning games_played into new_week; return new_week; end; $$;

create or replace function generate_draft_class(p_season_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin insert into draft_classes (season_id) values (p_season_id) returning id into new_id; return new_id; end; $$;

create or replace function run_combine(p_draft_class_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin update draft_classes set combine_complete = true where id = p_draft_class_id; end; $$;

create or replace function draft_player(p_prospect_id uuid, p_team_id uuid, p_round int, p_pick_number int)
returns void language plpgsql security definer set search_path = '' as $$
begin update prospects set is_drafted = true, drafted_by_team_id = p_team_id, draft_round = p_round, draft_pick_number = p_pick_number where id = p_prospect_id; end; $$;

create or replace function increment_legacy_score(gm_id uuid, delta int)
returns int language plpgsql security definer set search_path = '' as $$
declare new_score int;
begin update gm_profiles set legacy_score = greatest(0, coalesce(legacy_score, 0) + delta) where id = gm_id returning legacy_score into new_score; return new_score; end; $$;

create or replace function exec(sql text)
returns void language plpgsql security definer set search_path = '' as $$
begin execute sql; end; $$;

-- 16. SEED COACHING_STAFF EXTENDED COLUMNS
alter table coaching_staff add column if not exists upgraded_this_season boolean default false;
alter table coaching_staff add column if not exists contract_seasons int default 2;
alter table coaching_staff add column if not exists contract_expires_season int;

-- 17. SEED GM_PROFILES EXTENDED COLUMNS
alter table gm_profiles add column if not exists preferred_view_mode text default 'highlights';
alter table gm_profiles add column if not exists total_interventions int default 0;
alter table gm_profiles add column if not exists total_games_managed int default 0;
alter table gm_profiles add column if not exists legacy_score int default 0;
alter table gm_profiles add column if not exists total_championships int default 0;
alter table gm_profiles add column if not exists total_playoff_appearances int default 0;
alter table gm_profiles add column if not exists total_hof_inductees int default 0;

-- DONE
