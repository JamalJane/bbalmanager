const PICK_VALUES = {
  top5: 75,
  lottery: 70,
  mid: 65,
  late: 58,
  comp: 50
};

const GM_PERSONALITY_THRESHOLDS = {
  shark: { accept: -0.05, counter: 0.15 },
  builder: { accept: 0.05, counter: 0.10 },
  closer: { accept: 0.08, counter: 0.20 },
  analyst: { accept: 0.10, counter: 0.12 },
  loyalist: { accept: 0.05, counter: 0.08 }
};

export function calculatePlayerValue(player) {
  const age = player.age || 28;
  const ageMult = age <= 26 ? 1.2 : age <= 30 ? 1.0 : age <= 33 ? 0.8 : 0.6;
  const baseValue = (player.overall || 60) * ageMult;

  const years = player.contract_years || 0;
  const contractBonus = years >= 3 ? 15 : years === 1 ? -20 : 0;

  const salary = player.salary || 0;
  const expectedSalary = (player.overall || 60) * 100000;
  const salaryEfficiency = salary < expectedSalary ? 10 : salary > expectedSalary * 1.5 ? -15 : 0;

  return Math.round(baseValue + contractBonus + salaryEfficiency);
}

export function getPickValue(pick) {
  if (!pick) return 0;
  const { round, pick_number, projected_pick } = pick;
  const position = projected_pick || pick_number;

  if (round === 1 && position <= 5) return PICK_VALUES.top5;
  if (round === 1 && position <= 14) return PICK_VALUES.lottery;
  if (round === 1 && position <= 22) return PICK_VALUES.mid;
  if (round === 1) return PICK_VALUES.late;
  if (round === 2) return PICK_VALUES.comp;
  return 30;
}

export function evaluateOffer(offer, askValue, gmPersonality = 'analyst') {
  const offerValue = calculateOfferValue(offer);
  const gap = (offerValue - askValue) / askValue;

  const thresholds = GM_PERSONALITY_THRESHOLDS[gmPersonality] || GM_PERSONALITY_THRESHOLDS.analyst;

  if (gap >= thresholds.accept) {
    return { decision: 'accept', gap };
  }

  if (gap >= thresholds.accept - 0.1) {
    return { decision: 'counter', gap };
  }

  return { decision: 'reject', gap };
}

function calculateOfferValue(offer) {
  let total = 0;

  if (offer.players) {
    offer.players.forEach(p => {
      total += calculatePlayerValue(p);
    });
  }

  if (offer.picks) {
    offer.picks.forEach(pick => {
      total += getPickValue(pick);
    });
  }

  return total;
}

export function generateCounter(offer, askValue, round = 1) {
  const offerValue = calculateOfferValue(offer);
  const gap = askValue - offerValue;

  if (round === 1) {
    const askMore = gap * 0.6;
    return {
      type: 'ask_more',
      additionalValue: Math.round(askMore),
      message: 'We need more in this deal to make it work.'
    };
  }

  if (round === 2) {
    const giveMore = gap * 0.4;
    return {
      type: 'give_more',
      additionalValue: Math.round(giveMore),
      message: 'We can improve our offer to close this gap.'
    };
  }

  return null;
}

export function canTradeForSalary(players, picks, salaryCap) {
  const playerSalaries = (players || []).reduce((sum, p) => sum + (p.salary || 0), 0);
  return playerSalaries <= salaryCap * 1.25;
}

export function getTradePackageValue(players, picks) {
  const playersValue = (players || []).reduce((sum, p) => sum + calculatePlayerValue(p), 0);
  const picksValue = (picks || []).reduce((sum, p) => sum + getPickValue(p), 0);
  return playersValue + picksValue;
}

export function evaluateTradeFairness(theirOffer, yourOffer) {
  const theirValue = getTradePackageValue(theirOffer.players, theirOffer.picks);
  const yourValue = getTradePackageValue(yourOffer.players, yourOffer.picks);

  if (theirValue > yourValue * 1.15) return 'unfair_to_them';
  if (yourValue > theirValue * 1.15) return 'unfair_to_you';
  if (Math.abs(theirValue - yourValue) <= Math.max(theirValue, yourValue) * 0.05) return 'fair';
  return 'slight_imbalance';
}
