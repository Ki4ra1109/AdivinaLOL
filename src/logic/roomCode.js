// src/logic/roomCode.js

// Convierte un string en un número (seed) reproducible
export function stringToSeed(str) {
  const normalized = str.trim().toUpperCase();
  let hash = 0;

  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0; // entero positivo
  }

  return hash || 123456789; // fallback si el código está vacío
}

// Generador pseudoaleatorio simple con seed (LCG)
export function makeRNG(seed) {
  let x = seed || 123456789;

  return function () {
    x = (1664525 * x + 1013904223) % 4294967296;
    return x / 4294967296; // entre 0 y 1
  };
}

// A partir de TODOS los campeones, elige siempre los mismos "count"
// en función del código de sala
export function getExpressChampions(allChampions, roomCode, count = 20) {
  if (!roomCode || !allChampions || allChampions.length === 0) {
    return [];
  }

  const seed = stringToSeed(roomCode);
  const rng = makeRNG(seed);

  // copiamos el array para no mutar el original
  const pool = [...allChampions];

  // Fisher–Yates shuffle, pero usando nuestro rng
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}
