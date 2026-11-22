const CARDS = [
  // Flame (damage)
  { id: 'cinder_slash', name: 'Cinder Slash', suit: 'flame', cost: 1, power: 3, effect: { kind: 'damage', value: 3 } },
  { id: 'spark_volley', name: 'Spark Volley', suit: 'flame', cost: 2, power: 4, effect: { kind: 'damage', value: 4 } },
  { id: 'flame_lash', name: 'Flame Lash', suit: 'flame', cost: 2, power: 5, effect: { kind: 'damage', value: 5 } },
  { id: 'wildfire', name: 'Wildfire', suit: 'flame', cost: 3, power: 6, effect: { kind: 'damage', value: 6 } },
  { id: 'immolate', name: 'Immolate', suit: 'flame', cost: 4, power: 8, effect: { kind: 'damage', value: 8 } },
  { id: 'phoenix_rise', name: 'Phoenix Rise', suit: 'flame', cost: 5, power: 7, effect: { kind: 'damage', value: 7 }, secondary: { kind: 'heal', value: 3 } },
  
  // Tide
  { id: 'still_water', name: 'Still Water', suit: 'tide', cost: 1, power: 0, effect: { kind: 'heal', value: 4 } },
  { id: 'mist_veil', name: 'Mist Veil', suit: 'tide', cost: 2, power: 5, effect: { kind: 'guard', value: 5 } },
  { id: 'tidal_pull', name: 'Tidal Pull', suit: 'tide', cost: 2, power: 3, effect: { kind: 'damage', value: 3 }, secondary: { kind: 'draw', value: 1 } },
  { id: 'deep_current', name: 'Deep Current', suit: 'tide', cost: 3, power: 5, effect: { kind: 'guard', value: 5 } },
  { id: 'riptide', name: 'Riptide', suit: 'tide', cost: 4, power: 6, effect: { kind: 'damage', value: 6 } },
  { id: 'floodgate', name: 'Floodgate', suit: 'tide', cost: 5, power: 8, effect: { kind: 'damage', value: 8 } },
  
  // Thorn
  { id: 'thorn_whip', name: 'Thorn Whip', suit: 'thorn', cost: 1, power: 3, effect: { kind: 'damage', value: 3 } },
  { id: 'vine_wall', name: 'Vine Wall', suit: 'thorn', cost: 2, power: 6, effect: { kind: 'guard', value: 6 } },
  { id: 'bramble_snare', name: 'Bramble Snare', suit: 'thorn', cost: 2, power: 3, effect: { kind: 'damage', value: 3 }, secondary: { kind: 'guard', value: 3 } },
  { id: 'briar_volley', name: 'Briar Volley', suit: 'thorn', cost: 3, power: 5, effect: { kind: 'damage', value: 5 } },
  { id: 'root_bind', name: 'Root Bind', suit: 'thorn', cost: 3, power: 4, effect: { kind: 'damage', value: 4 }, secondary: { kind: 'guard', value: 3 } },
  { id: 'overgrowth', name: 'Overgrowth', suit: 'thorn', cost: 4, power: 6, effect: { kind: 'damage', value: 6 }, secondary: { kind: 'heal', value: 2 } },
  
  // Star
  { id: 'lucky_star', name: 'Lucky Star', suit: 'star', cost: 1, power: 0, effect: { kind: 'draw', value: 2 } },
  { id: 'guiding_light', name: 'Guiding Light', suit: 'star', cost: 2, power: 0, effect: { kind: 'heal', value: 5 } },
  { id: 'starfall', name: 'Starfall', suit: 'star', cost: 3, power: 6, effect: { kind: 'damage', value: 6 } },
  { id: 'comet_strike', name: 'Comet Strike', suit: 'star', cost: 4, power: 7, effect: { kind: 'damage', value: 7 } },
  { id: 'constellation', name: 'Constellation', suit: 'star', cost: 6, power: 8, effect: { kind: 'damage', value: 8 }, secondary: { kind: 'draw', value: 1 } },
  { id: 'nova_burst', name: 'Nova Burst', suit: 'star', cost: 5, power: 9, effect: { kind: 'damage', value: 9 } }
];

const SUIT_ORDER = ['flame', 'tide', 'thorn', 'star'];

function cardById(id) {
  return CARDS.find(card => card.id === id);
}

function buildDeck(rng) {
  const deck = [...CARDS];
  return rng.shuffle(deck).map((card, index) => ({
    ...card,
    uid: `card_${index}_${card.id}`
  }));
}

function describeCard(card) {
  let description = `${card.name} (${card.suit}) - Cost: ${card.cost}, Power: ${card.power}`;
  if (card.effect) {
    description += `, Effect: ${card.effect.kind}`;
    if (card.effect.value) {
      description += ` ${card.effect.value}`;
    }
  }
  if (card.secondary) {
    description += `, Secondary: ${card.secondary.kind} ${card.secondary.value}`;
  }
  return description;
}

export { CARDS, SUIT_ORDER, cardById, buildDeck, describeCard };
