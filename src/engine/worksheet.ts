import { Opgave, GeneratorFn } from './types';
import { lavRNG, tilfaeldigValg } from './rng';

export type AktivOpgavetype = {
  id: string;
  generer: GeneratorFn;
  params: Record<string, any>;
};

// Genererer et helt arbejdsark: dublet-fri (på tekstniveau), deterministisk
// ud fra seed. aktiveTyper er en liste af { id, generer, params } for de
// typer, læreren har valgt, hver med sine egne, aktuelle parameterværdier.
export function genererArbejdsark(
  seed: number,
  aktiveTyper: AktivOpgavetype[],
  antalOpgaver: number
): { opgaver: Opgave[]; reachedLimit: boolean } {
  if (aktiveTyper.length === 0 || antalOpgaver <= 0) {
    return { opgaver: [], reachedLimit: false };
  }

  const rng = lavRNG(seed);
  const liste: Opgave[] = [];
  const setTemplates = new Set<string>();
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

  const reachedLimit = liste.length < antalOpgaver;
  return { opgaver: liste, reachedLimit };
}

// Deler en opgaveliste op i "sider" til print, ud fra kolonneantal og
// ønsket antal rækker pr. side.
export function delOpiSider<T>(
  opgaveListe: T[],
  kolonner: number,
  raekkerPrSide: number
): T[][] {
  const maksPrSide = Math.max(kolonner, raekkerPrSide * kolonner);
  const sider: T[][] = [];
  for (let i = 0; i < opgaveListe.length; i += maksPrSide) {
    sider.push(opgaveListe.slice(i, i + maksPrSide));
  }
  return sider.length > 0 ? sider : [[]];
}
