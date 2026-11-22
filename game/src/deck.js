import { config } from './config.js';

function drawCards(state, n) {
  const { player, enemy } = state;
  let drawn = 0;
  
  // Player draws
  while (drawn < n && player.deck.length > 0) {
    if (player.hand.length < config.HAND_MAX) {
      player.hand.push(player.deck.pop());
      drawn++;
    } else {
      // Burn excess cards
      const burned = player.deck.pop();
      state.log.push(`Burned: ${burned.name}`);
      drawn++;
    }
  }
  
  // Enemy draws (if needed)
  while (drawn < n && enemy.deck.length > 0) {
    if (enemy.hand.length < config.HAND_MAX) {
      enemy.hand.push(enemy.deck.pop());
      drawn++;
    } else {
      const burned = enemy.deck.pop();
      state.log.push(`Enemy burned: ${burned.name}`);
      drawn++;
    }
  }
}

function handSize(state, isPlayer = true) {
  return isPlayer ? state.player.hand.length : state.enemy.hand.length;
}

function canPlay(card, mana) {
  return card.cost <= mana;
}

function manaCost(card) {
  return card.cost;
}

export { drawCards, handSize, canPlay, manaCost };
