// Simpel, hurtig, deterministisk PRNG (mulberry32-varianten).
// Samme seed => samme sekvens af "tilfældige" tal, hver gang, i alle browsere.
export function lavRNG(seed: number): () => number {
  let s = seed >>> 0;
  return function (): number {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function tilfaeldigInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function rund(tal: number, decimaler: number): number {
  const f = Math.pow(10, decimaler);
  return Math.round(tal * f) / f;
}

export function tilfaeldigDecimal(rng: () => number, min: number, max: number): number {
  return rund(min + rng() * (max - min), 1);
}

export function tilfaeldigValg<T>(rng: () => number, arr: readonly T[] | T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Trækker et tal (heltal eller 1 decimal) og vender fortegnet om med 50 %
// sandsynlighed, hvis negativtal er slået til. "Tal fra/til" beskriver
// altid størrelsen (magnitude) — denne funktion er den eneste kilde til
// fortegn i hele motoren.
export function tilfaeldigTal(
  rng: () => number,
  min: number,
  max: number,
  decimaltal?: boolean,
  negativtal?: boolean
): number {
  const t = decimaltal ? tilfaeldigDecimal(rng, min, max) : tilfaeldigInt(rng, min, max);
  return (negativtal && rng() < 0.5) ? -t : t;
}

// Dansk talformat: komma som decimalseparator, korrekt minustegn (U+2212,
// IKKE en almindelig bindestreg).
export function formatTal(tal: number, decimaler?: number): string {
  const rundet = rund(tal, decimaler === undefined ? 2 : decimaler);
  const v = rundet === 0 ? 0 : rundet; // undgå visning af "-0"
  const fortegn = v < 0 ? '−' : '';
  return fortegn + Math.abs(v).toString().replace('.', ',');
}

// Negative faktorer i parentes, så "(−5) × 8" aldrig kan læses forkert.
export function formaterFaktor(v: number): string {
  return v < 0 ? `(${formatTal(v, 0)})` : formatTal(v, 0);
}

// Formaterer en liste led til et regnestykke med korrekt dansk fortegn,
// fx [8, -3, 5] med '+' bliver "8 − 3 + 5", ikke "8 + -3 + 5".
export function formaterUdtryk(tal: number[], op: string): string {
  if (op === '×') return tal.map(formaterFaktor).join(' × ');
  let tekst = formatTal(tal[0], 0);
  for (let i = 1; i < tal.length; i++) {
    const v = tal[i];
    tekst += v >= 0 ? ` + ${formatTal(v, 0)}` : ` − ${formatTal(Math.abs(v), 0)}`;
  }
  return tekst;
}
