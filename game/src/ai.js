import { config } from './config.js';

function aiChoosePlays(state) {
  const { enemy, player } = state;
  const plays = [];
  let remainingMana = enemy.mana;
  
  // Score each playable card
  const scoredCards = enemy.hand.map((card, index) => {
    let score = 0;
    
    // Base scoring by effect type
    switch (card.effect.kind) {
      case 'damage':
        score = 1.0;
        break;
      case 'guard':
        score = enemy.life <= 12 ? 0.8 : 0.4;
        break;
      case 'heal':
        score = enemy.life <= 15 ? 0.9 : 0.2;
        break;
      case 'draw':
        score = 0.6;
        break;
    }
    
    // Adjust for power/cost ratio
    if (card.power > 0 && card.cost > 0) {
      score += (card.power / card.cost) * 0.3;
    }
    
    // Prefer guard when life is low
    if (enemy.life <= 10 && card.effect.kind === 'guard') {
      score += 0.5;
    }
    
    return { index, card, score };
  });
  
  // Sort by score and pick affordable cards
  scoredCards.sort((a, b) => b.score - a.score);
  
  for (const { index, card } of scoredCards) {
    if (canPlay(card, remainingMana)) {
      plays.push(index);
      remainingMana -= card.cost;
    }
  }
  
  return plays;
}

function aiIntentLine(state) {
  const { enemy } = state;
  
  if (enemy.life <= 10) {
    return "The Duchess braces behind thorns.";
  } else if (enemy.life <= 15) {
    return "The Duchess seeks healing in the stars.";
  } else if (enemy.mana >= 5) {
    return "The Duchess prepares a devastating spell.";
  } else {
    return "The Duchess weighs her hand...";
  }
}

function canPlay(card, mana) {
  return card.cost <= mana;
}

export { aiChoosePlays, aiIntentLine };
