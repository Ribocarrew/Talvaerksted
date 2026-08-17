import { Opgave } from './types';
import {
  tilfaeldigInt,
  tilfaeldigValg,
  tilfaeldigTal,
  rund,
  formatTal,
  formaterFaktor,
  formaterUdtryk,
} from './rng';

// --- Addition / multiplikation ---
export function genererAdditionMult(
  rng: () => number,
  op: '+' | '×',
  params: Record<string, any>
): Opgave | null {
  const { antalLed = 2, talMin = 1, talMax = 100, negativtal = false } = params;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const tal: number[] = [];
    for (let i = 0; i < antalLed; i++) {
      tal.push(tilfaeldigTal(rng, talMin, talMax, false, negativtal));
    }
    let resultat = tal[0];
    for (let i = 1; i < tal.length; i++) {
      resultat = op === '+' ? resultat + tal[i] : resultat * tal[i];
    }
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
export function genererSubtraktion(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { antalLed = 2, talMin = 1, talMax = 100, negativtal = false } = params;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    if (!negativtal) {
      const facit = tilfaeldigInt(rng, talMin, talMax);
      const led: number[] = [];
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
    for (let i = 1; i < antalLed; i++) {
      tal.push(tilfaeldigInt(rng, talMin, talMax));
    }
    let resultat = tal[0];
    for (let i = 1; i < tal.length; i++) {
      resultat -= tal[i];
    }
    if (Math.abs(resultat) > talMax * antalLed * 2) continue;
    return {
      template: `${formaterUdtryk(tal, '+').replace(/ \+ /g, ' − ')} = __`,
      facit: resultat,
      decimaler: 0,
    };
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
export function genererDivision(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { antalLed = 2, talMax = 100, decimaltal = false, negativtal = false } = params;
  let forsog = 0;
  if (!decimaltal) {
    while (forsog < 300) {
      forsog++;
      let facit = tilfaeldigInt(rng, 2, 12);
      const divisorer: number[] = [];
      let p = facit;
      for (let i = 1; i < antalLed; i++) {
        const d = tilfaeldigInt(rng, 2, 12);
        divisorer.unshift(d);
        p *= d;
      }
      if (p > talMax) continue;
      if (negativtal && rng() < 0.5) {
        facit = -facit;
        p = -p;
      }
      const tal = [p, ...divisorer];
      return {
        template: `${tal.map((v) => formatTal(v, 0)).join(' ÷ ')} = __`,
        facit,
        decimaler: 0,
      };
    }
    return null;
  } else {
    while (forsog < 300) {
      forsog++;
      let a = tilfaeldigInt(rng, 10, talMax);
      const b = tilfaeldigInt(rng, 2, 20);
      let facit = rund(a / b, 1);
      if (Number.isInteger(facit)) continue;
      if (negativtal && rng() < 0.5) {
        facit = -facit;
        a = -a;
      }
      return {
        template: `${formatTal(a, 0)} ÷ ${b} = __`,
        facit,
        decimaler: 1,
      };
    }
    return null;
  }
}

// --- Multiplikationstabel ---
export function genererTabel(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { talMax = 9, negativtal = false } = params;
  const a = tilfaeldigTal(rng, 0, talMax, false, negativtal);
  const b = tilfaeldigTal(rng, 0, talMax, false, negativtal);
  return {
    template: `${formaterFaktor(a)} · ${formaterFaktor(b)} = __`,
    facit: a * b,
    decimaler: 0,
  };
}

// --- Procent (fælles kerne til alle tre varianter) ---
// p = procentsats, g = grundtal, del = p% af g. Variant afgør hvilket af
// de tre tal der er den ukendte.
export function genererProcent(
  rng: () => number,
  variant: 'del' | 'sats' | 'grundtal',
  params: Record<string, any>
): Opgave | null {
  const { talMin = 50, talMax = 900, decimaltal = false } = params;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const p = tilfaeldigInt(rng, 1, 99);
    const g = tilfaeldigInt(rng, talMin, talMax);
    let del = (p * g) / 100;
    if (!decimaltal) {
      if (!Number.isInteger(del)) continue;
    } else {
      del = rund(del, 1);
    }
    const delTekst = formatTal(del, decimaltal ? 1 : 0);
    if (variant === 'del') {
      return {
        template: `${p}% af ${g} = __`,
        facit: del,
        decimaler: decimaltal ? 1 : 0,
      };
    }
    if (variant === 'sats') {
      return {
        template: `${delTekst} er __ % af ${g}`,
        facit: p,
        decimaler: 0,
      };
    }
    if (variant === 'grundtal') {
      return {
        template: `${delTekst} er ${p}% af __`,
        facit: g,
        decimaler: 0,
      };
    }
  }
  return null;
}

// --- Længdeomregning ---
export function genererLaengde(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { enhederValgt = ['mm', 'cm', 'dm', 'm'], decimaltal = false } = params;
  const faktor: Record<string, number> = { mm: 1, cm: 10, dm: 100, m: 1000 };
  if (!enhederValgt || enhederValgt.length < 2) return null;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const fra = tilfaeldigValg(rng, enhederValgt) as string;
    const muligeTil = enhederValgt.filter((e: string) => e !== fra);
    const til = tilfaeldigValg(rng, muligeTil) as string;
    const vaerdiFra = tilfaeldigInt(rng, 1, 999);
    let vaerdiTil = (vaerdiFra * (faktor[fra] || 1)) / (faktor[til] || 1);
    if (!decimaltal) {
      if (!Number.isInteger(vaerdiTil)) continue;
    } else {
      vaerdiTil = rund(vaerdiTil, 3);
    }
    return {
      template: `${vaerdiFra} ${fra} = __ ${til}`,
      facit: vaerdiTil,
      decimaler: decimaltal ? 3 : 0,
    };
  }
  return null;
}

// --- Ligning: ettrins ---
export function genererLigningEttrin(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { talMin = 1, talMax = 20, decimaltal = false, negativtal = false } = params;
  const dec = decimaltal ? 1 : 0;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const form = tilfaeldigValg(rng, ['+', '-', '×', '÷'] as const);
    if (form === '+') {
      const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
      const a = tilfaeldigInt(rng, talMin, talMax);
      const b = rund(x + a, dec);
      return {
        template: `x + ${a} = ${formatTal(b, dec)}, x = __`,
        facit: x,
        decimaler: dec,
      };
    }
    if (form === '-') {
      const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
      const a = tilfaeldigInt(rng, talMin, talMax);
      const b = rund(x - a, dec);
      if (!negativtal && b < 0) continue;
      return {
        template: `x − ${a} = ${formatTal(b, dec)}, x = __`,
        facit: x,
        decimaler: dec,
      };
    }
    if (form === '×') {
      const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
      const a = tilfaeldigInt(rng, 2, 12);
      const b = rund(a * x, dec);
      return {
        template: `${a}x = ${formatTal(b, dec)}, x = __`,
        facit: x,
        decimaler: dec,
      };
    }
    // division: byg baglæns (a · b = x), så x er nøjagtig facit
    const a = tilfaeldigInt(rng, 2, 12);
    const b = tilfaeldigTal(rng, 2, 20, decimaltal, negativtal);
    const x = rund(a * b, dec);
    return {
      template: `x ÷ ${a} = ${formatTal(b, dec)}, x = __`,
      facit: x,
      decimaler: dec,
    };
  }
  return null;
}

// --- Ligning: totrins ---
export function genererLigningTotrin(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { talMin = 1, talMax = 20, decimaltal = false, negativtal = false } = params;
  const dec = decimaltal ? 1 : 0;
  let forsog = 0;
  while (forsog < 300) {
    forsog++;
    const form = tilfaeldigValg(rng, ['ax+b', 'ax-b', 'a(x+b)', 'a(x-b)'] as const);
    const x = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
    const a = tilfaeldigInt(rng, 2, 9);
    const b = tilfaeldigInt(rng, 1, talMax);
    let venstre: string;
    let c: number;
    if (form === 'ax+b') {
      venstre = `${a}x + ${b}`;
      c = rund(a * x + b, dec);
    } else if (form === 'ax-b') {
      venstre = `${a}x − ${b}`;
      c = rund(a * x - b, dec);
    } else if (form === 'a(x+b)') {
      venstre = `${a}(x + ${b})`;
      c = rund(a * (x + b), dec);
    } else {
      venstre = `${a}(x − ${b})`;
      c = rund(a * (x - b), dec);
    }
    if (!negativtal && c < 0) continue;
    if (Math.abs(c) > talMax * 20) continue;
    return {
      template: `${venstre} = ${formatTal(c, dec)}, x = __`,
      facit: x,
      decimaler: dec,
    };
  }
  return null;
}

// --- Ligning: x på begge sider ---
export function genererLigningXBegge(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { talMin = 1, talMax = 15, decimaltal = false, negativtal = false } = params;
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
    return {
      template: `${venstre} = ${hoejre}, x = __`,
      facit: x,
      decimaler: dec,
    };
  }
  return null;
}

// --- Ligning med to bogstaver: pA + qB = rA + sB, find A = kB ---
export function genererLigningBogstaver(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { talMax = 9, decimaltal = false, negativtal = false } = params;
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
    return {
      template: `${p}A + ${q}B = ${r}A ${hoejreB}, A = __B`,
      facit: k,
      decimaler: dec,
    };
  }
  return null;
}

// --- Algebra: reducer udtryk ---
// Uden negativtal: alle led er positive (ren addition, fx "3x + 5x + 2x").
// Med negativtal: led kan trækkes fra, og facit kan blive negativ.
export function genererAlgebraReducer(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { antalLed = 3, talMax = 9, negativtal = false } = params;
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
    for (let i = 1; i < koef.length; i++) {
      tekst += koef[i] >= 0 ? ` + ${koef[i]}x` : ` − ${Math.abs(koef[i])}x`;
    }
    return { template: `${tekst} = __x`, facit, decimaler: 0 };
  }
  return null;
}

// --- Algebra: indsæt tal i udtryk ---
export function genererAlgebraIndsaet(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { talMin = 1, talMax = 12, decimaltal = false, negativtal = false } = params;
  const dec = decimaltal ? 1 : 0;
  const a = tilfaeldigInt(rng, 1, talMax);
  const b = tilfaeldigInt(rng, 0, talMax);
  const xVal = tilfaeldigTal(rng, talMin, talMax, decimaltal, negativtal);
  const facit = rund(a * xVal + b, dec);
  const udtryk = b > 0 ? `${a}x + ${b}` : `${a}x`;
  return {
    template: `Når x = ${formatTal(xVal, dec)}: ${udtryk} = __`,
    facit,
    decimaler: dec,
  };
}

// --- Algebra: udvid parenteser ---
// Faciten er her et UDTRYK (fx "3x + 6"), ikke ét tal — eneste opgavetype
// med erTekstFacit: true. Ingen "generér-og-valider"-løkke nødvendig,
// resultatet er altid gyldigt uanset trukne værdier.
export function genererAlgebraUdvid(
  rng: () => number,
  params: Record<string, any>
): Opgave | null {
  const { talMax = 9 } = params;
  const a = tilfaeldigInt(rng, 2, talMax);
  const b = tilfaeldigInt(rng, 1, talMax);
  const fortegn = tilfaeldigValg(rng, ['+', '−'] as const);
  const opgaveTekst = `${a}(x ${fortegn} ${b})`;
  const konstant = fortegn === '+' ? a * b : -(a * b);
  const facitTekst = konstant >= 0 ? `${a}x + ${konstant}` : `${a}x − ${Math.abs(konstant)}`;
  return {
    template: `${opgaveTekst} = __`,
    erTekstFacit: true,
    facitTekst,
  };
}
