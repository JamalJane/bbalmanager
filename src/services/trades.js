import { supabase } from '../lib/supabase';

export async function getTradeBlock(teamId) {
  const { data, error } = await supabase
    .from('trade_block')
    .select('*')
    .eq('team_id', teamId)
    .order('listed_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTradeValue(playerId) {
  const { data, error } = await supabase
    .from('players')
    .select('overall, age, contract_years, salary')
    .eq('id', playerId)
    .single();
  if (error) throw error;

  const ageMult = data.age <= 26 ? 1.2 : data.age <= 30 ? 1.0 : data.age <= 33 ? 0.8 : 0.6;
  const yearsBonus = data.contract_years >= 3 ? 15 : data.contract_years === 1 ? -20 : 0;
  const baseValue = data.overall * ageMult;
  return Math.round(baseValue + yearsBonus);
}

export async function proposeTrade(proposal) {
  const { data, error } = await supabase
    .from('trade_offers')
    .insert(proposal)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addTradePlayers(offerId, players) {
  const { data, error } = await supabase
    .from('trade_offer_players')
    .insert(players.map(p => ({ ...p, trade_offer_id: offerId })))
    .select();
  if (error) throw error;
  return data;
}

export async function addTradePicks(offerId, picks) {
  const { data, error } = await supabase
    .from('trade_offer_picks')
    .insert(picks.map(p => ({ ...p, trade_offer_id: offerId })))
    .select();
  if (error) throw error;
  return data;
}

export async function respondToTrade(proposalId, response) {
  const { data, error } = await supabase
    .from('trade_offers')
    .update({ status: response, resolved_at: new Date().toISOString() })
    .eq('id', proposalId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addToTradeBlock(playerId, teamId, askingPrice) {
  const { data, error } = await supabase
    .from('trade_block')
    .upsert({
      player_id: playerId,
      team_id: teamId,
      asking_price: askingPrice,
      listed_at: new Date().toISOString()
    }, { onConflict: 'team_id,player_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromTradeBlock(playerId, teamId) {
  const { error } = await supabase
    .from('trade_block')
    .delete()
    .eq('player_id', playerId)
    .eq('team_id', teamId);
  if (error) throw error;
}
