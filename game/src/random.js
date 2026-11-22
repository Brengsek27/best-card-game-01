export function makeRng(seed) {
  let t = seed >>> 0;
  const rng = {
    next: () => {
      t |= 0;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t += t + t | 0;
      return (t >>> 0) / 4294967296;
    },
    int: (min, max) => Math.floor(min + rng.next() * (max - min + 1)),
    pick: (array) => array[Math.floor(rng.next() * array.length)],
    shuffle: (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
  };
  return rng;
}
