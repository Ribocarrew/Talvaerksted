# Talværksted — Matematik-opgavegenerator til lærere

**Talværksted** er et digitalt arbejdsbord og læringslaboratorium til grundskolelærere, skabt til hurtigt og præcist at generere differentierede matematik-arbejdsark og facitark.

Appen kører 100 % i browseren (ingen backend, ingen database, ingen cookies eller ekstern sporing) og kan deployes direkte til Netlify eller GitHub Pages som en statisk webapplikation.

---

## Kernefunktioner

- **16 specialiserede opgavetyper i 4 kategorier:**
  - *Regnearter:* Addition, Subtraktion, Multiplikation, Division, Multiplikationstabel.
  - *Procent:* Find del, Find sats, Find grundtal.
  - *Enheder:* Længdeomregning (mm, cm, dm, m).
  - *Algebra & ligninger:* Ligning ettrins, totrins, x på begge sider, ligninger med to bogstaver (A og B), reduktion af udtryk, indsæt tal i udtryk, udvidelse af parenteser.
- **"Pæne tal"-filosofi:** Som udgangspunkt genereres altid naturlige, ikke-negative heltal via "byg-baglæns"-algoritmer. Decimaltal og negative tal er bevidste tilvalg på de relevante opgavetyper.
- **Dublet-fri generering:** Matematisk sikret mod identiske opgaver på samme ark, selv ved små talrum.
- **Hurtigvalg af sværhedsgrad:** Forudindstil alle opgavetyper med ét klik på *Let*, *Mellem* eller *Svær*.
- **To anvendelsesscenarier:**
  1. *Print:* Knivskarpt, sideopdelt sort/hvidt A4-print med elevfelter (Navn, Klasse, Dato) og "Side X af Y".
  2. *Digital elevløsning:* Interaktiv tilstand med øjeblikkelig selvrettende feedback (både numeriske facit og algebraiske udtryk).
- **Deling via URL:** Hvert ark genereres deterministisk ud fra et talfrø (*seed*). Tryk på "Kopiér link" for at sende et link til en kollega, der åbner det nøjagtigt samme opgavesæt.
- **Værksted om aftenen (Mørkt tema):** Gennemtænkt nattilstand med varme kulgrå toner og teal-glød, som altid automatisk tvinges til lystilstand ved udskrift.

---

## Designsystem — Jacob UI Locked Palette v1.0

Interfacet er udformet som et **skandinavisk læringslaboratorium**:
- **Farver:** Paper Grey (`#F5F5F4`), Slate Ink (`#1E293B`), Deep Teal (`#0F766E`), Warm Amber (`#D97706`), Reflection Yellow (`#EAB308`).
- **Typografi:** Inter (UI og overskrifter) + JetBrains Mono (tal, facit og matematiske udtryk i `tabular-nums`).
- **Taktilitet:** Subtil papir-grain struktur og brand-tonede teal-skygger.
- **Brand-assets:** Hentet og optimeret fra `@ribocarrew/sandboxmodellen-assets`.

---

## Kom i gang lokalt

```bash
# 1. Klon repositoryet
git clone https://github.com/Ribocarrew/Talvaerksted.git
cd talvaerksted

# 2. Installer afhængigheder
npm install

# 3. Forbered brand-assets (hvis nødvendigt)
npm run prepare-assets

# 4. Start lokal udviklingsserver
npm run dev
```

Åbn [http://localhost:5173](http://localhost:5173) i din browser.

---

## Kør automatiserede tests

Projektet indeholder en omfattende testsuite med Vitest, der verificerer determinisme, "pæne tal"-garantier (2000+ kørselstest pr. type), negativtal, matematisk genberegning og regressionsbeskyttelse:

```bash
npm test
```

---

## Byg til produktion & Deployment

```bash
npm run build
```

Bygger applikationen til `dist/`-mappen. Projektet indeholder en færdig `netlify.toml`-konfiguration til automatisk deployment.

---

## Afsender & Ophavsret

Udviklet af **Jacob Witt-Larsen** · Master i IT og Læring (MIL)  
*Bygget med Sandboxmodellen · Tænk før du klikker, men klik.*

Licenseret under [MIT License](LICENSE).
