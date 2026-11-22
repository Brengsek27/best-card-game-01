const config = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  SUITS: [
    { key: 'flame', name: 'Flame', colour: '#e2483a', glyph: '▲', description: 'Damage cards' },
    { key: 'tide', name: 'Tide', colour: '#3a86e2', glyph: '●', description: 'Guard and healing cards' },
    { key: 'thorn', name: 'Thorn', colour: '#43a85a', glyph: '♦', description: 'Guard and utility cards' },
    { key: 'star', name: 'Star', colour: '#e8b93a', glyph: '★', description: 'Draw and powerful cards' }
  ],
  LIFE_START: 30,
  MANA_MAX: 10,
  HAND_MAX: 7,
  DECK_SIZE: 24,
  RESONANCE_BONUS: 2,
  AI_DELAY_MS: 700,
  SCREENS: {
    TITLE: 'title',
    PLAY: 'play',
    WIN: 'win',
    LOSS: 'loss'
  },
  PLAYER_NAME: 'Warden of the Last Ember',
  ENEMY_NAME: 'Duchess Ashenvale'
};

export { config as default };
export { config };
