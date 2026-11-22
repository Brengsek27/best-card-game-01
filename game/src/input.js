function createInput(canvas, world, callbacks) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  let mouseX = 0;
  let mouseY = 0;
  
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
  
  function handleClick(e) {
    const pos = getMousePos(e);
    
    switch (world.state.screen) {
      case 'title':
        // Start game on click
        callbacks.startGame();
        break;
        
      case 'play':
        if (world.state.phase === 'player') {
          // Check player card clicks
          const playerHand = world.state.player.hand;
          for (let i = 0; i < playerHand.length; i++) {
            if (pointInCard(pos.x, pos.y, i, playerHand.length, true)) {
              if (world.state.selectedIndex === i) {
                // Click selected card again to play it
                callbacks.playCard(i);
              } else {
                // Select card
                callbacks.selectCard(i);
              }
              return;
            }
          }
        }
        
        // Check End Turn button
        const endTurnRect = callbacks.getEndTurnRect();
        if (pos.x >= endTurnRect.x && pos.x <= endTurnRect.x + endTurnRect.width &&
            pos.y >= endTurnRect.y && pos.y <= endTurnRect.y + endTurnRect.height) {
          callbacks.endTurn();
        }
        break;
        
      case 'win':
      case 'loss':
        // Restart on click
        callbacks.restart();
        break;
    }
  }
  
  function handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        switch (world.state.screen) {
          case 'title':
            callbacks.startGame();
            break;
          case 'play':
            if (world.state.phase === 'player' && world.state.selectedIndex >= 0) {
              callbacks.playCard(world.state.selectedIndex);
            }
            break;
          case 'win':
          case 'loss':
            callbacks.restart();
            break;
        }
        break;
        
      case ' ':
        if (world.state.screen === 'play' && world.state.phase === 'player' && world.state.selectedIndex >= 0) {
          callbacks.playCard(world.state.selectedIndex);
        }
        break;
        
      case 'e':
      case 'E':
        if (world.state.screen === 'play') {
          callbacks.endTurn();
        }
        break;
        
      case 'r':
      case 'R':
        if (world.state.screen === 'win' || world.state.screen === 'loss') {
          callbacks.restart();
        }
        break;
        
      case 'Escape':
        callbacks.toTitle();
        break;
    }
  }
  
  function handleMouseMove(e) {
    const pos = getMousePos(e);
    mouseX = pos.x;
    mouseY = pos.y;
    callbacks.updateMouse(mouseX, mouseY);
  }
  
  // Event listeners
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  
  // Expose current pointer position
  function getMousePosition() {
    return { x: mouseX, y: mouseY };
  }
  
  return {
    getMousePosition,
    destroy: () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
    }
  };
}

export { createInput };
