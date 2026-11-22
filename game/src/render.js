import { config } from './config.js';
import { CARDS } from './cards.js';

function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  
  // Card dimensions
  const CARD_WIDTH = 120;
  const CARD_HEIGHT = 160;
  const CARD_SPACING = 15;
  const CARD_RAISE = 20;
  
  // Table dimensions
  const TABLE_WIDTH = 1000;
  const TABLE_HEIGHT = 600;
  const TABLE_X = (config.CANVAS_WIDTH - TABLE_WIDTH) / 2;
  const TABLE_Y = (config.CANVAS_HEIGHT - TABLE_HEIGHT) / 2;
  
  // UI positions
  const ENEMY_HAND_Y = 50;
  const PLAYER_HAND_Y = config.CANVAS_HEIGHT - 210;
  const END_TURN_X = config.CANVAS_WIDTH - 150;
  const END_TURN_Y = config.CANVAS_HEIGHT - 80;
  
  function drawTable() {
    // Table background - deep green felt
    ctx.fillStyle = '#1a3d2e';
    ctx.fillRect(TABLE_X, TABLE_Y, TABLE_WIDTH, TABLE_HEIGHT);
    
    // Radial vignette
    const gradient = ctx.createRadialGradient(
      config.CANVAS_WIDTH / 2, config.CANVAS_HEIGHT / 2, 0,
      config.CANVAS_WIDTH / 2, config.CANVAS_HEIGHT / 2, TABLE_WIDTH / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(TABLE_X, TABLE_Y, TABLE_WIDTH, TABLE_HEIGHT);
    
    // Subtle noise dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 200; i++) {
      const x = TABLE_X + Math.random() * TABLE_WIDTH;
      const y = TABLE_Y + Math.random() * TABLE_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }
    
    // Gold double border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(TABLE_X, TABLE_Y, TABLE_WIDTH, TABLE_HEIGHT);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.strokeRect(TABLE_X + 4, TABLE_Y + 4, TABLE_WIDTH - 8, TABLE_HEIGHT - 8);
    
    // Centre court emblem - four-suit rosette
    const centerX = config.CANVAS_WIDTH / 2;
    const centerY = config.CANVAS_HEIGHT / 2;
    const emblemSize = 60;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(0, 0, emblemSize, 0, Math.PI * 2);
    ctx.fillStyle = '#2d5016';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Four suit glyphs
    const suits = config.SUITS;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI / 2) - Math.PI / 2;
      const x = Math.cos(angle) * emblemSize * 0.5;
      const y = Math.sin(angle) * emblemSize * 0.5;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.font = '24px Georgia';
      ctx.fillStyle = suits[i].colour;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(suits[i].glyph, 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  }
  
  function drawCard(x, y, card, isFaceUp = true, isSelected = false, isEnemy = false) {
    const width = CARD_WIDTH;
    const height = CARD_HEIGHT;
    
    ctx.save();
    
    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    // Card background
    if (isSelected) {
      ctx.fillStyle = '#f4e4c1';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 20;
    } else if (isFaceUp) {
      ctx.fillStyle = '#ffffff';
    } else {
      // Card back - red-black pattern
      ctx.fillStyle = '#8b0000';
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 10; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(x + i * 15, y + j * 16, 15, 16);
          }
        }
      }
    }
    
    ctx.fillRect(x, y, width, height);
    
    // Card border
    ctx.strokeStyle = isSelected ? '#d4af37' : '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    if (isFaceUp && card) {
      // Cost gem top-left
      ctx.fillStyle = '#4a90e2';
      ctx.beginPath();
      ctx.arc(x + 20, y + 20, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Georgia';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.cost, x + 20, y + 20);
      
      // Suit glyph and colour band
      const suit = config.SUITS.find(s => s.key === card.suit);
      if (suit) {
        ctx.fillStyle = suit.colour;
        ctx.fillRect(x + 40, y + 10, 40, 8);
        ctx.font = '16px Georgia';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(suit.glyph, x + 60, y + 16);
      }
      
      // Card name
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(card.name, x + width / 2, y + 35);
      
      // Power number big
      ctx.fillStyle = suit ? suit.colour : '#666666';
      ctx.font = 'bold 36px Georgia';
      ctx.fillText(card.power, x + width / 2, y + height / 2 + 10);
      
      // Effect text small
      ctx.fillStyle = '#666666';
      ctx.font = '10px Georgia';
      const effectText = card.effect.kind === 'damage' ? `Deal ${card.effect.value} damage` :
                         card.effect.kind === 'guard' ? `Gain ${card.effect.value} guard` :
                         card.effect.kind === 'heal' ? `Heal ${card.effect.value}` :
                         card.effect.kind === 'draw' ? `Draw ${card.effect.value} cards` : '';
      ctx.fillText(effectText, x + width / 2, y + height - 30);
      
      // Card art - procedural per suit
      drawCardArt(x + 10, y + 50, width - 20, height - 80, card.suit);
    }
    
    ctx.restore();
  }
  
  function drawCardArt(x, y, width, height, suit) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    
    switch (suit) {
      case 'flame':
        // Flame tongues
        ctx.fillStyle = '#ff4444';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 15, -height / 2);
          ctx.quadraticCurveTo(i * 15 + 5, 0, i * 15, height / 2);
          ctx.quadraticCurveTo(i * 15 - 5, 0, i * 15, -height / 2);
          ctx.fill();
        }
        break;
      case 'tide':
        // Waves
        ctx.strokeStyle = '#3a86e2';
        ctx.lineWidth = 3;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(-width / 2, i * 15);
          ctx.quadraticCurveTo(0, i * 15 + 10, width / 2, i * 15);
          ctx.stroke();
        }
        break;
      case 'thorn':
        // Vines
        ctx.strokeStyle = '#43a85a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        for (let i = -2; i <= 2; i++) {
          ctx.quadraticCurveTo(i * 25, i * 10, (i + 0.5) * 25, 0);
        }
        ctx.stroke();
        break;
      case 'star':
        // Stars
        ctx.fillStyle = '#e8b93a';
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            drawStar(i * 20, j * 20, 8, 5, 0.5);
          }
        }
        break;
    }
    
    ctx.restore();
  }
  
  function drawStar(cx, cy, outerRadius, innerRadius, rotation) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  function drawPlaque(text, x, y, life, guard, mana, isPlayer = true) {
    ctx.save();
    
    // Plaque background
    ctx.fillStyle = isPlayer ? '#2d5016' : '#4a1f1f';
    ctx.fillRect(x, y, 200, 80);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 200, 80);
    
    // Text
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 14px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(text, x + 10, y + 20);
    
    // Life orb
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x + 30, y + 45, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(life, x + 30, y + 50);
    
    // Guard shield
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(x + 60, y + 35, 20, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(guard, x + 70, y + 48);
    
    // Mana gems
    ctx.fillStyle = '#9b59b6';
    for (let i = 0; i < mana; i++) {
      ctx.beginPath();
      ctx.arc(x + 110 + i * 15, y + 45, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  function drawTitleScreen() {
    // Background
    ctx.fillStyle = '#0d1a12';
    ctx.fillRect(0, 0, config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
    
    // Title with ember glow
    ctx.save();
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 72px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('EMBER COURT', config.CANVAS_WIDTH / 2, 150);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Georgia';
    ctx.fillText('Duel of the Ember Court', config.CANVAS_WIDTH / 2, 200);
    ctx.restore();
    
    // Four suit glyphs
    const suitY = 280;
    const suitSpacing = 150;
    const startX = (config.CANVAS_WIDTH - (4 * suitSpacing - 50)) / 2;
    
    config.SUITS.forEach((suit, i) => {
      ctx.fillStyle = suit.colour;
      ctx.font = '48px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(suit.glyph, startX + i * suitSpacing + 75, suitY);
    });
    
    // Instructions
    ctx.fillStyle = '#d4af37';
    ctx.font = '18px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Click or press Enter to begin', config.CANVAS_WIDTH / 2, 400);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Georgia';
    ctx.fillText(`${config.PLAYER_NAME} vs ${config.ENEMY_NAME}`, config.CANVAS_WIDTH / 2, 430);
  }
  
  function drawPlayScreen(world, fx) {
    drawTable();
    
    // Enemy hand (face-down)
    const enemyHandCount = world.state.enemy.hand.length;
    const enemyFanWidth = Math.min(enemyHandCount * (CARD_WIDTH + CARD_SPACING) - CARD_SPACING, 800);
    const enemyStartX = (config.CANVAS_WIDTH - enemyFanWidth) / 2;
    
    for (let i = 0; i < enemyHandCount; i++) {
      const x = enemyStartX + i * (CARD_WIDTH + CARD_SPACING);
      const y = ENEMY_HAND_Y + Math.sin(i * 0.3) * 10;
      drawCard(x, y, null, false);
    }
    
    // Enemy plaque
    drawPlaque(
      'DUCHESS ASHENVALE',
      config.CANVAS_WIDTH - 220,
      ENEMY_HAND_Y - 40,
      world.state.enemy.life,
      world.state.enemy.guard,
      world.state.enemy.mana,
      false
    );
    
    // AI intent line
    if (world.state.aiIntent) {
      ctx.fillStyle = '#cccccc';
      ctx.font = '12px Georgia';
      ctx.textAlign = 'left';
      ctx.fillText(world.state.aiIntent, config.CANVAS_WIDTH - 220, ENEMY_HAND_Y + 60);
    }
    
    // Player hand
    const playerHand = world.state.player.hand;
    const playerHandCount = playerHand.length;
    const playerFanWidth = Math.min(playerHandCount * (CARD_WIDTH + CARD_SPACING) - CARD_SPACING, 800);
    const playerStartX = (config.CANVAS_WIDTH - playerFanWidth) / 2;
    
    for (let i = 0; i < playerHandCount; i++) {
      const x = playerStartX + i * (CARD_WIDTH + CARD_SPACING);
      const y = PLAYER_HAND_Y + (i === world.state.selectedIndex ? -CARD_RAISE : 0);
      drawCard(x, y, playerHand[i], true, i === world.state.selectedIndex);
    }
    
    // Player plaque
    drawPlaque(
      'WARDEN',
      20,
      PLAYER_HAND_Y - 40,
      world.state.player.life,
      world.state.player.guard,
      world.state.player.mana,
      true
    );
    
    // End Turn button
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(END_TURN_X, END_TURN_Y, 120, 40);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.strokeRect(END_TURN_X, END_TURN_Y, 120, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('End Turn', END_TURN_X + 60, END_TURN_Y + 25);
    
    // Turn banner
    ctx.fillStyle = world.state.phase === 'player' ? '#d4af37' : '#ff6b35';
    ctx.fillRect(config.CANVAS_WIDTH / 2 - 100, 10, 200, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(
      world.state.phase === 'player' ? 'YOUR TURN' : 'THE DUCHESS PLAYS…',
      config.CANVAS_WIDTH / 2, 30
    );
    
    // Log (last 4 lines)
    const logLines = world.state.log.slice(-4);
    ctx.fillStyle = 'rgba(245, 235, 215, 0.9)';
    ctx.fillRect(config.CANVAS_WIDTH / 2 - 200, config.CANVAS_HEIGHT - 150, 400, 120);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(config.CANVAS_WIDTH / 2 - 200, config.CANVAS_HEIGHT - 150, 400, 120);
    
    ctx.fillStyle = '#333333';
    ctx.font = '12px Georgia';
    ctx.textAlign = 'left';
    logLines.forEach((line, i) => {
      ctx.fillText(line, config.CANVAS_WIDTH / 2 - 190, config.CANVAS_HEIGHT - 125 + i * 25);
    });
    
    // Resonance badge
    if (world.state.resonanceCount >= 1) {
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(config.CANVAS_WIDTH / 2 - 60, config.CANVAS_HEIGHT / 2 - 100, 120, 30);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect(config.CANVAS_WIDTH / 2 - 60, config.CANVAS_HEIGHT / 2 - 100, 120, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('RESONANCE +2', config.CANVAS_WIDTH / 2, config.CANVAS_HEIGHT / 2 - 80);
    }
    
    // Draw effects
    drawEffects(fx);
  }
  
  function drawWinScreen(world) {
    ctx.fillStyle = '#0d1a12';
    ctx.fillRect(0, 0, config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
    
    // Victory text with ember burst
    ctx.save();
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 64px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('THE COURT IS YOURS', config.CANVAS_WIDTH / 2, 200);
    ctx.restore();
    
    // Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(`Turns: ${world.state.stats.turns}`, config.CANVAS_WIDTH / 2, 300);
    ctx.fillText(`Cards Played: ${world.state.stats.cardsPlayed}`, config.CANVAS_WIDTH / 2, 330);
    ctx.fillText(`Damage Dealt: ${world.state.stats.damageDealt}`, config.CANVAS_WIDTH / 2, 360);
    
    // Restart instruction
    ctx.fillStyle = '#d4af37';
    ctx.font = '16px Georgia';
    ctx.fillText('Press R to play again', config.CANVAS_WIDTH / 2, 450);
  }
  
  function drawLossScreen(world) {
    ctx.fillStyle = '#2d1a1a';
    ctx.fillRect(0, 0, config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
    
    // Defeat text
    ctx.save();
    ctx.shadowColor = '#8b0000';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#8b7355';
    ctx.font = 'bold 64px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('THE EMBER FADES', config.CANVAS_WIDTH / 2, 200);
    ctx.restore();
    
    // Stats
    ctx.fillStyle = '#cccccc';
    ctx.font = '18px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(`Turns: ${world.state.stats.turns}`, config.CANVAS_WIDTH / 2, 300);
    ctx.fillText(`Cards Played: ${world.state.stats.cardsPlayed}`, config.CANVAS_WIDTH / 2, 330);
    ctx.fillText(`Damage Dealt: ${world.state.stats.damageDealt}`, config.CANVAS_WIDTH / 2, 360);
    
    // Restart instruction
    ctx.fillStyle = '#8b7355';
    ctx.font = '16px Georgia';
    ctx.fillText('Press R to play again', config.CANVAS_WIDTH / 2, 450);
  }
  
  function drawEffects(fx) {
    // Screen shake
    if (fx.shake > 0) {
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * fx.shake,
        (Math.random() - 0.5) * fx.shake
      );
      fx.shake *= 0.9;
    }
    
    // Damage numbers
    fx.damageNumbers = fx.damageNumbers.filter(dmg => {
      dmg.y -= 2;
      dmg.life--;
      
      ctx.fillStyle = dmg.color;
      ctx.font = 'bold 20px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(`-${dmg.value}`, dmg.x, dmg.y);
      
      return dmg.life > 0;
    });
    
    // Hit flash
    if (fx.hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${fx.hitFlash})`;
      ctx.fillRect(0, 0, config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
      fx.hitFlash *= 0.8;
    }
    
    if (fx.shake > 0) {
      ctx.restore();
    }
  }
  
  function draw(world, fx, dt) {
    // Clear canvas
    ctx.clearRect(0, 0, config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
    
    // Draw based on screen
    switch (world.state.screen) {
      case config.SCREENS.TITLE:
        drawTitleScreen();
        break;
      case config.SCREENS.PLAY:
        drawPlayScreen(world, fx);
        break;
      case config.SCREENS.WIN:
        drawWinScreen(world);
        break;
      case config.SCREENS.LOSS:
        drawLossScreen(world);
        break;
    }
  }
  
  // Hit test helpers
  function cardRect(i, n, isPlayer = true) {
    const handCount = n;
    const fanWidth = Math.min(handCount * (CARD_WIDTH + CARD_SPACING) - CARD_SPACING, 800);
    const startX = (config.CANVAS_WIDTH - fanWidth) / 2;
    const y = isPlayer ? PLAYER_HAND_Y : ENEMY_HAND_Y;
    
    return {
      x: startX + i * (CARD_WIDTH + CARD_SPACING),
      y: y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT
    };
  }
  
  function pointInCard(x, y, i, n, isPlayer = true) {
    const rect = cardRect(i, n, isPlayer);
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }
  
  function endTurnRect() {
    return {
      x: END_TURN_X,
      y: END_TURN_Y,
      width: 120,
      height: 40
    };
  }
  
  return {
    draw,
    cardRect,
    pointInCard,
    endTurnRect
  };
}

export { createRenderer };
