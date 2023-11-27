import type { CuttleKey } from '$lib/worker/config'

export const UNIFORM = ['xda', 'dsa', 'choc']

export function closestAspect(aspect: number) {
  if (aspect < 1) aspect = 1 / aspect
  if (aspect < 1.125) return 1
  if (aspect < 1.375) return 1.25
  if (aspect < 1.75) return 1.5
  return 2
}

const KEY_INFO: Record<string, Record<number, { depth: number; tilt: number }>> = {
  mt3: {
    0: { depth: 14.7, tilt: -12.5 },
    1: { depth: 13.1, tilt: -6 },
    2: { depth: 10.7, tilt: -6 },
    3: { depth: 10.7, tilt: 6 },
    4: { depth: 11.6, tilt: 12 },
    5: { depth: 11.6, tilt: 0 },
  },
  dsa: {
    0: { depth: 8.1, tilt: 0 },
  },
  xda: {
    0: { depth: 10.3, tilt: 0 },
  },
  choc: {
    0: { depth: 5, tilt: 0 },
  },
  sa: {
    1: { depth: 14.89, tilt: -13 },
    0: { depth: 14.89, tilt: -13 },
    2: { depth: 12.925, tilt: -7 },
    3: { depth: 12.5, tilt: 0 },
    4: { depth: 12.925, tilt: 7 },
    5: { depth: 12.5, tilt: 0 },
  },
  oem: {
    0: { depth: 11.2, tilt: -3 },
    1: { depth: 9.45, tilt: 1 },
    2: { depth: 9, tilt: 6 },
    3: { depth: 9.25, tilt: 9 },
    4: { depth: 9.25, tilt: 10 },
    5: { depth: 11.2, tilt: -3 },
  },
  cherry: {
    0: { depth: 9.8, tilt: 0 },
    1: { depth: 9.8, tilt: 0 },
    2: { depth: 7.45, tilt: 2.5 },
    3: { depth: 6.55, tilt: 5 },
    4: { depth: 6.7, tilt: 11.5 },
    5: { depth: 6.7, tilt: 11.5 },
  },
}

export const KEY_NAMES = {
  mt3: 'MT3',
  dsa: 'DSA',
  xda: 'XDA',
  choc: 'Kailh Choc',
  sa: 'SA',
  oem: 'OEM',
  Cherry: 'Cherry',
}

export function keyInfo(k: CuttleKey) {
  if (!('keycap' in k) || !(k.keycap.profile in KEY_INFO)) {
    return { depth: 10, tilt: 0 }
  }
  if (UNIFORM.includes(k.keycap.profile)) {
    return KEY_INFO[k.keycap.profile][0]
  }
  if (k.keycap.row <= 0) return KEY_INFO[k.keycap.profile][1]
  if (k.keycap.row > 5) return KEY_INFO[k.keycap.profile][5]
  return KEY_INFO[k.keycap.profile][k.keycap.row]
}

const FLIPPED_KEY = { 0: 1, 9: 2, 8: 3, 7: 4, 6: 5, p: 'q', o: 'w', i: 'e', u: 'r', y: 't', ';': 'a', l: 's', k: 'd', j: 'f', h: 'g', '/': 'z', '.': 'x', ',': 'c', 'm': 'v', n: 'b' }
for (const k of Object.keys(FLIPPED_KEY)) FLIPPED_KEY[FLIPPED_KEY[k]] = k

export function flippedKey(letter: string | undefined) {
  if (!letter) return letter
  return FLIPPED_KEY[letter] ?? letter
}
