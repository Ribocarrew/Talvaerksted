import { describe, it, expect } from 'vitest';
import { lavRNG, formatTal } from '../engine/rng';
import {
  genererAdditionMult,
  genererSubtraktion,
  genererDivision,
  genererTabel,
  genererProcent,
  genererLaengde,
  genererLigningEttrin,
  genererLigningTotrin,
  genererLigningXBegge,
  genererLigningBogstaver,
  genererAlgebraReducer,
  genererAlgebraIndsaet,
  genererAlgebraUdvid,
} from '../engine/generators';
import { OPGAVETYPER, OPGAVETYPER_MAP } from '../engine/registry';
import { SVAERHEDSGRADER } from '../engine/presets';
import { genererArbejdsark, delOpiSider } from '../engine/worksheet';
import { kodTilUrl } from '../engine/urlState';

describe('Opgavemotor Verifikation', () => {
  // 1. "Pænt tal"-garanti: 2000+ tests pr. type med negativtal: false
  const typerMedNegativ = [
    { name: 'Addition', fn: (rng: any) => genererAdditionMult(rng, '+', { antalLed: 3, talMin: 1, talMax: 50, negativtal: false }) },
    { name: 'Subtraktion', fn: (rng: any) => genererSubtraktion(rng, { antalLed: 3, talMin: 1, talMax: 50, negativtal: false }) },
    { name: 'Multiplikation', fn: (rng: any) => genererAdditionMult(rng, '·', { antalLed: 2, talMin: 1, talMax: 10, negativtal: false }) },
    { name: 'Division (heltal)', fn: (rng: any) => genererDivision(rng, { antalLed: 2, talMax: 100, decimaltal: false, negativtal: false }) },
    { name: 'Division (decimal)', fn: (rng: any) => genererDivision(rng, { antalLed: 2, talMax: 100, decimaltal: true, negativtal: false }) },
    { name: 'Tabel', fn: (rng: any) => genererTabel(rng, { talMax: 10, negativtal: false }) },
    { name: 'Ligning Ettrin', fn: (rng: any) => genererLigningEttrin(rng, { talMin: 1, talMax: 20, decimaltal: false, negativtal: false }) },
    { name: 'Ligning Totrin', fn: (rng: any) => genererLigningTotrin(rng, { talMin: 1, talMax: 20, decimaltal: false, negativtal: false }) },
    { name: 'Ligning X Begge', fn: (rng: any) => genererLigningXBegge(rng, { talMin: 1, talMax: 15, decimaltal: false, negativtal: false }) },
    { name: 'Ligning Bogstaver', fn: (rng: any) => genererLigningBogstaver(rng, { talMax: 10, decimaltal: false, negativtal: false }) },
    { name: 'Algebra Reducer', fn: (rng: any) => genererAlgebraReducer(rng, { antalLed: 3, talMax: 10, negativtal: false }) },
    { name: 'Algebra Indsaet', fn: (rng: any) => genererAlgebraIndsaet(rng, { talMin: 1, talMax: 15, decimaltal: false, negativtal: false }) },
  ];

  typerMedNegativ.forEach(({ name, fn }) => {
    it(`Pænt tal-garanti for ${name}: facit >= 0 i 2000 kørsler`, () => {
      const rng = lavRNG(12345);
      for (let i = 0; i < 2000; i++) {
        const opgave = fn(rng);
        expect(opgave).not.toBeNull();
        if (opgave && opgave.facit !== undefined) {
          expect(opgave.facit).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  // 2. Negativtal fungerer reelt: assert at negative facit rent faktisk forekommer
  const typerMedNegativTrue = [
    { name: 'Addition (negativ)', fn: (rng: any) => genererAdditionMult(rng, '+', { antalLed: 2, talMin: 1, talMax: 50, negativtal: true }) },
    { name: 'Subtraktion (negativ)', fn: (rng: any) => genererSubtraktion(rng, { antalLed: 2, talMin: 1, talMax: 50, negativtal: true }) },
    { name: 'Multiplikation (negativ)', fn: (rng: any) => genererAdditionMult(rng, '·', { antalLed: 2, talMin: 1, talMax: 10, negativtal: true }) },
    { name: 'Division (negativ)', fn: (rng: any) => genererDivision(rng, { antalLed: 2, talMax: 100, decimaltal: false, negativtal: true }) },
    { name: 'Tabel (negativ)', fn: (rng: any) => genererTabel(rng, { talMax: 10, negativtal: true }) },
    { name: 'Ligning Ettrin (negativ)', fn: (rng: any) => genererLigningEttrin(rng, { talMin: 1, talMax: 20, decimaltal: false, negativtal: true }) },
    { name: 'Ligning Totrin (negativ)', fn: (rng: any) => genererLigningTotrin(rng, { talMin: 1, talMax: 20, decimaltal: false, negativtal: true }) },
    { name: 'Ligning X Begge (negativ)', fn: (rng: any) => genererLigningXBegge(rng, { talMin: 1, talMax: 15, decimaltal: false, negativtal: true }) },
    { name: 'Ligning Bogstaver (negativ)', fn: (rng: any) => genererLigningBogstaver(rng, { talMax: 10, decimaltal: false, negativtal: true }) },
    { name: 'Algebra Reducer (negativ)', fn: (rng: any) => genererAlgebraReducer(rng, { antalLed: 3, talMax: 10, negativtal: true }) },
    { name: 'Algebra Indsaet (negativ)', fn: (rng: any) => genererAlgebraIndsaet(rng, { talMin: 1, talMax: 15, decimaltal: false, negativtal: true }) },
  ];

  typerMedNegativTrue.forEach(({ name, fn }) => {
    it(`Negativtal aktivering for ${name}: negative facit forekommer`, () => {
      const rng = lavRNG(54321);
      let fandtNegativ = false;
      for (let i = 0; i < 500; i++) {
        const opgave = fn(rng);
        if (opgave && opgave.facit !== undefined && opgave.facit < 0) {
          fandtNegativ = true;
          break;
        }
      }
      expect(fandtNegativ).toBe(true);
    });
  });

  // 3. Matematisk korrekthed, uafhængigt genberegnet
  it('Uafhængig genberegning af Addition og Multiplikation', () => {
    const rng = lavRNG(999);
    for (let i = 0; i < 100; i++) {
      const opAdd = genererAdditionMult(rng, '+', { antalLed: 3, talMin: 1, talMax: 20, negativtal: false });
      expect(opAdd).not.toBeNull();
      const matchAdd = opAdd!.template.match(/^(\d+) \+ (\d+) \+ (\d+) = __$/);
      if (matchAdd) {
        const [, a, b, c] = matchAdd;
        expect(opAdd!.facit).toBe(Number(a) + Number(b) + Number(c));
      }

      const opMult = genererAdditionMult(rng, '·', { antalLed: 2, talMin: 1, talMax: 10, negativtal: false });
      expect(opMult).not.toBeNull();
      const matchMult = opMult!.template.match(/^(\d+) · (\d+) = __$/);
      if (matchMult) {
        const [, a, b] = matchMult;
        expect(opMult!.facit).toBe(Number(a) * Number(b));
      }
    }
  });

  it('Uafhængig genberegning af Procent – find del', () => {
    const rng = lavRNG(888);
    for (let i = 0; i < 100; i++) {
      const op = genererProcent(rng, 'del', { talMin: 50, talMax: 500, decimaltal: false });
      if (op) {
        const match = op.template.match(/^(\d+)% af (\d+) = __$/);
        expect(match).not.toBeNull();
        const [, p, g] = match!;
        expect(op.facit).toBe((Number(p) * Number(g)) / 100);
      }
    }
  });

  it('Uafhængig genberegning af Algebra – udvid parenteser', () => {
    const rng = lavRNG(777);
    for (let i = 0; i < 50; i++) {
      const op = genererAlgebraUdvid(rng, { talMax: 10 });
      expect(op).not.toBeNull();
      expect(op!.erTekstFacit).toBe(true);
      const match = op!.template.match(/^(\d+)\(x ([+−]) (\d+)\) = __$/);
      expect(match).not.toBeNull();
      const [, aStr, tegn, bStr] = match!;
      const a = Number(aStr);
      const b = Number(bStr);
      const expected = tegn === '+' ? `${a}x + ${a * b}` : `${a}x − ${a * b}`;
      expect(op!.facitTekst).toBe(expected);
    }
  });

  // 4. Reproducerbarhed: samme seed => identisk opgavesæt, forskelligt seed => forskelligt sæt
  it('Deterministisk reproducerbarhed fra seed', () => {
    const aktive = [
      { id: 'addition', generer: OPGAVETYPER_MAP.get('addition')!.generer, params: { antalLed: 2, talMin: 1, talMax: 20, negativtal: false } },
      { id: 'multiplikation', generer: OPGAVETYPER_MAP.get('multiplikation')!.generer, params: { antalLed: 2, talMin: 1, talMax: 10, negativtal: false } },
    ];
    const res1 = genererArbejdsark(424242, aktive, 12);
    const res2 = genererArbejdsark(424242, aktive, 12);
    const res3 = genererArbejdsark(999999, aktive, 12);

    expect(res1.opgaver).toEqual(res2.opgaver);
    expect(res1.opgaver).not.toEqual(res3.opgaver);
  });

  // 5. Dublet-fri ved lille talrum
  it('Dublet-fri ved lille talrum: tabel med talMax: 3 har maks 16 kombinationer', () => {
    const aktive = [
      { id: 'tabel', generer: OPGAVETYPER_MAP.get('tabel')!.generer, params: { talMax: 3, negativtal: false } },
    ];
    const { opgaver, reachedLimit } = genererArbejdsark(1111, aktive, 40);
    expect(opgaver.length).toBe(16);
    expect(reachedLimit).toBe(true);

    const templates = opgaver.map((o) => o.template);
    const uniqueTemplates = new Set(templates);
    expect(uniqueTemplates.size).toBe(16);
  });

  // 6. Regressionsværn: Algebra – reducer udtryk uden negativtal må ALDRIG indeholde minus
  it('Regressionsværn: Algebra reducer udtryk uden negativtal indeholder ingen minus', () => {
    const rng = lavRNG(3333);
    for (let i = 0; i < 500; i++) {
      const op = genererAlgebraReducer(rng, { antalLed: 3, talMax: 9, negativtal: false });
      expect(op).not.toBeNull();
      expect(op!.template).not.toContain('−');
      expect(op!.template).not.toContain('-');
      expect(op!.facit).toBeGreaterThan(0);
    }
  });

  // 7. Sideopdeling
  it('Sideopdeling deler opgaver korrekt op uden tab', () => {
    const dummy = Array.from({ length: 25 }, (_, i) => ({ template: `Opgave ${i + 1}`, facit: i + 1 }));
    const sider = delOpiSider(dummy, 4, 2); // 4 * 2 = 8 pr. side
    expect(sider.length).toBe(4); // 8, 8, 8, 1
    expect(sider[0].length).toBe(8);
    expect(sider[1].length).toBe(8);
    expect(sider[2].length).toBe(8);
    expect(sider[3].length).toBe(1);
    expect(sider.flat().length).toBe(25);
  });

  // 8. Længdeomregning og Dansk talformatering
  it('Længdeomregning og dansk talformatering', () => {
    const rng = lavRNG(444);
    const op = genererLaengde(rng, { enhederValgt: ['mm', 'cm', 'm'], decimaltal: true });
    expect(op).not.toBeNull();
    expect(formatTal(-3.5, 1)).toBe('−3,5');
    expect(formatTal(12.75, 2)).toBe('12,75');
  });

  // 9. Register og Sværhedsgrad presets
  it('Register indeholder 16 opgavetyper og gyldige presets', () => {
    expect(OPGAVETYPER.length).toBe(16);
    expect(Object.keys(SVAERHEDSGRADER.let).length).toBe(16);
    expect(Object.keys(SVAERHEDSGRADER.mellem).length).toBe(16);
    expect(Object.keys(SVAERHEDSGRADER.svaer).length).toBe(16);
  });

  // 10. URL Encoding
  it('URL encoding funktion producerer gyldig streng', () => {
    const url = kodTilUrl({
      seed: 1234,
      antalOpgaver: 10,
      kolonner: 3,
      raekkerPrSide: 10,
      aktive: { addition: { antalLed: 2, talMin: 1, talMax: 20, negativtal: false } },
    });
    expect(url).toContain('?d=');
  });

  // 11. Stort opgavesæt (f.eks. 500 opgaver)
  it('Generering af store opgavesæt (500 opgaver)', () => {
    const aktive = [
      { id: 'multiplikation', generer: OPGAVETYPER_MAP.get('multiplikation')!.generer, params: { antalLed: 2, talMin: 1, talMax: 50, negativtal: false } },
      { id: 'addition', generer: OPGAVETYPER_MAP.get('addition')!.generer, params: { antalLed: 2, talMin: 1, talMax: 100, negativtal: false } },
    ];
    const { opgaver, reachedLimit } = genererArbejdsark(777777, aktive, 500);
    expect(opgaver.length).toBe(500);
    expect(reachedLimit).toBe(false);
  });
});
