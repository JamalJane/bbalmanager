-- ============================================================
-- HARDWOOD MANAGER — INIT SCRIPT
-- Run this ONCE in your Supabase SQL Editor
-- Creates the exec() RPC function that enables browser-based setup
-- ============================================================

create or replace function exec(sql text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  execute sql;
end;
$$;
