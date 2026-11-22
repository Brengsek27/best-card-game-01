import { createWorld } from './world.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createSfx } from './sfx.js';
import { stageShot } from './shots.js';

// Game state
let world = null;
let renderer = null;
let input = null;
let sfx = null;
let canvas = null;
let ctx = null;
let animationId = null;
let lastTime = 0;
let fx = {
  shake: 0,
  hitFlash: 0,
  damageNumbers: []
};

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const shotName = urlParams.get('shot') || null;
const seed = parseInt(urlParams.get('seed')) || 1;

// Initialize game
function init() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  
  // Create world
  world = createWorld(seed);
  
  // Create renderer
  renderer = createRenderer(canvas);
  
  // Create input
  input = createInput(canvas, world, {
    startGame: () => {
      world.startGame(seed);
      sfx.deal();
    },
    selectCard: (index) => {
      world.state.selectedIndex = index;
      sfx.click();
    },
    playCard: (index) => {
      if (world.playCard(index)) {
        sfx.playCard();
        // Add visual effects
        if (world.state.lastPlayed && world.state.lastPlayed.actualPower > 0) {
          fx.shake = 10;
          fx.hitFlash = 0.3;
          fx.damageNumbers.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            value: world.state.lastPlayed.actualPower,
            color: world.state.lastPlayed.isEnemy ? '#ff4444' : '#44ff44',
            life: 60
          });
        }
      }
    },
    endTurn: () => {
      world.endTurn();
      sfx.turn();
    },
    restart: () => {
      world = createWorld(seed);
      if (shotName) {
        stageShot(shotName, world);
      } else {
        world.toTitle();
      }
      sfx.click();
    },
    toTitle: () => {
      world.toTitle();
      sfx.click();
    },
    getEndTurnRect: () => renderer.endTurnRect(),
    updateMouse: (x, y) => {
      // Mouse position for hover effects
    }
  });
  
  // Create SFX
  sfx = createSfx();
  
  // Handle shot requests
  if (shotName) {
    stageShot(shotName, world);
    // Run 2 warmup frames
    requestAnimationFrame(() => {
      renderer.draw(world, fx, 0);
      requestAnimationFrame(() => {
        renderer.draw(world, fx, 0);
        window.__shotReady = true;
      });
    });
  } else {
    world.toTitle();
    gameLoop();
  }
  
  // Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else if (!document.hidden && !animationId) {
      gameLoop();
    }
  });
}

// Game loop
function gameLoop(currentTime = 0) {
  const dt = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update AI steps
  if (world.state.screen === 'play' && world.state.phase === 'enemy' && world.state.aiQueue.length > 0) {
    if (currentTime - (world._lastAiStep || 0) > config.AI_DELAY_MS) {
      world.aiStep();
      world._lastAiStep = currentTime;
      
      // Add visual effects for AI actions
      if (world.state.lastPlayed && world.state.lastPlayed.actualPower > 0) {
        fx.shake = 8;
        fx.hitFlash = 0.2;
        fx.damageNumbers.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          value: world.state.lastPlayed.actualPower,
          color: world.state.lastPlayed.isEnemy ? '#ff4444' : '#44ff44',
          life: 60
        });
      }
    }
  }
  
  // Update effects
  if (fx.shake > 0) fx.shake *= 0.9;
  if (fx.hitFlash > 0) fx.hitFlash *= 0.8;
  
  // Render
  renderer.draw(world, fx, dt);
  
  animationId = requestAnimationFrame(gameLoop);
}

// Handle window resize
function handleResize() {
  // Canvas is fixed at 1280x720 internally, CSS scales it
  const container = canvas.parentElement;
  const scale = Math.min(
    container.clientWidth / config.CANVAS_WIDTH,
    container.clientHeight / config.CANVAS_HEIGHT
  );
  canvas.style.width = `${config.CANVAS_WIDTH * scale}px`;
  canvas.style.height = `${config.CANVAS_HEIGHT * scale}px`;
}

// Start the game
window.addEventListener('load', () => {
  init();
  handleResize();
});

window.addEventListener('resize', handleResize);

// Make config available globally for renderer
import { config } from './config.js';
window.config = config;
