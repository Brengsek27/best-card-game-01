function createSfx() {
  let audioContext = null;
  let isInitialized = false;
  
  function init() {
    if (!isInitialized) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        isInitialized = true;
      } catch (e) {
        console.warn('Audio not supported:', e);
      }
    }
  }
  
  function playOscillator(frequency, duration, type = 'sine', volume = 0.1) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }
  
  function playNoise(duration, volume = 0.1) {
    if (!audioContext) return;
    
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    whiteNoise.buffer = buffer;
    whiteNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    whiteNoise.start(audioContext.currentTime);
    whiteNoise.stop(audioContext.currentTime + duration);
  }
  
  function click() {
    init();
    if (audioContext) {
      playOscillator(800, 0.05, 'square', 0.05);
      playOscillator(1200, 0.05, 'sine', 0.03);
    }
  }
  
  function deal() {
    init();
    if (audioContext) {
      playOscillator(400, 0.1, 'sine', 0.08);
    }
  }
  
  function playCard() {
    init();
    if (audioContext) {
      playOscillator(600, 0.15, 'triangle', 0.1);
      playOscillator(800, 0.1, 'sine', 0.05);
    }
  }
  
  function hit(power) {
    init();
    if (audioContext) {
      const frequency = 200 + (power * 50);
      playOscillator(frequency, 0.2, 'sawtooth', 0.15);
      playNoise(0.1, 0.1);
    }
  }
  
  function guard() {
    init();
    if (audioContext) {
      playOscillator(300, 0.3, 'sine', 0.08);
      playOscillator(500, 0.2, 'sine', 0.05);
    }
  }
  
  function heal() {
    init();
    if (audioContext) {
      playOscillator(800, 0.2, 'sine', 0.1);
      playOscillator(1000, 0.15, 'sine', 0.05);
      playOscillator(1200, 0.1, 'sine', 0.03);
    }
  }
  
  function draw() {
    init();
    if (audioContext) {
      playOscillator(500, 0.1, 'sine', 0.06);
    }
  }
  
  function win() {
    init();
    if (audioContext) {
      playOscillator(523, 0.2, 'sine', 0.1);
      playOscillator(659, 0.2, 'sine', 0.1);
      playOscillator(784, 0.3, 'sine', 0.1);
      playOscillator(1047, 0.4, 'sine', 0.1);
    }
  }
  
  function lose() {
    init();
    if (audioContext) {
      playOscillator(200, 0.3, 'sawtooth', 0.1);
      playOscillator(150, 0.3, 'sawtooth', 0.1);
      playOscillator(100, 0.4, 'sawtooth', 0.1);
    }
  }
  
  function turn() {
    init();
    if (audioContext) {
      playOscillator(400, 0.2, 'sine', 0.08);
      playOscillator(600, 0.2, 'sine', 0.08);
    }
  }
  
  return {
    click,
    deal,
    playCard,
    hit,
    guard,
    heal,
    draw,
    win,
    lose,
    turn
  };
}

export { createSfx };
