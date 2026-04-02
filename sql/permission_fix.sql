-- ============================================================
-- HARDWOOD MANAGER — PERMISSION FIX (run in Supabase SQL Editor)
-- Fixes: permission denied for table teams
-- ============================================================

-- 1. Clean up duplicate RLS policies (keep only one per table)
drop policy if exists "public_access" on teams;
drop policy if exists "public_access" on players;
drop policy if exists "public_access" on rosters;
drop policy if exists "public_access" on seasons;
drop policy if exists "public_access" on gm_profiles;
drop policy if exists "public_access" on game_log;
drop policy if exists "public_access" on play_by_play;
drop policy if exists "public_access" on contracts;
drop policy if exists "public_access" on coaching_staff;
drop policy if exists "public_access" on player_chemistry;
drop policy if exists "public_access" on game_state;
drop policy if exists "public_access" on narrative_events;
drop policy if exists "public_access" on draft_classes;
drop policy if exists "public_access" on prospects;
drop policy if exists "public_access" on draft_picks;
drop policy if exists "public_access" on scouting_assignments;
drop policy if exists "public_access" on draft_board;
drop policy if exists "public_access" on free_agent_pool;
drop policy if exists "public_access" on trade_offers;
drop policy if exists "public_access" on trade_offer_players;
drop policy if exists "public_access" on trade_block;
drop policy if exists "public_access" on season_awards;
drop policy if exists "public_access" on season_recaps;
drop policy if exists "public_access" on hall_of_fame;
drop policy if exists "public_access" on franchise_records;
drop policy if exists "public_access" on legacy_score_log;
drop policy if exists "public_access" on ai_game_results;
drop policy if exists "public_access" on ai_team_profiles;
drop policy if exists "public_access" on dev_pathway_definitions;
drop policy if exists "public_access" on persona_pathway_compatibility;
drop policy if exists "public_access" on story_templates;
drop policy if exists "public_access" on prospect_blurb_templates;
drop policy if exists "public_access" on signature_move_pool;
drop policy if exists "public_access" on quirk_pool;
drop policy if exists "public_access" on chemistry_compatibility_matrix;
drop policy if exists "public_access" on persona_definitions;
drop policy if exists "public_access" on persona_evolution_log;
drop policy if exists "public_access" on trades;
drop policy if exists "public_access" on trade_players;

-- 2. Create clean public access policies
create policy "public_access" on teams for all using (true) with check (true);
create policy "public_access" on players for all using (true) with check (true);
create policy "public_access" on rosters for all using (true) with check (true);
create policy "public_access" on seasons for all using (true) with check (true);
create policy "public_access" on gm_profiles for all using (true) with check (true);
create policy "public_access" on game_log for all using (true) with check (true);
create policy "public_access" on play_by_play for all using (true) with check (true);
create policy "public_access" on contracts for all using (true) with check (true);
create policy "public_access" on coaching_staff for all using (true) with check (true);
create policy "public_access" on player_chemistry for all using (true) with check (true);
create policy "public_access" on game_state for all using (true) with check (true);
create policy "public_access" on narrative_events for all using (true) with check (true);
create policy "public_access" on draft_classes for all using (true) with check (true);
create policy "public_access" on prospects for all using (true) with check (true);
create policy "public_access" on draft_picks for all using (true) with check (true);
create policy "public_access" on scouting_assignments for all using (true) with check (true);
create policy "public_access" on draft_board for all using (true) with check (true);
create policy "public_access" on free_agent_pool for all using (true) with check (true);
create policy "public_access" on trade_offers for all using (true) with check (true);
create policy "public_access" on trade_offer_players for all using (true) with check (true);
create policy "public_access" on trade_block for all using (true) with check (true);
create policy "public_access" on season_awards for all using (true) with check (true);
create policy "public_access" on season_recaps for all using (true) with check (true);
create policy "public_access" on hall_of_fame for all using (true) with check (true);
create policy "public_access" on franchise_records for all using (true) with check (true);
create policy "public_access" on legacy_score_log for all using (true) with check (true);
create policy "public_access" on ai_game_results for all using (true) with check (true);
create policy "public_access" on ai_team_profiles for all using (true) with check (true);
create policy "public_access" on dev_pathway_definitions for all using (true) with check (true);
create policy "public_access" on persona_pathway_compatibility for all using (true) with check (true);
create policy "public_access" on story_templates for all using (true) with check (true);
create policy "public_access" on prospect_blurb_templates for all using (true) with check (true);
create policy "public_access" on signature_move_pool for all using (true) with check (true);
create policy "public_access" on quirk_pool for all using (true) with check (true);
create policy "public_access" on chemistry_compatibility_matrix for all using (true) with check (true);
create policy "public_access" on persona_definitions for all using (true) with check (true);
create policy "public_access" on persona_evolution_log for all using (true) with check (true);
create policy "public_access" on trades for all using (true) with check (true);
create policy "public_access" on trade_players for all using (true) with check (true);

-- 3. Grant explicit table permissions to anon role (belt and suspenders)
grant select, insert, update, delete on teams to anon;
grant select, insert, update, delete on players to anon;
grant select, insert, update, delete on rosters to anon;
grant select, insert, update, delete on seasons to anon;
grant select, insert, update, delete on gm_profiles to anon;
grant select, insert, update, delete on game_log to anon;
grant select, insert, update, delete on play_by_play to anon;
grant select, insert, update, delete on contracts to anon;
grant select, insert, update, delete on coaching_staff to anon;
grant select, insert, update, delete on player_chemistry to anon;
grant select, insert, update, delete on game_state to anon;
grant select, insert, update, delete on narrative_events to anon;
grant select, insert, update, delete on draft_classes to anon;
grant select, insert, update, delete on prospects to anon;
grant select, insert, update, delete on draft_picks to anon;
grant select, insert, update, delete on scouting_assignments to anon;
grant select, insert, update, delete on draft_board to anon;
grant select, insert, update, delete on free_agent_pool to anon;
grant select, insert, update, delete on trade_offers to anon;
grant select, insert, update, delete on trade_offer_players to anon;
grant select, insert, update, delete on trade_block to anon;
grant select, insert, update, delete on season_awards to anon;
grant select, insert, update, delete on season_recaps to anon;
grant select, insert, update, delete on hall_of_fame to anon;
grant select, insert, update, delete on franchise_records to anon;
grant select, insert, update, delete on legacy_score_log to anon;
grant select, insert, update, delete on ai_game_results to anon;
grant select, insert, update, delete on ai_team_profiles to anon;
grant select on dev_pathway_definitions to anon;
grant select on persona_pathway_compatibility to anon;
grant select on story_templates to anon;
grant select on prospect_blurb_templates to anon;
grant select on signature_move_pool to anon;
grant select on quirk_pool to anon;
grant select on chemistry_compatibility_matrix to anon;
grant select on persona_definitions to anon;
grant select on persona_evolution_log to anon;
grant select, insert, update, delete on trades to anon;
grant select, insert, update, delete on trade_players to anon;

-- 4. Grant sequence permissions too
grant usage, select on all sequences in schema public to anon;

-- 5. Ensure trade_block has asking_price column
alter table trade_block add column if not exists asking_price int default 0;

-- 6. Ensure rosters has dev_pathway column  
alter table rosters add column if not exists dev_pathway text;

-- 7. Ensure seasons has games_per_season column
alter table seasons add column if not exists games_per_season int default 12;

-- 8. Seed exec() function if missing
create or replace function exec(sql text) returns void language plpgsql security definer set search_path = '' as $$ begin execute sql; end; $$;

-- DONE
