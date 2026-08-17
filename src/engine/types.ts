export type Opgave = {
  template: string;        // fx "8 + 9 = __" — "__" er ÉN pladsholder for det ukendte
  facit?: number;          // det numeriske svar (findes altid, undtagen ved tekst-facit)
  decimaler?: number;      // antal decimaler faciten skal vises med (0, 1 eller 3)
  erTekstFacit?: boolean;  // true for præcis ÉN opgavetype (algebraUdvid)
  facitTekst?: string;     // fx "3x + 6" — bruges når erTekstFacit er true
};

export type GeneratorFn = (rng: () => number, params: Record<string, any>) => Opgave | null;

export type KategoriId = 'regnearter' | 'procent' | 'enheder' | 'algebra';

export type FilterFieldType = 
  | 'antalLed' 
  | 'talMinMax' 
  | 'talMax' 
  | 'talMax9' 
  | 'koefMax' 
  | 'enheder' 
  | 'decimaltal' 
  | 'negativtal';

export type OpgavetypeDef = {
  id: string;
  navn: string;
  kategori: KategoriId;
  eksempel: string;
  felter: FilterFieldType[];
  standard: Record<string, any>;
  generer: GeneratorFn;
};

export type DifficultyPreset = 'let' | 'mellem' | 'svaer';

export type SavedUrlState = {
  seed: number;
  antalOpgaver: number;
  kolonner: number;
  raekkerPrSide: number;
  aktive: Record<string, Record<string, any>>;
};

export type KategoriDef = {
  id: KategoriId;
  navn: string;
  icon: string;
};
