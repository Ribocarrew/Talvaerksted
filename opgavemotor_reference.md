# Opgave-motor — testet referenceimplementering (portér 1:1)

**Læs dette først:** koden i denne fil er ikke et forslag — det er den faktiske, gennemtestede logik fra den fungerende prototype, nu refaktoreret til at bruge en seedet, deterministisk tilfældighedsgenerator (så et opgavesæt kan genskabes præcist fra ét tal, jf. del/gem-funktionen i hovedpromptens afsnit 9.4). Alle matematiske egenskaber — pæne tal som standard, korrekt decimal-/negativtal-håndtering, dublet-fri generering — er verificeret med tusindvis af automatiske stikprøver, både før og efter denne refaktorering.

**Opgaven er at portere denne logik trofast til TypeScript, ikke at genopfinde den.** Sprogsyntaks, typer og filstruktur må selvfølgelig tilpasses TypeScript/React-konventioner, men de matematiske algoritmer — særligt "byg baglæns"-konstruktionerne i subtraktion, division og ligningerne, som er lette at få subtilt galt — skal bevares nøjagtigt som vist her. Hvis noget i denne fil ser mærkeligt eller unødigt komplekst ud (fx hvorfor subtraktion har to helt forskellige kodeveje afhængigt af `negativtal`), er det med vilje — det er der for at garantere en specifik matematisk egenskab. Ændr det ikke uden at forstå hvorfor, og hold under alle omstændigheder de underliggende tests fra afsnit 8 kørende efter porteringen.

---

## 1. Seedet tilfældighed (grundlaget for del/gem-funktionen)

Al tilfældighed i motoren skal gå gennem denne ene kilde — **ikke** `Math.random()` direkte nogen steder. Det gør hele genereringen deterministisk og dermed reproducerbar fra ét heltal.

```javascript
// Simpel, hurtig, deterministisk PRNG (mulberry32-varianten).
// Samme seed => samme sekvens af "tilfældige" tal, hver gang, i alle browsere.
function lavRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

`lavRNG(seed)` returnerer en funktion, der opfører sig som `Math.random()` (returnerer et tal i `[0, 1)`), men er 100 % deterministisk for et givent `seed`. Denne funktion (`rng`) sendes eksplicit ind i **alle** hjælpefunktioner og generatorer nedenfor — aldrig et globalt kald til `Math.random()`.

---

## 2. Hjælpefunktioner

```javascript
function tilfaeldigInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function tilfaeldigDecimal(rng, min, max) {
  return rund(min + rng() * (max - min), 1);
}

function tilfaeldigValg(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// Trækker et tal (heltal eller 1 decimal) og vender fortegnet om med 50 %
// sandsynlighed, hvis negativtal er slået til. "Tal fra/til" beskriver
// altid størrelsen (magnitude) — denne funktion er den eneste kilde til
// fortegn i hele motoren.
function tilfaeldigTal(rng, min, max, decimaltal, negativtal) {
  const t = decimaltal ? tilfaeldigDecimal(rng, min, max) : tilfaeldigInt(rng, min, max);
  return (negativtal && rng() < 0.5) ? -t : t;
}

function rund(tal, decimaler) {
  const f = Math.pow(10, decimaler);
  return Math.round(tal * f) / f;
}

// Dansk talformat: komma som decimalseparator, korrekt minustegn (U+2212,
// IKKE en almindelig bindestreg).
function formatTal(tal, decimaler) {
  const rundet = rund(tal, decimaler === undefined ? 2 : decimaler);
  const v = rundet === 0 ? 0 : rundet; // undgå visning af "-0"
  const fortegn = v < 0 ? '−' : '';
  return fortegn + Math.abs(v).toString().replace('.', ',');
}

// Negative faktorer i parentes, så "(−5) × 8" aldrig kan læses forkert.
function formaterFaktor(v) {
  return v < 0 ? `(${formatTal(v, 0)})` : formatTal(v, 0);
}

// Formaterer en liste led til et regnestykke med korrekt dansk fortegn,
// fx [8, -3, 5] med '+' bliver "8 − 3 + 5", ikke "8 + -3 + 5".
function formaterUdtryk(tal, op) {
  if (op === '×') return tal.map(formaterFaktor).join(' × ');
  let tekst = formatTal(tal[0], 0);
  for (let i = 1; i < tal.length; i++) {
    const v = tal[i];
    tekst += v >= 0 ? ` + ${formatTal(v, 0)}` : ` − ${formatTal(Math.abs(v), 0)}`;
  }
  return tekst;
}
```

---

## 3. Datamodel

```typescript
type Opgave = {
  template: string;        // fx "8 + 9 = __" — "__" er ÉN pladsholder for det ukendte
  facit?: number;           // det numeriske svar (findes altid undtagen ved tekst-facit)
  decimaler?: number;       // antal decimaler faciten skal vises med (0, 1 eller 3)
  erTekstFacit?: boolean;   // true for præcis ÉN opgavetype (algebraUdvid)
  facitTekst?: string;      // fx "3x + 6" — bruges når erTekstFacit er true
};

type Generator = (rng: () => number, params: Record<string, any>) => Opgave | null;
```

Enhver generator returnerer enten `null` (kunne ikke finde et gyldigt resultat inden for forsøgsgrænsen — kaldestedet skal håndtere dette ved at prøve igen) eller et `Opgave`-objekt.

---

## 4. De 16 generatorer

```javascript
// --- Addition / multiplikation ---
function genererAdditionMult(rng, op, params) {
  const { antalLed, talMin, talMax, negativtal } = params;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const tal = [];
    for (let i = 0; i < antalLed; i++) tal.push(tilfaeldigTal(rng, talMin, talMax, false, negativtal));
    let resultat = tal[0];
    for (let i = 1; i < tal.length; i++) resultat = op === '+' ? resultat + tal[i] : resultat * tal[i];
    if (op === '×' && Math.abs(resultat) > talMax * talMax * 3) continue; // undgå urimeligt store facit
    return { template: `${formaterUdtryk(tal, op)} = __`, facit: resultat, decimaler: 0 };
  }
  return null;
}

// --- Subtraktion ---
// Uden negativtal: bygges BAGLÆNS fra et ikke-negativt facit, så alle
// mellemregninger garanteret forbliver >= 0. Med negativtal: kun det
// første led (minuenden) må blive negativt — undgår dobbelt-fortegn som
// "3 − (−8)" og giver i stedet klassiske opgaver som "3 − 8 = −5".
function genererSubtraktion(rng, params) {
  const { antalLed, talMin, talMax, negativtal } = params;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    if (!negativtal) {
      const facit = tilfaeldigInt(rng, talMin, talMax);
      const led = [];
      let loebende = facit;
      for (let i = 1; i < antalLed; i++) {
        const t = tilfaeldigInt(rng, talMin, talMax);
        led.unshift(t);
        loebende += t;
      }
      if (loebende > talMax * antalLed) continue;
      const tal = [loebende, ...led];
      return { template: `${tal.join(' − ')} = __`, facit, decimaler: 0 };
    }
    const tal = [tilfaeldigTal(rng, talMin, talMax, false, true)];
    for (let i = 1; i < antalLed; i++) tal.push(tilfaeldigInt(rng, talMin, talMax));
    let resultat = tal[0];
    for (let i = 1; i < tal.length; i++) resultat -= tal[i];
    if (Math.abs(resultat) > talMax * antalLed * 2) continue;
    return { template: `${formaterUdtryk(tal, '+').replace(/ \+ /g, ' − ')} = __`, facit: resultat, decimaler: 0 };
  }
  return null;
}

// --- Division ---
// Uden decimaltal: bygges BAGLÆNS (facit 2-12, gang op med divisorer 2-12),
// så divisionen altid går exact op. Med decimaltal: to tal trækkes direkte,
// kvotienten afrundes til 1 decimal, og forkastes hvis den tilfældigvis
// blev et helt tal (vi vil netop have en ægte decimal). Med negativtal:
// fortegn vendes på facit OG dividend SAMMEN — divisorerne forbliver altid
// positive og pæne.
function genererDivision(rng, params) {
  const { antalLed, talMax, decimaltal, negativtal } = params;
  let forsog = 0;
  if (!decimaltal) {
    while (forsog < 300) {
      forsog++;
      let facit = tilfaeldigInt(rng, 2, 12);
      const divisorer = [];
      let p = facit;
      for (let i = 1; i < antalLed; i++) {
        const d = tilfaeldigInt(rng, 2, 12);
        divisorer.unshift(d);
        p *= d;
      }
      if (p > talMax) continue;
      if (negativtal && rng() < 0.5) { facit = -facit; p = -p; }
      const tal = [p, ...divisorer];
      return { template: `${tal.map(v => formatTal(v, 0)).join(' ÷ ')} = __`, facit, decimaler: 0 };
    }
    return null;
  } else {
    while (forsog < 300) {
      forsog++;
      let a = tilfaeldigInt(rng, 10, talMax);
      const b = tilfaeldigInt(rng, 2, 20);
      let facit = rund(a / b, 1);
      if (Number.isInteger(facit)) continue;
      if (negativtal && rng() < 0.5) { facit = -facit; a = -a; }
      return { template: `${formatTal(a, 0)} ÷ ${b} = __`, facit, decimaler: 1 };
    }
    return null;
  }
}

// --- Multiplikationstabel ---
function genererTabel(rng, params) {
  const { talMax, negativtal } = params;
  const a = tilfaeldigTal(rng, 0, talMax, false, negativtal);
  const b = tilfaeldigTal(rng, 0, talMax, false, negativtal);
  return { template: `${formaterFaktor(a)} · ${formaterFaktor(b)} = __`, facit: a * b, decimaler: 0 };
}

// --- Procent (fælles kerne til alle tre varianter) ---
// p = procentsats, g = grundtal, del = p% af g. Variant afgør hvilket af
// de tre tal der er den ukendte.
function genererProcent(rng, variant, params) {
  const { talMin, talMax, decimaltal } = params;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const p = tilfaeldigInt(rng, 1, 99);
    const g = tilfaeldigInt(rng, talMin, talMax);
    let del = (p * g) / 100;
    if (!decimaltal) { if (!Number.isInteger(del)) continue; }
    else del = rund(del, 1);
    const delTekst = formatTal(del, decimaltal ? 1 : 0);
    if (variant === 'del') return { template: `${p}% af ${g} = __`, facit: del, decimaler: decimaltal ? 1 : 0 };
    if (variant === 'sats') return { template: `${delTekst} er __ % af ${g}`, facit: p, decimaler: 0 };
    if (variant === 'grundtal') return { template: `${delTekst} er ${p}% af __`, facit: g, decimaler: 0 };
  }
  return null;
}

// --- Længdeomregning ---
function genererLaengde(rng, params) {
  const { enhederValgt, decimaltal } = params;
  const faktor = { mm: 1, cm: 10, dm: 100, m: 1000 };
  if (!enhederValgt || enhederValgt.length < 2) return null;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const fra = tilfaeldigValg(rng, enhederValgt);
    const muligeTil = enhederValgt.filter(e => e !== fra);
    const til = tilfaeldigValg(rng, muligeTil);
    const vaerdiFra = tilfaeldigInt(rng, 1, 999);
    let vaerdiTil = (vaerdiFra * faktor[fra]) / faktor[til];
    if (!decimaltal) { if (!Number.isInteger(vaerdiTil)) continue; }
    else vaerdiTil = rund(vaerdiTil, 3);
    return { template: `${vaerdiFra} ${fra} = __ ${til}`, facit: vaerdiTil, decimaler: decimaltal ? 3 : 0 };
  }
  return null;
}

// --- Ligning: ettrins ---
function genererLigningEttrin(rng, params) {
  const { talMin, talMax, decimaltal, negativtal } = params;
  const dec = decimaltal ? 1 : 0;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const form = tilfaeldigValg(rng, ['+', '-', '×', '÷']);
    if (form === '+') {
      const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
      const a = tilfaeldigInt(rng, talMin, talMax);
      const b = rund(x + a, dec);
      return { template: `x + ${a} = ${formatTal(b, dec)}, x = __`, facit: x, decimaler: dec };
    }
    if (form === '-') {
      const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
      const a = tilfaeldigInt(rng, talMin, talMax);
      const b = rund(x - a, dec);
      if (!negativtal && b < 0) continue;
      return { template: `x − ${a} = ${formatTal(b, dec)}, x = __`, facit: x, decimaler: dec };
    }
    if (form === '×') {
      const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
      const a = tilfaeldigInt(rng, 2, 12);
      const b = rund(a * x, dec);
      return { template: `${a}x = ${formatTal(b, dec)}, x = __`, facit: x, decimaler: dec };
    }
    // division: byg baglæns (a · b = x), så x er nøjagtig facit
    const a = tilfaeldigInt(rng, 2, 12);
    const b = tilfaeldigTal(rng, 2, 20, decimaltal, negativtal);
    const x = rund(a * b, dec);
    return { template: `x ÷ ${a} = ${formatTal(b, dec)}, x = __`, facit: x, decimaler: dec };
  }
  return null;
}

// --- Ligning: totrins ---
function genererLigningTotrin(rng, params) {
  const { talMin, talMax, decimaltal, negativtal } = params;
  const dec = decimaltal ? 1 : 0;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const form = tilfaeldigValg(rng, ['ax+b', 'ax-b', 'a(x+b)', 'a(x-b)']);
    const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
    const a = tilfaeldigInt(rng, 2, 9);
    const b = tilfaeldigInt(rng, 1, talMax);
    let venstre, c;
    if (form === 'ax+b') { venstre = `${a}x + ${b}`; c = rund(a * x + b, dec); }
    else if (form === 'ax-b') { venstre = `${a}x − ${b}`; c = rund(a * x - b, dec); }
    else if (form === 'a(x+b)') { venstre = `${a}(x + ${b})`; c = rund(a * (x + b), dec); }
    else { venstre = `${a}(x − ${b})`; c = rund(a * (x - b), dec); }
    if (!negativtal && c < 0) continue;
    if (Math.abs(c) > talMax * 20) continue;
    return { template: `${venstre} = ${formatTal(c, dec)}, x = __`, facit: x, decimaler: dec };
  }
  return null;
}

// --- Ligning: x på begge sider ---
function genererLigningXBegge(rng, params) {
  const { talMin, talMax, decimaltal, negativtal } = params;
  const dec = decimaltal ? 1 : 0;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
    const a = tilfaeldigInt(rng, 2, 9);
    const c = tilfaeldigInt(rng, 2, 9);
    if (c === a) continue; // skal være forskellige koefficienter for én entydig løsning
    const b = tilfaeldigInt(rng, 1, talMax);
    const d = rund((a - c) * x + b, dec);
    if (d < -talMax * 20 || d > talMax * 20) continue;
    const venstre = `${a}x + ${b}`;
    const hoejre = d >= 0 ? `${c}x + ${formatTal(d, dec)}` : `${c}x − ${formatTal(Math.abs(d), dec)}`;
    return { template: `${venstre} = ${hoejre}, x = __`, facit: x, decimaler: dec };
  }
  return null;
}

// --- Ligning med to bogstaver: pA + qB = rA + sB, find A = kB ---
function genererLigningBogstaver(rng, params) {
  const { talMax, decimaltal, negativtal } = params;
  const dec = decimaltal ? 1 : 0;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const p = tilfaeldigInt(rng, 2, talMax);
    const r = tilfaeldigInt(rng, 2, talMax);
    if (p === r) continue;
    const q = tilfaeldigInt(rng, 1, talMax);
    const k = tilfaeldigTal(rng, 1, 10, decimaltal, negativtal);
    const s = rund(q + k * (p - r), dec);
    if (!negativtal && s <= 0) continue;
    if (Math.abs(s) > talMax * 3) continue;
    const hoejreB = s >= 0 ? `+ ${formatTal(s, dec)}B` : `− ${formatTal(Math.abs(s), dec)}B`;
    return { template: `${p}A + ${q}B = ${r}A ${hoejreB}, A = __B`, facit: k, decimaler: dec };
  }
  return null;
}

// --- Algebra: reducer udtryk ---
// Uden negativtal: alle led er positive (ren addition, fx "3x + 5x + 2x").
// Med negativtal: led kan trækkes fra, og facit kan blive negativ.
function genererAlgebraReducer(rng, params) {
  const { antalLed, talMax, negativtal } = params;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const koef = [tilfaeldigInt(rng, 1, talMax)];
    for (let i = 1; i < antalLed; i++) {
      let k = tilfaeldigInt(rng, 1, talMax);
      if (negativtal && rng() < 0.5) k = -k;
      koef.push(k);
    }
    const facit = koef.reduce((a, b) => a + b, 0);
    if (facit === 0) continue; // "0x"-opgaver er pædagogisk uinteressante
    let tekst = `${koef[0]}x`;
    for (let i = 1; i < koef.length; i++) tekst += koef[i] >= 0 ? ` + ${koef[i]}x` : ` − ${Math.abs(koef[i])}x`;
    return { template: `${tekst} = __x`, facit, decimaler: 0 };
  }
  return null;
}

// --- Algebra: indsæt tal i udtryk ---
function genererAlgebraIndsaet(rng, params) {
  const { talMin, talMax, decimaltal, negativtal } = params;
  const dec = decimaltal ? 1 : 0;
  const a = tilfaeldigInt(rng, 1, talMax);
  const b = tilfaeldigInt(rng, 0, talMax);
  const xVal = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
  const facit = rund(a * xVal + b, dec);
  const udtryk = b > 0 ? `${a}x + ${b}` : `${a}x`;
  return { template: `Når x = ${formatTal(xVal, dec)}: ${udtryk} = __`, facit, decimaler: dec };
}

// --- Algebra: udvid parenteser ---
// Faciten er her et UDTRYK (fx "3x + 6"), ikke ét tal — eneste opgavetype
// med erTekstFacit: true. Ingen "generér-og-valider"-løkke nødvendig,
// resultatet er altid gyldigt uanset trukne værdier.
function genererAlgebraUdvid(rng, params) {
  const { talMax } = params;
  const a = tilfaeldigInt(rng, 2, talMax);
  const b = tilfaeldigInt(rng, 1, talMax);
  const fortegn = tilfaeldigValg(rng, ['+', '−']);
  const opgaveTekst = `${a}(x ${fortegn} ${b})`;
  const konstant = fortegn === '+' ? a * b : -(a * b);
  const facitTekst = konstant >= 0 ? `${a}x + ${konstant}` : `${a}x − ${Math.abs(konstant)}`;
  return { template: `${opgaveTekst} = __`, erTekstFacit: true, facitTekst };
}
```

---

## 5. Opgavetype-register (metadata + UI-kontroller + standardparametre)

Dette register driver både genereringen og den dynamiske UI (hvilke parameterfelter der vises for hver type). `felter` er en liste af UI-kontrol-nøgler; se hovedpromptens afsnit 6 for hvad hver kontrol betyder konkret.

```javascript
const OPGAVETYPER = [
  { id: 'addition', navn: 'Addition (+)', kategori: 'regnearter', eksempel: '8 + 5 + 3 = __',
    felter: ['antalLed', 'talMinMax', 'negativtal'],
    standard: { antalLed: 2, talMin: 1, talMax: 100, negativtal: false },
    generer: (rng, p) => genererAdditionMult(rng, '+', p) },

  { id: 'subtraktion', navn: 'Subtraktion (−)', kategori: 'regnearter', eksempel: '12 − 4 = __',
    felter: ['antalLed', 'talMinMax', 'negativtal'],
    standard: { antalLed: 2, talMin: 1, talMax: 100, negativtal: false },
    generer: (rng, p) => genererSubtraktion(rng, p) },

  { id: 'multiplikation', navn: 'Multiplikation (×)', kategori: 'regnearter', eksempel: '6 × 7 = __',
    felter: ['antalLed', 'talMinMax', 'negativtal'],
    standard: { antalLed: 2, talMin: 1, talMax: 12, negativtal: false },
    generer: (rng, p) => genererAdditionMult(rng, '×', p) },

  { id: 'division', navn: 'Division (÷)', kategori: 'regnearter', eksempel: '36 ÷ 6 = __',
    felter: ['antalLed', 'talMax', 'decimaltal', 'negativtal'],
    standard: { antalLed: 2, talMax: 100, decimaltal: false, negativtal: false },
    generer: (rng, p) => genererDivision(rng, p) },

  { id: 'tabel', navn: 'Multiplikationstabel', kategori: 'regnearter', eksempel: '3 · 5 = __',
    felter: ['talMax9', 'negativtal'],
    standard: { talMax: 9, negativtal: false },
    generer: (rng, p) => genererTabel(rng, p) },

  { id: 'procentDel', navn: 'Procent – find del', kategori: 'procent', eksempel: '56% af 700 = __',
    felter: ['talMinMax', 'decimaltal'],
    standard: { talMin: 50, talMax: 900, decimaltal: false },
    generer: (rng, p) => genererProcent(rng, 'del', p) },

  { id: 'procentSats', navn: 'Procent – find sats', kategori: 'procent', eksempel: '434 er __% af 700',
    felter: ['talMinMax'],
    standard: { talMin: 50, talMax: 900 },
    generer: (rng, p) => genererProcent(rng, 'sats', p) },

  { id: 'procentGrundtal', navn: 'Procent – find grundtal', kategori: 'procent', eksempel: '434 er 56% af __',
    felter: ['talMinMax'],
    standard: { talMin: 50, talMax: 900 },
    generer: (rng, p) => genererProcent(rng, 'grundtal', p) },

  { id: 'laengde', navn: 'Længdeomregning (mm/cm/dm/m)', kategori: 'enheder', eksempel: '4,7 cm = __ mm',
    felter: ['enheder', 'decimaltal'],
    standard: { enhederValgt: ['mm', 'cm', 'dm', 'm'], decimaltal: false },
    generer: (rng, p) => genererLaengde(rng, p) },

  { id: 'ligningEttrin', navn: 'Ligning – ettrins', kategori: 'algebra', eksempel: 'x + 5 = 12, x = __',
    felter: ['talMinMax', 'decimaltal', 'negativtal'],
    standard: { talMin: 1, talMax: 20, decimaltal: false, negativtal: false },
    generer: (rng, p) => genererLigningEttrin(rng, p) },

  { id: 'ligningTotrin', navn: 'Ligning – totrins', kategori: 'algebra', eksempel: '2x + 4 = 16, x = __',
    felter: ['talMinMax', 'decimaltal', 'negativtal'],
    standard: { talMin: 1, talMax: 20, decimaltal: false, negativtal: false },
    generer: (rng, p) => genererLigningTotrin(rng, p) },

  { id: 'ligningXBegge', navn: 'Ligning – x på begge sider', kategori: 'algebra', eksempel: '3x + 4 = x + 12, x = __',
    felter: ['talMinMax', 'decimaltal', 'negativtal'],
    standard: { talMin: 1, talMax: 15, decimaltal: false, negativtal: false },
    generer: (rng, p) => genererLigningXBegge(rng, p) },

  { id: 'ligningBogstaver', navn: 'Ligning med bogstaver (A og B)', kategori: 'algebra', eksempel: '3A + 5B = 2A + 10B, A = __B',
    felter: ['koefMax', 'decimaltal', 'negativtal'],
    standard: { talMax: 9, decimaltal: false, negativtal: false },
    generer: (rng, p) => genererLigningBogstaver(rng, p) },

  { id: 'algebraReducer', navn: 'Algebra – reducer udtryk', kategori: 'algebra', eksempel: '3x + 5x − 2x = __x',
    felter: ['antalLed', 'koefMax', 'negativtal'],
    standard: { antalLed: 3, talMax: 9, negativtal: false },
    generer: (rng, p) => genererAlgebraReducer(rng, p) },

  { id: 'algebraIndsaet', navn: 'Algebra – indsæt tal i udtryk', kategori: 'algebra', eksempel: 'Når x = 4: 2x + 3 = __',
    felter: ['talMinMax', 'decimaltal', 'negativtal'],
    standard: { talMin: 1, talMax: 12, decimaltal: false, negativtal: false },
    generer: (rng, p) => genererAlgebraIndsaet(rng, p) },

  { id: 'algebraUdvid', navn: 'Algebra – udvid parenteser', kategori: 'algebra', eksempel: '3(x + 2) = __',
    felter: ['koefMax'],
    standard: { talMax: 9 },
    generer: (rng, p) => genererAlgebraUdvid(rng, p) }
];
```

---

## 6. Sværhedsgrad-presets (eksakte værdier)

```javascript
const SVAERHEDSGRADER = {
  let: {
    addition: { antalLed: 2, talMin: 1, talMax: 20, negativtal: false },
    subtraktion: { antalLed: 2, talMin: 1, talMax: 20, negativtal: false },
    multiplikation: { antalLed: 2, talMin: 1, talMax: 5, negativtal: false },
    division: { antalLed: 2, talMax: 20, decimaltal: false, negativtal: false },
    tabel: { talMax: 5, negativtal: false },
    procentDel: { talMin: 10, talMax: 100, decimaltal: false },
    procentSats: { talMin: 10, talMax: 100 },
    procentGrundtal: { talMin: 10, talMax: 100 },
    laengde: { decimaltal: false },
    ligningEttrin: { talMin: 1, talMax: 10, decimaltal: false, negativtal: false },
    ligningTotrin: { talMin: 1, talMax: 10, decimaltal: false, negativtal: false },
    ligningXBegge: { talMin: 1, talMax: 8, decimaltal: false, negativtal: false },
    ligningBogstaver: { talMax: 6, decimaltal: false, negativtal: false },
    algebraReducer: { antalLed: 2, talMax: 5, negativtal: false },
    algebraIndsaet: { talMin: 1, talMax: 6, decimaltal: false, negativtal: false },
    algebraUdvid: { talMax: 5 }
  },
  mellem: {
    addition: { antalLed: 2, talMin: 1, talMax: 100, negativtal: false },
    subtraktion: { antalLed: 2, talMin: 1, talMax: 100, negativtal: false },
    multiplikation: { antalLed: 2, talMin: 1, talMax: 10, negativtal: false },
    division: { antalLed: 2, talMax: 100, decimaltal: false, negativtal: false },
    tabel: { talMax: 9, negativtal: false },
    procentDel: { talMin: 50, talMax: 500, decimaltal: false },
    procentSats: { talMin: 50, talMax: 500 },
    procentGrundtal: { talMin: 50, talMax: 500 },
    laengde: { decimaltal: false },
    ligningEttrin: { talMin: 1, talMax: 20, decimaltal: false, negativtal: false },
    ligningTotrin: { talMin: 1, talMax: 15, decimaltal: false, negativtal: false },
    ligningXBegge: { talMin: 1, talMax: 12, decimaltal: false, negativtal: false },
    ligningBogstaver: { talMax: 9, decimaltal: false, negativtal: false },
    algebraReducer: { antalLed: 3, talMax: 9, negativtal: true },
    algebraIndsaet: { talMin: 1, talMax: 12, decimaltal: false, negativtal: false },
    algebraUdvid: { talMax: 9 }
  },
  svaer: {
    addition: { antalLed: 4, talMin: 1, talMax: 200, negativtal: true },
    subtraktion: { antalLed: 4, talMin: 1, talMax: 200, negativtal: true },
    multiplikation: { antalLed: 3, talMin: 1, talMax: 12, negativtal: true },
    division: { antalLed: 3, talMax: 300, decimaltal: true, negativtal: true },
    tabel: { talMax: 12, negativtal: true },
    procentDel: { talMin: 100, talMax: 900, decimaltal: true },
    procentSats: { talMin: 100, talMax: 900 },
    procentGrundtal: { talMin: 100, talMax: 900 },
    laengde: { decimaltal: true },
    ligningEttrin: { talMin: 1, talMax: 40, decimaltal: true, negativtal: true },
    ligningTotrin: { talMin: 1, talMax: 30, decimaltal: true, negativtal: true },
    ligningXBegge: { talMin: 1, talMax: 20, decimaltal: true, negativtal: true },
    ligningBogstaver: { talMax: 15, decimaltal: true, negativtal: true },
    algebraReducer: { antalLed: 4, talMax: 15, negativtal: true },
    algebraIndsaet: { talMin: 1, talMax: 20, decimaltal: true, negativtal: true },
    algebraUdvid: { talMax: 15 }
  }
};
```

---

## 7. Hovedgenerering, dublet-fri, sideopdeling og seed/del-funktion

```javascript
// Genererer et helt arbejdsark: dublet-fri (på tekstniveau), deterministisk
// ud fra seed. aktiveTyper er en liste af { id, generer, params } for de
// typer, læreren har valgt, hver med sine egne, aktuelle parameterværdier.
function genererArbejdsark(seed, aktiveTyper, antalOpgaver) {
  const rng = lavRNG(seed);
  const liste = [];
  const setTemplates = new Set();
  let sikkerhed = 0;
  const maksForsog = antalOpgaver * 300;
  while (liste.length < antalOpgaver && sikkerhed < maksForsog) {
    sikkerhed++;
    const type = tilfaeldigValg(rng, aktiveTyper);
    const resultat = type.generer(rng, type.params);
    if (!resultat) continue;
    if (setTemplates.has(resultat.template)) continue; // dublet — spring over
    setTemplates.add(resultat.template);
    liste.push(resultat);
  }
  return liste; // NB: kan være kortere end antalOpgaver, hvis talrummet er for lille — se afsnit 9 i hovedprompten
}

// Deler en opgaveliste op i "sider" til print, ud fra kolonneantal og
// ønsket antal rækker pr. side.
function delOpiSider(opgaveListe, kolonner, raekkerPrSide) {
  const maksPrSide = Math.max(kolonner, raekkerPrSide * kolonner);
  const sider = [];
  for (let i = 0; i < opgaveListe.length; i += maksPrSide) {
    sider.push(opgaveListe.slice(i, i + maksPrSide));
  }
  return sider;
}
```

### Del/gem-funktion (seed i URL)

Al tilstand, der er nødvendig for at genskabe et arbejdsark 100 % nøjagtigt, er: `seed` + `antalOpgaver` + `kolonner` + `raekkerPrSide` + hvilke typer der er aktive med hvilke parametre. Kod dette som ét JSON-objekt, base64-encod det URL-sikkert, og læg det i én enkelt query-parameter:

```javascript
// Kodning (ved klik på "Generér" eller "Del dette ark")
function kodTilUrl(tilstandObjekt) {
  const json = JSON.stringify(tilstandObjekt);
  const base64 = btoa(unescape(encodeURIComponent(json))); // UTF-8-sikker base64
  return `${location.origin}${location.pathname}?d=${base64}`;
}

// Afkodning (ved sideindlæsning)
function afkodFraUrl() {
  const params = new URLSearchParams(location.search);
  const d = params.get('d');
  if (!d) return null;
  try {
    const json = decodeURIComponent(escape(atob(d)));
    return JSON.parse(json);
  } catch {
    return null; // ugyldigt/korrupt link — start med standardtilstand i stedet
  }
}

// tilstandObjekt-facon:
// {
//   seed: 424242,
//   antalOpgaver: 24,
//   kolonner: 4,
//   raekkerPrSide: 18,
//   aktive: {
//     addition: { antalLed: 2, talMin: 1, talMax: 100, negativtal: false },
//     multiplikation: { antalLed: 2, talMin: 1, talMax: 12, negativtal: false }
//   }
// }
```

**Adfærd:**
- Når appen indlæses **uden** `?d=`-parameter: brug standardtilstanden (addition + multiplikation aktive, som i dag), generér intet automatisk.
- Når appen indlæses **med** en gyldig `?d=`-parameter: gendan alle parameterfelter i UI'et til de afkodede værdier, og generér automatisk det eksakte samme opgavesæt med det samme (samme seed ⇒ identisk resultat, verificeret i afsnit 8).
- Ved klik på **"Generér arbejdsark"**: generér et nyt tilfældigt `seed` (fx `Math.floor(Math.random() * 1e9)` — det er OK at bruge ægte `Math.random()` her, da det kun er til at *vælge* et nyt seed, ikke til selve opgavegenereringen), opdatér URL'en via `history.replaceState`, og vis en "Kopiér link"-knap ved siden af arket.
- Ugyldigt/korrupt `?d=`-indhold skal fejle blødt (falde tilbage til standardtilstand), aldrig kaste en uhåndteret fejl.

---

## 8. Krav til automatiseret verificering (skal gøres, ikke kun "se rigtigt ud i browseren")

Denne motor er allerede verificeret med følgende testmønstre — samme mønstre skal genetableres som en del af Antigravity-implementeringen (fx som Vitest-tests), og skal bestå, før noget betragtes som klar:

1. **"Pænt tal"-garanti**: for hver af de 11 typer med `negativtal`-tilvalg, generér 2000+ opgaver med `negativtal: false` og assertér, at facit aldrig er negativ.
2. **Negativtal fungerer reelt**: samme typer med `negativtal: true` — assertér, at negative facit rent faktisk forekommer (ikke bare er "tilladt" i teorien).
3. **Matematisk korrekthed, uafhængigt genberegnet**: for hver type, parse den genererede `template`-streng og genberegn facit fra bunden (uden at bruge generatorens egen kode) — sammenlign med det returnerede `facit`. Dette fangede reelle fejl under den oprindelige udvikling og er ikke overflødigt.
4. **Reproducerbarhed**: samme `seed` + samme parametre + samme antal opgaver ⇒ byte-for-byte identisk resultat, to gange i træk. Forskelligt seed ⇒ forskelligt resultat.
5. **Dublet-fri, også ved lille talrum**: med et kunstigt lille parameterinterval (fx multiplikationstabel med `talMax: 3`, som kun har 16 mulige unikke kombinationer), bed om flere opgaver end det matematisk mulige (fx 40), og assertér at resultatet stopper ved 16 unikke — ikke hænger, og ikke returnerer dubletter.
6. **Sideopdeling**: for forskellige kombinationer af antal opgaver / kolonner / rækker-pr-side, assertér at ingen opgaver forsvinder eller duplikeres på tværs af sider, og at sidestørrelserne matcher den forventede fordeling.

---

## 9. Skal IKKE portes direkte (kun til reference i denne fil)

Denne fils formål er kernelogikken. UI-rendering, CSS, DOM-manipulation og knap-event-håndtering fra den oprindelige prototype skal **ikke** genbruges — de skal bygges helt forfra i React/TypeScript efter designsystemet og komponentstrukturen i hovedpromptens afsnit 3–4 og 8–9. Det er kun matematikken i denne fil, der er "hellig".
