import { config } from './config.js';

function stageShot(name, world) {
  switch (name) {
    case 'start':
      world.toTitle();
      break;
      
    case 'play':
      world.startGame(1);
      // Simulate exactly 3 full turns (player + enemy) to get mid-game
      for (let turn = 0; turn < 3; turn++) {
        if (world.state.screen !== config.SCREENS.PLAY) break;
        
        // Player turn - play one card then end turn
        if (world.state.phase === 'player' && world.state.screen === config.SCREENS.PLAY) {
          let cardPlayed = false;
          for (let i = 0; i < world.state.player.hand.length; i++) {
            if (world.state.player.hand[i].cost <= world.state.player.mana) {
              world.playCard(i);
              cardPlayed = true;
              break;
            }
          }
          if (!cardPlayed) {
            world.endTurn();
          } else {
            world.endTurn();
          }
        }
        
        // Enemy turn - let AI play
        if (world.state.screen === config.SCREENS.PLAY && world.state.phase === 'enemy') {
          world.aiStep();
        }
      }
      break;
      
    case 'win':
      world.startGame(1);
      // Set up a win scenario
      world.state.enemy.life = 3;
      world.state.player.hand = [
        { id: 'cinder_slash', name: 'Cinder Slash', suit: 'flame', cost: 1, power: 3, effect: { kind: 'damage', value: 3 } }
      ];
      world.state.player.mana = 1;
      world.state.log = ['Setup for win...'];
      // Play the lethal card to trigger win screen
      world.playCard(0);
      break;
      
    case 'loss':
      world.startGame(1);
      // Set up a loss scenario
      world.state.player.life = 3;
      world.state.enemy.hand = [
        { id: 'cinder_slash', name: 'Cinder Slash', suit: 'flame', cost: 1, power: 3, effect: { kind: 'damage', value: 3 } }
      ];
      world.state.enemy.mana = 1;
      world.state.log = ['Setup for loss...'];
      // Force the AI to play the lethal card
      if (world.state.enemy.hand.length > 0) {
        // Apply cost
        world.state.enemy.mana -= world.state.enemy.hand[0].cost;
        // Apply damage
        const damage = world.state.enemy.hand[0].power;
        if (world.state.player.guard >= damage) {
          world.state.player.guard -= damage;
        } else {
          const remainingDamage = damage - world.state.player.guard;
          world.state.player.guard = 0;
          world.state.player.life -= remainingDamage;
        }
        // Move card to discard
        world.state.enemy.discard.push(world.state.enemy.hand.splice(0, 1)[0]);
        world.state.lastPlayed = { ...world.state.enemy.discard[0], actualPower: damage, isEnemy: true };
      }
      // Check if loss condition is met
      if (world.state.player.life <= 0) {
        world.state.screen = config.SCREENS.LOSS;
      }
      break;
      
    default:
      // Unknown shot name -> start
      world.toTitle();
      break;
  }
}

export { stageShot };
