import { config } from './config.js';
import { makeRng } from './random.js';
import { buildDeck } from './cards.js';
import { drawCards } from './deck.js';
import { aiChoosePlays, aiIntentLine } from './ai.js';

function createWorld(seed) {
  const rng = makeRng(seed);
  return {
    state: {
      screen: config.SCREENS.TITLE,
      turn: 0,
      phase: 'player',
      player: {
        life: config.LIFE_START,
        guard: 0,
        mana: 0,
        maxMana: 0,
        hand: [],
        deck: [],
        discard: []
      },
      enemy: {
        life: config.LIFE_START,
        guard: 0,
        mana: 0,
        maxMana: 0,
        hand: [],
        deck: [],
        discard: []
      },
      log: [],
      stats: {
        turns: 0,
        cardsPlayed: 0,
        damageDealt: 0
      },
      resonanceSuit: null,
      resonanceCount: 0,
      selectedIndex: -1,
      lastPlayed: null,
      aiQueue: [],
      aiIntent: ''
    },
    startGame,
    toTitle,
    playCard,
    endTurn,
    aiStep,
    simulateTurns,
    forceWin,
    forceLoss
  };
}

function startGame(seed) {
  const rng = makeRng(seed);
  const world = this;
  
  world.state.screen = config.SCREENS.PLAY;
  world.state.turn = 1;
  world.state.phase = 'player';
  
  // Build and shuffle decks
  const playerDeck = buildDeck(rng);
  const enemyDeck = buildDeck(rng);
  
  // Initialize players
  world.state.player = {
    life: config.LIFE_START,
    guard: 0,
    mana: 1,
    maxMana: 1,
    hand: [],
    deck: playerDeck,
    discard: []
  };
  
  world.state.enemy = {
    life: config.LIFE_START,
    guard: 0,
    mana: 1,
    maxMana: 1,
    hand: [],
    deck: enemyDeck,
    discard: []
  };
  
  // Draw initial hands
  drawCards(world.state, 4);
  drawCards(world.state, 4);
  
  world.state.log = ['Game started!'];
  world.state.stats = { turns: 0, cardsPlayed: 0, damageDealt: 0 };
  world.state.resonanceSuit = null;
  world.state.resonanceCount = 0;
}

function toTitle() {
  this.state.screen = config.SCREENS.TITLE;
}

function playCard(index) {
  const world = this;
  const { state } = world;
  
  if (state.phase !== 'player') return false;
  if (index < 0 || index >= state.player.hand.length) return false;
  
  const card = state.player.hand[index];
  if (!canPlay(card, state.player.mana)) return false;
  
  // Apply cost
  state.player.mana -= card.cost;
  
  // Check for resonance
  let resonanceBonus = 0;
  if (state.resonanceSuit === card.suit) {
    state.resonanceCount++;
    resonanceBonus = config.RESONANCE_BONUS;
  } else {
    state.resonanceSuit = card.suit;
    state.resonanceCount = 1;
  }
  
  // Apply effects
  const actualPower = card.power + resonanceBonus;
  
  switch (card.effect.kind) {
    case 'damage':
      applyDamage(state.enemy, actualPower);
      state.stats.damageDealt += actualPower;
      state.log.push(`You deal ${actualPower} damage with ${card.name}${resonanceBonus > 0 ? ' (Resonance!)' : ''}`);
      break;
    case 'guard':
      state.player.guard += card.effect.value;
      state.log.push(`You gain ${card.effect.value} guard with ${card.name}`);
      break;
    case 'heal':
      state.player.life = Math.min(state.player.life + card.effect.value, config.LIFE_START);
      state.log.push(`You heal ${card.effect.value} with ${card.name}`);
      break;
    case 'draw':
      drawCards(state, card.effect.value);
      state.log.push(`You draw ${card.effect.value} cards with ${card.name}`);
      break;
  }
  
  // Apply secondary effects
  if (card.secondary) {
    switch (card.secondary.kind) {
      case 'guard':
        state.player.guard += card.secondary.value;
        state.log.push(`You gain ${card.secondary.value} additional guard`);
        break;
      case 'heal':
        state.player.life = Math.min(state.player.life + card.secondary.value, config.LIFE_START);
        state.log.push(`You heal ${card.secondary.value} more`);
        break;
      case 'draw':
        drawCards(state, card.secondary.value);
        state.log.push(`You draw ${card.secondary.value} more cards`);
        break;
    }
  }
  
  // Move card to discard
  state.player.discard.push(state.player.hand.splice(index, 1)[0]);
  state.stats.cardsPlayed++;
  state.lastPlayed = { ...card, actualPower };
  
  // Check win/loss
  if (state.enemy.life <= 0) {
    state.screen = config.SCREENS.WIN;
    state.log.push('Victory!');
  } else if (state.player.life <= 0) {
    state.screen = config.SCREENS.LOSS;
    state.log.push('Defeat...');
  }
  
  return true;
}

function endTurn() {
  const world = this;
  const { state } = world;
  
  state.phase = 'enemy';
  state.aiIntent = aiIntentLine(state);
  
  // Enemy draws 1
  drawCards(state, 1);
  
  // Calculate AI plays
  const plays = aiChoosePlays(state);
  state.aiQueue = plays;
  
  state.log.push('Enemy turn begins...');
}

function aiStep() {
  const world = this;
  const { state } = world;
  
  if (state.phase !== 'enemy') return;
  
  if (state.aiQueue.length > 0) {
    const index = state.aiQueue.shift();
    const card = state.enemy.hand[index];
    
    // Apply cost
    state.enemy.mana -= card.cost;
    
    // Check for resonance
    let resonanceBonus = 0;
    if (state.resonanceSuit === card.suit) {
      state.resonanceCount++;
      resonanceBonus = config.RESONANCE_BONUS;
    } else {
      state.resonanceSuit = card.suit;
      state.resonanceCount = 1;
    }
    
    // Apply effects
    const actualPower = card.power + resonanceBonus;
    
    switch (card.effect.kind) {
      case 'damage':
        applyDamage(state.player, actualPower);
        state.stats.damageDealt += actualPower;
        state.log.push(`Enemy deals ${actualPower} damage with ${card.name}${resonanceBonus > 0 ? ' (Resonance!)' : ''}`);
        break;
      case 'guard':
        state.enemy.guard += card.effect.value;
        state.log.push(`Enemy gains ${card.effect.value} guard with ${card.name}`);
        break;
      case 'heal':
        state.enemy.life = Math.min(state.enemy.life + card.effect.value, config.LIFE_START);
        state.log.push(`Enemy heals ${card.effect.value} with ${card.name}`);
        break;
      case 'draw':
        drawCards(state, card.effect.value);
        state.log.push(`Enemy draws ${card.effect.value} cards with ${card.name}`);
        break;
    }
    
    // Move card to discard
    state.enemy.discard.push(state.enemy.hand.splice(index, 1)[0]);
    state.stats.cardsPlayed++;
    state.lastPlayed = { ...card, actualPower, isEnemy: true };
    
    // Check win/loss
    if (state.player.life <= 0) {
      state.screen = config.SCREENS.LOSS;
      state.log.push('Defeat...');
      return;
    }
  } else {
    // End enemy turn
    state.phase = 'player';
    state.turn++;
    state.player.maxMana = Math.min(state.turn, config.MANA_MAX);
    state.player.mana = state.player.maxMana;
    state.enemy.maxMana = Math.min(state.turn, config.MANA_MAX);
    state.enemy.mana = state.enemy.maxMana;
    
    // Player draws 1
    drawCards(state, 1);
    
    state.log.push(`Turn ${state.turn} begins!`);
    state.stats.turns++;
    
    // Reset resonance
    state.resonanceSuit = null;
    state.resonanceCount = 0;
  }
}

function simulateTurns(n, autopilotFn) {
  const world = this;
  
  for (let i = 0; i < n; i++) {
    if (world.state.screen !== config.SCREENS.PLAY) break;
    
    // Player turn
    while (world.state.phase === 'player') {
      const result = autopilotFn(world.state);
      if (result !== null) {
        world.playCard(result);
      } else {
        world.endTurn();
        break;
      }
    }
    
    // Enemy turn
    while (world.state.phase === 'enemy' && world.state.screen === config.SCREENS.PLAY) {
      world.aiStep();
    }
  }
}

function forceWin() {
  const world = this;
  world.state.screen = config.SCREENS.PLAY;
  world.state.enemy.life = 3;
  world.state.player.hand = [
    { id: 'cinder_slash', name: 'Cinder Slash', suit: 'flame', cost: 1, power: 3, effect: { kind: 'damage', value: 3 } }
  ];
  world.state.player.mana = 1;
  world.state.log = ['Setup for win...'];
}

function forceLoss() {
  const world = this;
  world.state.screen = config.SCREENS.PLAY;
  world.state.player.life = 3;
  world.state.enemy.hand = [
    { id: 'cinder_slash', name: 'Cinder Slash', suit: 'flame', cost: 1, power: 3, effect: { kind: 'damage', value: 3 } }
  ];
  world.state.enemy.mana = 1;
  world.state.log = ['Setup for loss...'];
}

function canPlay(card, mana) {
  return card.cost <= mana;
}

function applyDamage(target, damage) {
  if (target.guard >= damage) {
    target.guard -= damage;
  } else {
    const remainingDamage = damage - target.guard;
    target.guard = 0;
    target.life -= remainingDamage;
  }
}

export { createWorld };
