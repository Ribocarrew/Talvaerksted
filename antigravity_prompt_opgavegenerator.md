# Byg "Talværksted" — en matematik-opgavegenerator til lærere — fuld specifikation

## 0. Kort resumé

Siden hedder **Talværksted**. Byg en webapp, hvor grundskolelærere kan generere matematik-arbejdsark med tilhørende facitark, med fuld kontrol over opgavetype, sværhedsgrad og talintervaller. Appen skal være 100 % klient-side (ingen backend, ingen database), køre som en statisk side, ligge på GitHub, og deployes til Netlify. Funktionaliteten er allerede fuldt specificeret og gennemtestet nedenfor — jobbet er dels at implementere den nøjagtigt som beskrevet, dels at hæve det visuelle niveau markant og gøre det til **Jacob Witt-Larsens/Sandboxmodellens brand**, ikke et generisk værktøj. Det skal se professionelt og gennemført ud — men "wow" betyder her *ikke* et generisk tech-startup-dashboard. Det betyder et stramt udført **skandinavisk læringslaboratorium**: rolige farver, whitespace som tænkeplads, taktilt og undersøgende — se det låste designsystem i afsnit 3. Logo, farver, typografi, afsender-signatur og tone of voice er **bindende** og beskrevet i detaljer nedenfor — ingen af dem må erstattes eller "moderniseres" ud fra generel smag.

**Denne prompt følger med en companion-fil: `opgavemotor_reference.md`.** Den indeholder den faktiske, testede kildekode til alle 16 opgavegeneratorer — inklusive en seedet tilfældighedsgenerator, der gør del/gem-funktionen (afsnit 9.4) mulig. Se afsnit 5.5 for hvordan de to filer hænger sammen. Kort sagt: denne fil beskriver *hvad* og *hvordan det skal se ud*, den anden fil er *den matematik, der allerede virker* — genopfind den ikke.

Stack-valget nedenfor er valgt for at give det bedst mulige, mest gennemarbejdede resultat — ikke den mindst risikable løsning. Til gengæld stiller det højere krav til, at porteringen af den testede motor-logik (afsnit 5.5) sker uden genfortolkning, og at testkravene i afsnit 13 faktisk gennemføres, så den ekstra kompleksitet i stacken ikke introducerer regressions i noget, der allerede var korrekt.

---

## 1. Formål og målgruppe

Målgruppen er grundskolelærere — inklusive uerfarne lærere, der ikke nødvendigvis er trygge ved matematik-terminologi eller komplekse UI'er. Appen skal derfor være selvforklarende: en lærer, der aldrig har set siden før, skal kunne generere et brugbart arbejdsark på under et minut. Samtidig skal en erfaren lærer kunne finjustere hver eneste parameter for at ramme præcis den sværhedsgrad, en given klasse har brug for — differentiering er et kerneformål, ikke en tilføjelse.

To anvendelsesscenarier skal begge understøttes fuldt ud:
1. **Print-scenariet**: læreren genererer et ark, printer opgaveark til klassen og facitark til sig selv (eller en projektor).
2. **Digitalt scenarie**: eleven løser opgaverne direkte i browseren og får øjeblikkelig selvrettende feedback.

---

## 2. Teknisk stack (anbefalet)

- **Framework**: React + TypeScript, bygget med **Vite** (hurtig dev-server, minimal konfiguration, oplagt til Netlify).
- **Styling**: **Tailwind CSS**, kombineret med **shadcn/ui**-komponenter (Button, Card, Switch, Tabs, Dialog, Toast/Sonner, Tooltip) som strukturelt fundament — men **konfigureret fuldt om** til Jacob UI Locked Palette (afsnit 3): Tailwind-temaets farver, `border-radius` og skygger skal pege på CSS-variablerne i 3.1, ikke shadcns standard zinc/slate-tema. Resultatet må under ingen omstændigheder ligne en generisk shadcn-demo.
- **Ikoner**: **lucide-react**, brugt sparsomt (se 3.4).
- **Typografi**: **Inter** (UI og overskrifter) + **JetBrains Mono** (tal, kode, labels) — se afsnit 3.2 for eksakt Google Fonts-import og vægte. Brug `font-variant-numeric: tabular-nums` på alle talvisninger, så tal altid står pænt på linje.
- **State management**: React `useState`/`useReducer` er tilstrækkeligt — appen har ingen ekstern data, så et state-bibliotek som Zustand er valgfrit, ikke nødvendigt.
- **Test**: **Vitest** (følger naturligt med Vite) til de matematiske korrekthedstests, der er beskrevet i afsnit 13 og i `opgavemotor_reference.md` afsnit 8.
- **Browserunderstøttelse**: seneste to versioner af Chrome, Edge, Firefox og Safari (evergreen). Ingen understøttelse af Internet Explorer eller gamle Safari-versioner er nødvendig.
- **Ingen backend**: al logik (talgenerering, validering, dublet-tjek, seed-kodning) kører i browseren. Ingen API-kald, ingen database, ingen brugerkonti.
- **Ingen sporing**: ingen analytics, ingen cookies, ingen tredjeparts-scripts ud over de selv-hostede/Google Fonts-skrifttyper. Det eneste, der gemmes lokalt hos brugeren, er temavalget (lys/mørk) i `localStorage`. Det er en bevidst del af værktøjets værdier, ikke bare et teknisk minimalt valg — nævn det gerne et sted i UI'et eller README'en.
- **Deployment**: GitHub-repo → Netlify (continuous deployment ved push til `main`). Se afsnit 12 for konkrete filer.

---

## 3. Visuelt design — Jacob UI Locked Palette v1.0 (bindende)

**Dette designsystem er låst. Ingen af værdierne herunder er forslag — de skal bruges præcist som angivet, ingen undtagelser.** Æstetikken er et **skandinavisk læringslaboratorium**: værkstedsklarhed, whitespace som tænkeplads, blødt/luftigt/taktilt/undersøgende. Interfacet skal føles som et digitalt arbejdsbord — et sted man tænker, ikke et sted man administrerer data.

**ALDRIG:** corporate SaaS-look, fintech-æstetik, startup-dashboard eller gamified UI (badges, konfetti, streaks). Ingen glassmorphism, ingen neon-farvede gradienter, ingen "AI-generisk" mørkeblå/lilla tech-palette. Hvis resultatet minder om Linear, Notion eller et generisk admin-panel, er det forkert.

### 3.1 Farver (CSS-variabler — brug disse eksakte hex-koder)

```css
:root {
  --background: #F5F5F4;        /* Paper Grey — primær baggrund, ALDRIG ren hvid */
  --foreground: #1E293B;        /* Slate Ink — brødtekst og labels */
  --primary: #0F766E;           /* Deep Teal — knapper, navigation, fokus */
  --primary-foreground: #FFFFFF;
  --secondary: #E7E5E4;
  --secondary-foreground: #1E293B;
  --accent: #D97706;            /* Warm Amber — bruges SPARSOMT, kun til highlights */
  --accent-foreground: #FFFFFF;
  --muted: #F1F5F9;
  --muted-foreground: #475569;
  --destructive: #DC2626;       /* Friction Red — kun fejl/konflikt, meget sparsomt */
  --destructive-foreground: #FFFFFF;
  --success: #16A34A;           /* Safety Green — bekræftelser, "korrekt"-markering */
  --warning: #EAB308;           /* Reflection Yellow — refleksion/hjælpetekst, "stop og tænk" */
  --border: #D6D3D1;
  --input: #E7E5E4;
  --ring: #0F766E;
  --radius: 1.25rem;
}
```

- Amber må **aldrig** dominere — det er energi i systemet, ikke systemet selv (brug det fx til "Generér arbejdsark"-knappens accent eller sværhedsgrad "Svær", ikke som gennemgående farve).
- Rød bruges kun, hvor noget reelt er galt (forkert svar i "Tjek svar", en fejlbesked). Grøn til bekræftelse/korrekt svar. Gul (Reflection Yellow) er velegnet til den intro-boks/kom-i-gang-guide, der er beskrevet i afsnit 8 — den signalerer "stop op og læs", ikke fejl.
- Lystilstanden (ovenstående) er standard og skal altid være default ved første besøg. En gennemtænkt mørk variant er en del af scope — se afsnit 3.8. Den er ikke bare en invertering af lystilstanden.

### 3.2 Typografi

- **Overskrifter (H1–H3) og brødtekst:** Inter — vægt 700 til H1/H2, 600 til H3, 400/500 til brødtekst og labels.
- **Kode, prompts, labels, datafelter og alle matematiske udtryk/tal:** JetBrains Mono, vægt 500. Det betyder konkret: selve opgaveteksten (`8 + 9 = __`), facit-tallene, og parameterfelternes tal-inputs skal sættes i JetBrains Mono — det giver den taktile, præcise værkstedsfølelse og sikrer, at tal altid flugter pænt i kolonner.
- Brug **ikke** Space Grotesk eller andre display-fonte. Inter bærer alt andet.
- Importér via Google Fonts:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  ```

### 3.3 Spacing, kort og skygger

```css
/* Standardkort (parameterpanel, arbejdsark-container) */
padding: 24px–32px;
border-radius: var(--radius); /* 1.25rem — ikke skarpe hjørner */
box-shadow: 0 4px 12px rgba(0,0,0,0.04);

/* Hævet element (fx det aktive/genererede arbejdsark) */
box-shadow: 0 8px 30px rgba(15,118,110,0.08); /* NB: teal-farvet skygge, ikke grå */
```

- Cards er **refleksionskort og arbejdsark**, ikke dashboard-widgets — behold luft, undgå tætpakkede admin-tabeller.
- Behold den grundlæggende to-kolonne-struktur (venstre kontrolpanel, højre arbejdsark), men lad arbejdsarket få den hævede teal-skygge, så det visuelt ligner et fysisk ark, der ligger ovenpå.
- Inputs skal være luftige, bløde, store, rolige og taktile — aldrig tætte adminpanel-felter.

### 3.4 Ikonografi, mikrointeraktioner og statustekst

- Brug `lucide-react` sparsomt til orientering (ét ikon pr. kategori-overskrift), ikke som dekoration overalt. Konkrete ikonvalg pr. kategori:

  | Kategori | lucide-ikon |
  |---|---|
  | Regnearter | `Calculator` |
  | Procent | `Percent` |
  | Enheder | `Ruler` |
  | Algebra & ligninger | `Variable` (findes ikke `Variable`-ikonet i den installerede version, brug `Sigma` som fallback) |
- **Animationer skal hjælpe orientering, ikke dekorere.** Brug bløde `fade`- og rolige transitions (`transition-all duration-200 ease-out`). Undgå iøjnefaldende hover-løft/skalerings-effekter — det er for "startup-agtigt". En let baggrunds- eller kant-farveændring ved hover er nok.
- **Erstat alle native `alert()`/`confirm()`-dialoger** med en rolig, tekstbaseret toast-notifikation i samme farvesystem (teal til info, grøn til succes, rød kun til reelle fejl) — native browser-alerts hører ikke hjemme i det færdige produkt.
- Sværhedsgrad-knapperne (Let/Mellem/Svær) får en tydelig "valgt"-tilstand ved en udfyldt teal-baggrund — ingen skalerings-animation, blot en rolig farveovergang.
- Tomme tilstande (intet genereret endnu) designes med omtanke: kort, rolig forklarende tekst i Ink-farven, evt. et enkelt lucide-ikon — aldrig en "her er intet, upload noget!"-tone.

### 3.5 Responsivt design

- Skal fungere på tablet (mange lærere bruger iPad i klasseværelset). Kontrolpanelet stakker over arbejdsarket under ca. 900px bredde.
- **Print-CSS'et er fuldstændig uafhængigt af det øvrige design** — printet output skal altid være rent sort-på-hvidt (ingen Paper Grey-baggrund, ingen teal-skygger, ingen farvede kort). Se afsnit 6.16-relaterede printkrav og afsnit 9–10.

### 3.6 Brand-assets og logo (obligatorisk — se npm-pakke)

Logoer hentes **altid** via npm-pakken `@ribocarrew/sandboxmodellen-assets` — **aldrig** via Google Drive-links eller andre eksterne URL'er, og aldrig ved at hardkode en ekstern billed-URL i koden.

```bash
npm install @ribocarrew/sandboxmodellen-assets
```

Pakken eksporterer absolutte filstier til seks transparente PNG'er. Fast mapping efter brug i **denne** app:

| Brug i opgavegeneratoren | Konstant | Note |
|---|---|---|
| Webheader (skærm) | `LOGO_SIMPELT` | Ren, transparent variant |
| Favicon + apple-touch-icon | `LOGO_MINIMALT` | Lille, skarp i miniature |
| Web-footer (ved siden af signaturen) | `LOGO_MINIMALT` | Samme som favicon |
| Øverst på printede opgave-/facitark | `LOGO_SIMPELT_HANDSON` | Håndtegnet skitse-variant — hører til print, ikke skærm |
| Signaturblok nederst på print | `LOGO_MINIMALT_HANDSON` | Lille håndtegnet ikon |

**Kildefilerne er store (op til 3762px / samlet ~25 MB) — brug dem aldrig direkte.** Kør altid en resize-pipeline med `sharp`, før logoerne bruges i appen:

```javascript
const sharp = require('sharp');
const assets = require('@ribocarrew/sandboxmodellen-assets');
const fs = require('fs');

fs.mkdirSync('./src/assets', { recursive: true });

const jobs = [
  // Webheader: vises ~48px, leveres @2x for skarphed på retina
  { src: assets.LOGO_SIMPELT,        out: './src/assets/logo-header.webp', w: 96,  fmt: 'webp' },
  { src: assets.LOGO_SIMPELT,        out: './src/assets/logo-header.png',  w: 96,  fmt: 'png'  }, // fallback
  // Favicon + apple-touch
  { src: assets.LOGO_MINIMALT,       out: './public/favicon-32.png',      w: 32,  fmt: 'png'  },
  { src: assets.LOGO_MINIMALT,       out: './public/favicon-180.png',     w: 180, fmt: 'png'  },
  // Print: håndtegnet variant, øverst på arbejdsarket
  { src: assets.LOGO_SIMPELT_HANDSON,  out: './src/assets/logo-print.png',     w: 200, fmt: 'png' },
  { src: assets.LOGO_MINIMALT_HANDSON, out: './src/assets/logo-print-lille.png', w: 60, fmt: 'png' },
];

(async () => {
  for (const j of jobs) {
    let p = sharp(j.src).resize({ width: j.w });
    p = j.fmt === 'webp' ? p.webp({ quality: 90 }) : p.png({ compressionLevel: 9 });
    await p.toFile(j.out);
  }
})();
```

Embedding i koden:

```html
<!-- I header (skærm) -->
<picture>
  <source srcset="/src/assets/logo-header.webp" type="image/webp">
  <img src="/src/assets/logo-header.png" alt="Sandboxmodellen"
       style="height: 48px; object-fit: contain;">
</picture>

<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">

<!-- Øverst på printet opgave-/facitark (kun synligt i @media print) -->
<img src="/src/assets/logo-print.png" alt="" class="print-only" style="height: 40px;">
```

### 3.7 Afsender, signatur og tone of voice

**Jacob er afsenderen — Sandboxmodellen er metoden, ikke afsenderen.** Modellen må derfor aldrig stå alene på afsenderplads. Brug den korte signatur nederst på siden (web-footer) og nederst på hvert printet ark:

```html
<footer style="text-align:center; padding: 40px; color: var(--muted-foreground); font-size: 0.875rem;">
  <p>Jacob Witt-Larsen · Master i IT og Læring (MIL)</p>
  <p><em>Bygget med Sandboxmodellen · Tænk før du klikker, men klik.</em></p>
</footer>
```

- Sloganet **"Tænk før du klikker, men klik."** afslutter altid siden/arket — det er en fast del af identiteten, ikke en tilfældig sidefod-tekst.
- **Al UI-tekst** (knapper, intro-boks, tomme tilstande, fejlbeskeder/toasts) skal skrives i Jacobs tone: 70 % faglighed, 30 % praksisnær spartanitet — direkte, konkret, aldrig corporate. Ingen em-dashes noget sted i teksten (brug tankestreg med mellemrum, eller omformulér). Undgå specifikt floskler som "det er vigtigt at understrege", "i en tid præget af...", eller lignende buzzword-sprog — heller ikke i knaptekster eller hjælpetekster.
- Sidetitel (browser-fane) og evt. hero-tekst må gerne navngive selve værktøjet (fx "Opgavegenerator"), men skal ikke sætte "Sandboxmodellen" som hovedafsender ved siden af Jacobs navn — modellen nævnes som metode-fodnote i footeren, jf. ovenfor.

### 3.8 Sådan bliver det "nyeste og fedeste" uden at forlade paletten

Det, der får et UI til at føles friskt og gennemført i 2026, er ikke selve farvekoderne — det er håndværket omkring dem. Varme, jordnære paletter med én markant accentfarve og taktil struktur er faktisk en af de stærkeste aktuelle retninger i webdesign lige nu, som en modreaktion mod generiske blå/lilla AI-værktøjs-look. Konkrete teknikker, der skal bruges for at nå det niveau **inden for** den låste palette:

- **Flydende typografi**: brug `clamp()` på overskrifter (fx `font-size: clamp(1.75rem, 4vw, 3rem)`), så typografien skalerer elegant i stedet for at hoppe mellem faste breakpoints.
- **Meget subtil papir-/grain-struktur**: et ekstremt let støj-/korn-overlay (2–4 % opacitet, fx en SVG-noise-baggrund) oven på Paper Grey-baggrunden. Det forstærker værkstedsfølelsen (håndens epistemologi, fysisk papir) og er samtidig en af de mest brugte teknikker i førende "craft"-webdesign lige nu. Skal være så diskret, at man knap bemærker det bevidst.
- **Brand-farvede skygger, ikke grå**: som allerede specificeret i 3.3 — brug en teal-tonet skygge (`rgba(15,118,110,0.08)`) på hævede elementer i stedet for standard sort/grå skygge. Det er en lille detalje, der gør stor forskel for, hvor "custom" designet føles.
- **Egne fokus-ringe**: erstat browserens standard blå fokus-outline med en teal ring (`outline: 2px solid var(--ring); outline-offset: 2px`) — vigtigt både for tilgængelighed og for at det ikke afslører en uafsluttet standardkomponent.
- **Restriktiv bevægelse**: brug bevægelse til at *forklare* (fx et parameterpanel, der folder blødt ud), aldrig til at imponere. Ingen parallax, ingen "spring"-fysik, ingen konfetti.
- **Skarp typografisk kontrast**: kombinér store, selvsikre Inter-overskrifter (700) med den præcise JetBrains Mono til alle tal — den kontrast mellem "humanistisk" og "teknisk" skrift er i sig selv en del af, hvad der gør systemet moderne og genkendeligt.

### 3.9 Mørk tilstand — "værksted om aftenen"

En mørk variant er en del af scope, men skal designes som sin egen, gennemtænkte tilstand — ikke en automatisk CSS-invertering. Tonen er *et værksted med lampen dæmpet*, ikke et sci-fi-terminal-look. Brug disse eksakte tokens, aktiveret via en `dark`-klasse på `<html>`:

```css
.dark {
  --background: #1B1D1C;        /* varm, mørk kulgrå — IKKE ren sort, IKKE koldt blå-sort */
  --foreground: #E7E5E2;        /* varm off-white, ekko af Paper Grey i omvendt lyshed */
  --primary: #2DD4BF;           /* lysere teal for kontrast/synlighed mod mørk baggrund */
  --primary-foreground: #0B1413;/* næsten-sort tekst på teal-knapper, ikke hvid */
  --secondary: #262A28;
  --secondary-foreground: #E7E5E2;
  --accent: #FBBF24;            /* lysere, gylden amber — gløder naturligt mod mørk baggrund */
  --accent-foreground: #1B1D1C;
  --muted: #232725;
  --muted-foreground: #A8ADA8;
  --destructive: #F87171;
  --destructive-foreground: #1B1D1C;
  --success: #4ADE80;
  --warning: #FDE047;
  --border: rgba(45, 212, 191, 0.15);  /* teal-tonet kant, ikke neutral grå */
  --input: #262A28;
  --ring: #2DD4BF;
}
```

- Skygger i mørk tilstand erstattes af en blød teal-glød i stedet for en mørk skygge (som ikke er synlig på mørk baggrund): `box-shadow: 0 0 24px rgba(45,212,191,0.08);`
- **Toggle**: et sol-/måne-ikon (lucide `Sun`/`Moon`) i headeren ved siden af logoet. Startværdi følger `prefers-color-scheme`, men brugerens eget valg huskes i `localStorage` og vinder over systemindstillingen ved efterfølgende besøg.
- **Print skal altid tvinges til lystilstand**, uanset om brugeren har mørk tilstand slået til på skærmen — genbekræftet fra afsnit 3.5/10: printet output er og bliver rent sort-på-hvidt papir.
- Logo: brug samme `LOGO_SIMPELT`/`LOGO_MINIMALT`-filer som i lystilstand (de er transparente PNG'er og fungerer på begge baggrunde) — ingen grund til separate logofiler til mørk tilstand.

---

## 4. Informationsarkitektur (sidestruktur)

Én side (ingen routing nødvendig):

```
Header (logo LOGO_SIMPELT venstre, app-navn "Talværksted")
├─ Venstre panel (sticky)
│  ├─ Kort intro/kom-i-gang-guide (nummereret, 4 trin — Reflection Yellow-kant)
│  ├─ Sværhedsgrad-genveje (Let / Mellem / Svær)
│  ├─ Opgavetyper, grupperet under kategori-overskrifter:
│  │   ├─ Regnearter
│  │   ├─ Procent
│  │   ├─ Enheder
│  │   └─ Algebra & ligninger
│  │  (hver opgavetype: checkbox + navn + statisk eksempel + udfoldeligt parameterpanel)
│  └─ Globale indstillinger (antal opgaver, kolonner, rækker pr. side)
│     + "Generér arbejdsark"-knap (Deep Teal)
│     + Vis opgaveark / Vis facitark
│     + Interaktiv til/fra, Tjek svar
│     + Print opgaveark / Print facitark
├─ Højre side: selve arbejdsarket (eller tom tilstand, hvis intet er genereret endnu)
└─ Footer (kort signatur, se 3.7): "Jacob Witt-Larsen · Master i IT og Læring (MIL)"
   + "Bygget med Sandboxmodellen · Tænk før du klikker, men klik."
```

---

## 5. Opgave-motoren — generelle principper

### 5.1 Datamodel pr. genereret opgave

Hver genereret opgave er et objekt med denne facon:

```ts
type Opgave = {
  template: string;       // fx "8 + 9 = __" — "__" er ÉN pladsholder for det ukendte
  facit?: number;         // det numeriske svar (findes altid, undtagen ved tekst-facit)
  decimaler?: number;      // antal decimaler faciten skal vises med (0, 1 eller 3)
  erTekstFacit?: boolean;  // true for præcis ÉN opgavetype (se 6.16)
  facitTekst?: string;     // fx "3x + 6" — bruges når erTekstFacit er true
};
```

`template` indeholder altid nøjagtig én forekomst af pladsholderen `__`. Ved visning erstattes den enten med en blank streg/inputfelt (opgaveark) eller med den formaterede facit (facitark).

### 5.2 "Pæne tal"-filosofi — kerneprincip for hele appen

**Alle opgavetyper skal som udgangspunkt generere "pæne" tal: ikke-negative heltal.** Dette er ikke en detalje — det er et bærende designprincip, fordi arkene skal kunne bruges direkte i undervisning uden overraskelser. To uafhængige tilvalg bryder denne standard, hver for sig:

- **"Tillad decimaltal i facit"** — når slået fra (standard), skal generatoren bruge et *generér-og-valider*-mønster: træk kandidat-tal, beregn resultatet, og forkast/prøv igen, hvis resultatet ikke er et helt tal. Når slået til, afrundes resultatet i stedet til 1 decimal (3 decimaler ved enhedsomregning) og vises med dansk komma.
- **"Tillad negative tal"** — når slået fra (standard), må hverken de viste tal i opgaven eller faciten nogensinde blive negative. Når slået til, skal både operander og facit kunne blive negative — men *hvordan* det gøres varierer bevidst pr. opgavetype (se detaljerne under hver type i afsnit 6). Dette er en separat kontrol fra "Tal fra/Tal til", som fortsat kun beskriver tallenes *størrelse* (magnitude) — fortegnet styres udelukkende af denne knap.

Begge tilvalg vises kun i UI'et for de opgavetyper, hvor de giver pædagogisk mening (se parametertabellen i afsnit 6 — fx giver negative procenter og negative længder ikke mening og skal ikke tilbydes).

Alle negative tal og minustegn i opgaveteksten skal vises med det korrekte matematiske minustegn (U+2212, "−"), ikke en almindelig bindestreg ("-"). Dansk decimalkomma (",") bruges konsekvent, aldrig punktum.

### 5.3 Dublet-beskyttelse

**Ingen to opgaver på samme ark må have identisk opgavetekst.** Implementering: hold styr på alle allerede genererede `template`-strenge i et sæt (`Set`). Ved hvert nyt genereringsforsøg: vælg tilfældigt blandt de aktive opgavetyper, kald dens generator, og spring resultatet over (uden at tælle det med), hvis dets `template` allerede findes i sættet. Bliv ved, indtil det ønskede antal er nået, eller et sikkerhedsloft er ramt (`ønsketAntal * 300` forsøg er en fornuftig grænse).

To vigtige, bevidste afgrænsninger:
- Dubletter afgøres på den **viste tekst**, ikke på den matematiske "sandhed" — `2 × 3` og `3 × 2` regnes som to forskellige opgaver, ikke som dubletter af samme regnestykke.
- Hvis det valgte talinterval er for lille til at rumme det ønskede antal unikke opgaver (fx en gangetabel begrænset til 0-3, som kun har 16 mulige kombinationer), skal appen stoppe pænt ved det maksimalt mulige antal og vise en tydelig besked om, hvor mange der faktisk blev fundet, og et forslag til hvad brugeren kan justere (udvid intervallet, vælg flere typer, eller sænk det ønskede antal).

### 5.4 Sikkerhedsgrænser

Enhver generator, der bruger generér-og-valider-mønsteret, skal have et forsøgsloft (fx 300 forsøg) og returnere `null`, hvis den ikke finder et gyldigt resultat inden for loftet, i stedet for at risikere en uendelig løkke. Det overordnede genereringskald skal håndtere `null`-resultater gracefult (prøv en anden opgavetype/nyt forsøg).

### 5.5 Kildekode-reference (obligatorisk)

Al logikken beskrevet i afsnit 5 og 6 findes allerede som testet, kørende JavaScript i companion-filen **`opgavemotor_reference.md`**. Den indeholder:

- den seedede tilfældighedsgenerator, der gør del/gem-funktionen (afsnit 9.4) mulig
- alle hjælpefunktioner og alle 16 generatorer, ordret som beskrevet i afsnit 6
- opgavetype-registeret og de eksakte sværhedsgrad-presets fra afsnit 7
- selve dublet-fri hovedgenereringsløkken og sideopdelingsfunktionen
- URL-kodning/afkodning til del/gem-funktionen
- en liste over de automatiserede tests, koden allerede er verificeret med (afsnit 8 i den fil)

**Portér denne kode 1:1 til TypeScript.** Oversæt syntaks og tilføj typer, men lad algoritmerne — særligt "byg baglæns"-konstruktionerne — være uændrede. Hvis noget i implementeringen afviger fra referencefilen, skal afvigelsen kunne begrundes eksplicit, ikke opstå ved et tilfælde under omskrivning til TypeScript/React.

---

## 6. Opgavetyper — fuld specifikation (16 typer i 4 kategorier)

For hver type: formel/logik, hvilke parametre den skal eksponere i UI'et, og et statisk eksempel til forhåndsvisning i menuen (vises altid, uafhængigt af faktisk generering).

### Kategori: Regnearter

**6.1 Addition (+)**
- Parametre: Antal led (2–4, standard 2), Tal fra/Tal til (standard 1–100), Tillad negative tal.
- Logik: træk `antalLed` tal i intervallet (med tilfældigt fortegn, hvis negativtal er til), læg dem sammen. Vis udtrykket med korrekt dansk fortegns-notation (fx `8 − 3` i stedet for `8 + -3`, hvis et led er negativt).
- Eksempel: `8 + 5 + 3 = __`

**6.2 Subtraktion (−)**
- Parametre: Antal led (2–4), Tal fra/Tal til, Tillad negative tal.
- Logik (uden negativtal — standard): byg **baglæns** fra et ikke-negativt facit, så alle mellemregninger garanteret forbliver ≥ 0. Vælg facit, læg vilkårlige led til for at konstruere det oprindelige tal.
- Logik (med negativtal): kun det **første** tal (minuenden) må blive negativt eller resultere i et negativt facit; de efterfølgende led forbliver altid positive størrelser. Dette undgår dobbelt-fortegns-notation som `3 − (−8)` og giver i stedet klassiske opgaver som `3 − 8 = −5`.
- Eksempel: `12 − 4 = __`

**6.3 Multiplikation (×)**
- Parametre: Antal led (2–4), Tal fra/Tal til (standard 1–12), Tillad negative tal.
- Logik: som addition, men multiplicér. Negative faktorer vises i parentes for at undgå tvetydighed, fx `(−5) × 8`.
- Eksempel: `6 × 7 = __`

**6.4 Division (÷)**
- Parametre: Antal led (2–4, kun relevant uden decimaltal), Størst mulige tal, Tillad decimaltal i facit, Tillad negative tal.
- Logik uden decimaltal: byg **baglæns** — vælg et lille facit (2–12), gang det op med tilfældige divisorer (2–12 hver) for at konstruere dividenden, og forkast, hvis dividenden overstiger "Størst mulige tal". Dette garanterer, at divisionen altid går exact op.
- Logik med decimaltal: vælg to tal direkte, beregn kvotienten afrundet til 1 decimal, og forkast/prøv igen, hvis kvotienten tilfældigvis er et helt tal (vi ønsker netop en ægte decimal her).
- Med negativtal: vend fortegn på **facit og dividend sammen** (divisorerne forbliver altid positive) — det holder stykket letlæst.
- Eksempel: `36 ÷ 6 = __`

**6.5 Multiplikationstabel**
- Parametre: Højeste faktor (standard 9, interval 5–12), Tillad negative tal.
- Logik: to faktorer trukket i intervallet 0..højesteFaktor.
- Eksempel: `3 · 5 = __`

### Kategori: Procent

**6.6 Procent – find del**
- Parametre: Tal fra/Tal til (grundtal-interval, standard 50–900), Tillad decimaltal i facit.
- Logik: fælles kerne for alle tre procent-typer — træk en procentsats `p` (1–99) og et grundtal `g` (inden for intervallet), beregn `del = p × g / 100`. Uden decimaltal: forkast/prøv igen, hvis del ikke er et helt tal. Med decimaltal: afrund til 1 decimal.
- Eksempel: `56% af 700 = __`

**6.7 Procent – find sats**
- Samme kerneberegning som 6.6, men viser `del` og `grundtal` og spørger efter `p`. Faciten er altid et helt tal (da `p` trækkes direkte), så der er intet decimaltal-tilvalg for denne variant.
- Eksempel: `434 er __% af 700`

**6.8 Procent – find grundtal**
- Samme kerneberegning, spørger efter `g`.
- Eksempel: `434 er 56% af __`

*Bemærk: procent har bevidst intet "tillad negative tal"-tilvalg — negative procentopgaver giver ikke pædagogisk mening på dette niveau.*

### Kategori: Enheder

**6.9 Længdeomregning (mm/cm/dm/m)**
- Parametre: afkrydsningsfelter for hvilke enheder der indgår (mindst 2 af de 4: mm, cm, dm, m), Tillad decimaltal i facit.
- Logik: vælg tilfældigt en "fra"-enhed og en anden "til"-enhed blandt de valgte. Træk en heltalsværdi 1–999 i "fra"-enheden. Omregn med faktortabellen `{mm:1, cm:10, dm:100, m:1000}`. Uden decimaltal: forkast, hvis resultatet ikke er et helt tal. Med decimaltal: afrund til 3 decimaler.
- Eksempel: `4,7 cm = __ mm`
- *Bevidst uden "negative tal"-tilvalg — negative længder giver ikke fysisk mening.*

### Kategori: Algebra & ligninger

**6.10 Ligning – ettrins**
- Parametre: Tal fra/Tal til (x-interval, standard 1–20), Tillad decimaltal, Tillad negative tal.
- Logik: vælg tilfældigt én af fire former, og byg altid **baglæns fra x**, så x er den eksakte facit:
  - `x + a = b` — a trukket fra samme interval, b = x + a.
  - `x − a = b` — b = x − a; uden negativtal forkastes resultatet, hvis b < 0.
  - `ax = b` — a er en koefficient 2–12 (ikke fra Tal fra/til), b = a × x.
  - `x ÷ a = b` — a (divisor, 2–12) og b (kvotient, 2–20) vælges først, x = a × b beregnes eksakt.
- Eksempel: `x + 5 = 12, x = __`

**6.11 Ligning – totrins**
- Parametre: Tal fra/Tal til (x-interval), Tillad decimaltal, Tillad negative tal.
- Logik: vælg tilfældigt én af fire former (koefficient a: 2–9, konstant b: 1..talMax):
  - `ax + b = c`, `ax − b = c`, `a(x + b) = c`, `a(x − b) = c` — c beregnes altid eksakt fra x.
  - Uden negativtal: forkast, hvis c < 0. Uanset fortegn: forkast, hvis |c| overstiger `talMax × 20` (undgår urimeligt store tal).
- Eksempel: `2x + 4 = 16, x = __`

**6.12 Ligning – x på begge sider**
- Parametre: Tal fra/Tal til (x-interval), Tillad decimaltal, Tillad negative tal.
- Logik: form `ax + b = cx + d`. Koefficienterne `a` og `c` (begge 2–9) skal være forskellige (ellers findes ingen entydig løsning — forkast og prøv igen). `b` er en positiv konstant (1..talMax). `d` beregnes eksakt som `(a − c) × x + b` og vises altid med korrekt fortegn (`+` eller `−` alt efter d's fortegn — dette er uafhængigt af negativtal-tilvalget, da d blot er en konstant i selve ligningen, ikke faciten). Forkast, hvis |d| overstiger `talMax × 20`.
- Eksempel: `3x + 4 = x + 12, x = __`

**6.13 Ligning med bogstaver (A og B)**
- Parametre: Højeste koefficient (standard 9), Tillad decimaltal, Tillad negative tal.
- Logik: form `pA + qB = rA + sB`, hvor eleven skal finde sammenhængen `A = __B`. Byg baglæns: vælg `p` og `r` (2..højesteKoefficient, skal være forskellige), vælg `q` (1..højesteKoefficient), vælg forholdstallet `k` (faciten, 1–10 i størrelse, med fortegn hvis negativtal er til), og beregn `s = q + k × (p − r)` eksakt. Uden negativtal: forkast, hvis s ≤ 0. Vis højresiden med korrekt fortegn afhængigt af s.
- Eksempel: `3A + 5B = 2A + 10B, A = __B` (facit: `5`)
- Kendte, bevidste v1-afgrænsninger: kun to bogstaver (A og B), kun additive led (intet minus mellem pA og qB på venstre side), og løser altid for A udtrykt ved B (ikke omvendt). Fint som stretch goals i en senere version.

**6.14 Algebra – reducer udtryk**
- Parametre: Antal led (2–4), Højeste koefficient, Tillad negative tal.
- Logik: træk `antalLed` koefficienter til variablen x (første altid positiv; de øvrige kan blive negative, hvis negativtal er slået til — ellers er alle led positive, og opgaven er ren addition). Læg koefficienterne sammen til faciten. Forkast, hvis faciten bliver 0 (en "0x"-opgave er pædagogisk uinteressant).
- Vigtigt: uden negativtal-tilvalg skal denne type **udelukkende** vise additive led (fx `3x + 5x + 2x = __x`) — intet minus noget sted i opgaveteksten.
- Eksempel: `3x + 5x − 2x = __x`

**6.15 Algebra – indsæt tal i udtryk**
- Parametre: Tal fra/Tal til, Tillad decimaltal, Tillad negative tal.
- Logik: `Når x = xVal: ax + b = __`. `a` (1..talMax) og `b` (0..talMax) er altid positive; `xVal` trækkes fra Tal fra/Tal til-intervallet og kan blive negativ/decimal afhængigt af tilvalgene. Facit = `a × xVal + b` beregnet eksakt.
- Eksempel: `Når x = 4: 2x + 3 = __`

**6.16 Algebra – udvid parenteser**
- Parametre: Højeste koefficient.
- Logik: form `a(x + b)` eller `a(x − b)`, hvor `a` (2..højesteKoefficient) og `b` (1..højesteKoefficient) trækkes, og fortegnet i parentesen vælges tilfældigt. **Faciten er her ikke ét tal, men et udtryk** (fx `3x + 6` eller `3x − 6`) — dette er den eneste opgavetype, hvor `erTekstFacit` er `true`, og svaret leveres som en formateret streg (`facitTekst`), ikke som et numerisk `facit`.
- Eksempel: `3(x + 2) = __`
- Kendt begrænsning ved interaktiv selvretning: sammenligningen er en løs tekst-normalisering (fjerner mellemrum, normaliserer minustegn) og fanger derfor ikke algebraisk ækvivalente, men anderledes formulerede svar (fx `6 + 3x` i stedet for `3x + 6`). Dette må gerne forbedres i en senere version (fx ved reelt at parse og sammenligne polynomier), men er accepteret scope for v1.
- *Bevidst uden "negative tal"-tilvalg i v1 — kunne udvides senere med negativ koefficient `a` udenfor parentesen.*

---

## 7. Sværhedsgrader (Let / Mellem / Svær)

Tre knapper, der med ét klik sætter fornuftige parameterværdier for **alle** opgavetyper på én gang (uanset om de er aktive/valgte eller ej), så en lærer, der senere sætter flueben i en type, møder allerede fornuftige standardværdier. Brugeren kan altid finjustere en enkelt type bagefter — sværhedsgrad-knapperne er en genvej, ikke en spærring.

Efter klik skal den valgte knap have en tydelig "aktiv"-visning, og de synlige parameterfelter i venstre panel skal opdateres til de nye værdier med det samme.

Præcise værdier (brug disse som udgangspunkt):

| Type | Let | Mellem | Svær |
|---|---|---|---|
| Addition | 2 led, 1–20 | 2 led, 1–100 | 4 led, 1–200, negativ ✓ |
| Subtraktion | 2 led, 1–20 | 2 led, 1–100 | 4 led, 1–200, negativ ✓ |
| Multiplikation | 2 led, 1–5 | 2 led, 1–10 | 3 led, 1–12, negativ ✓ |
| Division | 2 led, ≤20 | 2 led, ≤100 | 3 led, ≤300, decimal ✓, negativ ✓ |
| Multiplikationstabel | højst 5 | højst 9 | højst 12, negativ ✓ |
| Procent – find del | 10–100 | 50–500 | 100–900, decimal ✓ |
| Procent – find sats | 10–100 | 50–500 | 100–900 |
| Procent – find grundtal | 10–100 | 50–500 | 100–900 |
| Længdeomregning | heltal | heltal | decimal ✓ |
| Ligning – ettrins | 1–10 | 1–20 | 1–40, decimal ✓, negativ ✓ |
| Ligning – totrins | 1–10 | 1–15 | 1–30, decimal ✓, negativ ✓ |
| Ligning – x på begge sider | 1–8 | 1–12 | 1–20, decimal ✓, negativ ✓ |
| Ligning med bogstaver | højst 6 | højst 9 | højst 15, decimal ✓, negativ ✓ |
| Algebra – reducer udtryk | 2 led, højst 5 | 3 led, højst 9, negativ ✓ | 4 led, højst 15, negativ ✓ |
| Algebra – indsæt tal | 1–6 | 1–12 | 1–20, decimal ✓, negativ ✓ |
| Algebra – udvid parenteser | højst 5 | højst 9 | højst 15 |

---

## 8. Menu / UX-krav for opgavepanelet

- **Kom-i-gang-boks** øverst i panelet: kort, nummereret 4-trins-guide ("1. Vælg en sværhedsgrad... 2. Sæt flueben... 3. Tryk Generér... 4. Vis facitark, gør det interaktivt, eller print").
- **Kategorisering**: opgavetyper grupperet under tydelige overskrifter (Regnearter / Procent / Enheder / Algebra & ligninger), ikke én lang flad liste.
- **Statisk eksempel** under hver opgavetypes navn (de eksempler, der er angivet under hver type i afsnit 6) — vises altid, uanset om typen er valgt, så en lærer kan forhåndsvurdere formatet uden at skulle generere først.
- **Udfoldeligt parameterpanel**: klik på en opgavetypes header (hele rækken, ikke kun checkboksen) folder dens parametre ud/ind. Kun aktive/valgte typers parametre er synlige som standard.
- Al tekst er på dansk, korrekt grammatik, ingen anglicismer hvor et godt dansk ord findes.

---

## 9. Generering, visning og facit

### 9.1 Globale indstillinger
- **Antal opgaver i alt** (4–120, standard 24).
- **Antal kolonner** i arbejdsarkets gitter (2–6, standard 4).
- **Rækker pr. side (print)** (4–40, standard 18) — se 9.2.

### 9.2 Sideopdeling ved print
- Beregn `maksOpgaverPrSide = rækkerPrSide × kolonner`. Del den genererede opgaveliste i "sider" af denne størrelse.
- Hver side skal have sin **egen** header med Navn/Klasse/Dato-felter, og hvis der er mere end én side: et tydeligt "side X af Y"-mærke i titlen og i footeren.
- Ved print skal hver side altid begynde på en ny fysisk side (`page-break-after: always` / `break-after: page` i CSS, undtagen den sidste side). På skærm vises siderne stablet med en let visuel adskillelse (fx en stiplet linje), så læreren kan se opdelingen, før der printes.
- Vis en kort statuslinje, når der er mere end én side ("X opgaver fordelt på Y sider (Z rækker × K kolonner pr. side)"), med en opfordring til at justere "Rækker pr. side", hvis fordelingen ikke passer.
- `@page { size: A4; margin: 15mm; }` i print-CSS. Hver opgavecelle skal have `break-inside: avoid` for at undgå, at en enkelt opgave bliver skåret over på tværs af en sidegrænse.

### 9.3 Visning: opgaveark, facitark, interaktiv tilstand
- To visningstilstande: **Opgaveark** (blanke felter) og **Facitark** (udfyldte svar), styret af to knapper.
- **Interaktiv til/fra**: når slået til, og opgavearket vises, erstattes de blanke streger med rigtige tekstfelter, eleven kan skrive i.
- **Tjek svar**-knap: sammenligner hvert udfyldt felt med opgavens facit.
  - Numerisk facit: parse med dansk komma (erstat "," med "." før parsing), sammenlign med en lille tolerance (0.01) for at undgå floating point-fejl.
  - Tekst-facit (kun 6.16): normaliseret løs strengsammenligning (fjern mellemrum, normalisér minustegn-varianter).
  - Marker cellen visuelt: grøn baggrund/kant ved korrekt, rød ved forkert, ingen markering ved tomt felt.
- **Print opgaveark / Print facitark**-knapper: tving midlertidigt blank-visning (aldrig inputfelter) uanset interaktiv-tilstand, udløs browserens printdialog, og gendan derefter brugerens forrige visningstilstand.
- Erstat enhver brug af native `alert()` (fx ved manglende valgt opgavetype, eller når færre unikke opgaver end ønsket kunne findes) med en ordentlig toast-notifikation, jf. afsnit 3.4.

### 9.4 Del/gem-funktion (seed i URL)

En lærer skal kunne dele et bestemt opgavesæt med en kollega, så kollegaen kan generere **det nøjagtigt samme ark** — samme opgaver i samme rækkefølge.

- Alle nødvendige oplysninger (talfrøet/`seed`, antal opgaver, antal kolonner, rækker pr. side, og hvilke opgavetyper der er aktive med hvilke parametre) kodes til én enkelt, base64-kodet query-parameter i URL'en. Se den fulde, testede kodnings-/afkodningslogik i `opgavemotor_reference.md` afsnit 7.
- Når "Generér arbejdsark" trykkes, laves et nyt tilfældigt seed, og URL'en opdateres (uden sidegenindlæsning, via `history.replaceState`), så adresselinjen altid afspejler det aktuelt viste ark.
- En **"Kopiér link"**-knap ved siden af arket kopierer den fulde URL til udklipsholderen, med en kort toast-bekræftelse ("Link kopieret").
- Åbnes appen med et gyldigt delt link, gendannes alle parameterindstillinger i venstre panel til de delte værdier, og det identiske opgavesæt genereres automatisk med det samme — ingen grund til at trykke "Generér" igen.
- Et ugyldigt eller korrupt link skal fejle blødt: falde tilbage til standardtilstanden (addition + multiplikation, som ved første besøg) uden fejlmeddelelse, der forvirrer en lærer, der bare har fået et defekt link.

### 9.5 Validering af parameterinput

Uerfarne brugere vil før eller siden taste "Tal fra" højere end "Tal til" (eller omvendt). Håndter det uden fejlbesked: **byt automatisk de to værdier om, så snart feltet mister fokus (`onBlur`)**, hvis "Tal fra" > "Tal til". Ingen rød fejltekst, intet blokeret "Generér"-klik — værdierne retter sig selv stille, og de opdaterede tal vises med det samme i felterne. Samme princip gælder alle andre min/max-par i UI'et (fx hvis det skulle blive relevant andre steder).

---

## 10. Print-specifikke krav (opsummeret, se også 9.2)

- Kontrolpanel, knapper og statuslinjer skal skjules helt i print (`display: none` under `@media print`).
- Print-output skal altid være rent sort tekst på hvid baggrund, uanset skærmens mørke/lyse tilstand.
- A4-format med 15 mm margin som udgangspunkt.

---

## 11. Tilgængelighed

- Alle interaktive elementer skal være tastaturtilgængelige (checkbokse, knapper, inputfelter) — shadcn/ui-komponenter giver det meste af dette gratis, men verificér.
- Tilstrækkelig farvekontrast i det låste farvesystem (WCAG AA som minimum) — kontrollér især Warm Amber-tekst mod Paper-baggrund, som er den mest sårbare kombination.
- Meningsfulde `label`/`aria-label` på alle inputfelter, særligt de dynamisk genererede parameterfelter og de interaktive svarfelter.

---

## 12. Deployment: GitHub + Netlify

- **Sidens navn**: **Talværksted**. Bruges som `<title>`-tag, GitHub-repo-navn (fx `talvaerksted`), Netlify-site-navn/subdomæne (`talvaerksted.netlify.app` som udgangspunkt, indtil et evt. eget domæne kobles på) og i header/footer jf. afsnit 4.
- **Repo-struktur**: standard Vite+React-struktur (`src/`, `public/`, `index.html`, `package.json`, `tailwind.config.ts`).
- **README.md**: kort beskrivelse af projektet, skærmbillede, sådan køres det lokalt (`npm install && npm run dev`), og et link til den live Netlify-URL.
- **LICENSE**: MIT som udgangspunkt, medmindre andet ønskes.
- **.gitignore**: standard Node/Vite-gitignore (`node_modules`, `dist`, `.env` osv.).
- **netlify.toml** i repo-roden:
  ```toml
  [build]
    command = "npm run build"
    publish = "dist"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- Sæt Netlify op til automatisk deploy ved push til `main`-branchen (standard Netlify-adfærd, når GitHub-repoet forbindes via Netlifys UI — kræver ingen ekstra CI-konfiguration).
- Ingen miljøvariabler eller secrets er nødvendige, da appen er ren klient-side uden eksterne API-kald.

---

## 13. Test- og verifikationskrav

Dette er ikke valgfrit, og "det ser rigtigt ud i browseren" er ikke tilstrækkelig verifikation for en talgenerator — en visuel gennemgang fanger ikke, at en generator i sjældne tilfælde returnerer et negativt facit, den ikke burde. `opgavemotor_reference.md` er allerede verificeret med disse mønstre (se dens afsnit 8); de samme mønstre skal genetableres som en del af denne implementering, fx som Vitest-tests, og skal bestå, før noget betragtes som færdigt:

1. **"Pænt tal"-garanti**: for hver af de 11 typer med `negativtal`-tilvalg, generér 2000+ opgaver med `negativtal: false` og assertér, at facit aldrig er negativ.
2. **Negativtal fungerer reelt**: samme typer med `negativtal: true` — assertér, at negative facit rent faktisk forekommer, ikke bare er tilladt i teorien.
3. **Matematisk korrekthed, uafhængigt genberegnet**: parse den genererede `template`-streng og genberegn facit fra bunden uden at bruge generatorens egen kode — sammenlign med det returnerede `facit`. Dette fangede reelle fejl under den oprindelige udvikling (se punkt 6 nedenfor) og er ikke overflødigt.
4. **Reproducerbarhed**: samme `seed` + samme parametre + samme antal opgaver ⇒ byte-for-byte identisk resultat, to gange i træk. Forskelligt seed ⇒ forskelligt resultat. Afgørende for at del/gem-funktionen (9.4) rent faktisk virker.
5. **Dublet-fri, også ved lille talrum**: med et kunstigt lille parameterinterval, bed om flere opgaver end det matematisk mulige, og assertér at resultatet stopper ved det korrekte antal unikke — uden at hænge, og uden dubletter.
6. **Regressionsværn ved kendte, tidligere rettede fejl**: under den oprindelige udvikling af denne motor blev det opdaget, at "Algebra – reducer udtryk" viste negative led, selvom "pænt tal som standard" burde forhindre det. Skriv en eksplicit test, der ville have fanget netop den fejl (generér mange opgaver med `negativtal: false` og assertér ingen minustegn i teksten) — det er et konkret eksempel på, hvorfor disse tests har reel værdi, ikke bare formalia.

---

## 14. Anbefalet byggerækkefølge (Fase 1 / Fase 2)

Byg ikke alle 16 opgavetyper og hele designsystemet i ét stort spring. Del arbejdet i to bekræftede faser, så en fejl i grundstrukturen opdages tidligt, ikke efter alt er bygget:

**Fase 1 — kerne, bekræft hele kæden virker:**
- Opsætning: Vite + React + TS + Tailwind + shadcn/ui, med Jacob UI Locked Palette (afsnit 3.1–3.3) fuldt konfigureret fra start — ikke shadcns standardtema, der rettes senere.
- Portér motoren fra `opgavemotor_reference.md` (afsnit 5.5) — men implementér kun tre opgavetyper i første omgang: **Addition**, **Multiplikation** og **Ligning – ettrins** (dækker regnearter og algebra, nok til at teste hele mønsteret).
- Fuld UI: kategoriseret panel, sværhedsgrad-knapper, opgaveark/facitark-visning, interaktiv tilstand, print med sideopdeling, del/gem-link.
- Logo, favicon, footer-signatur på plads.
- Deploy til Netlify, bekræft at det virker i produktion — ikke kun lokalt.
- Skriv og kør testene fra afsnit 13 for de tre implementerede typer.

**Fase 2 — resten af bredden:**
- Tilføj de resterende 13 opgavetyper (Subtraktion, Division, Multiplikationstabel, de tre procent-typer, Længdeomregning, de tre resterende ligningstyper, og de tre resterende algebra-typer), med tilhørende tests for hver.
- Tilføj mørk tilstand (afsnit 3.9), hvis den ikke allerede er lavet i fase 1.
- Sidste finpudsning: grain-tekstur, fokus-ringe, mikrointeraktioner (afsnit 3.8).

Denne rækkefølge betyder, at et fungerende, deployet produkt eksisterer meget tidligt i processen — resten er breddeudvidelse af et bevist mønster, ikke en stor, uverificeret slutlevering.

---

## 15. Leverancer / Definition of Done

En implementering er færdig, når:

1. Alle 16 opgavetyper fra afsnit 6 er implementeret præcist som beskrevet (portér fra `opgavemotor_reference.md`, afsnit 5.5), inklusive alle sværhedsregler for "pæne tal", decimaltal og negative tal.
2. Sværhedsgrad-knapperne sætter de præcise værdier fra tabellen i afsnit 7.
3. Dublet-beskyttelsen fungerer som beskrevet i 5.3, inklusive den grænsetilfælde-besked, når talrummet er for lille.
4. Print-flowet producerer korrekt sideopdelte, rene A4-ark uden UI-elementer, med gentaget Navn/Klasse/Dato-header pr. side.
5. Interaktiv tilstand og "Tjek svar" fungerer for både numeriske og tekst-baserede facit.
6. UI'et er bygget med den anbefalede stack (React + TS + Vite + Tailwind + shadcn/ui), fremstår præcis som Jacob UI Locked Palette v1.0 foreskriver (afsnit 3) — ikke som en generisk SaaS-skabelon — bruger toasts i stedet for native alerts, og logo/favicon/print-logo er hentet og resized korrekt fra `@ribocarrew/sandboxmodellen-assets` (afsnit 3.6).
7. Footer-signaturen og sloganet "Tænk før du klikker, men klik." er til stede på både websiden og hvert printet ark, jf. afsnit 3.7.
8. Appen er responsiv ned til tablet-bredde.
9. Mørk tilstand (afsnit 3.9) fungerer med de angivne tokens, toggles korrekt, husker valget i `localStorage`, og printet output forbliver altid i lystilstand uanset skærmens indstilling.
10. Del/gem-funktionen (9.4) genskaber et identisk opgavesæt fra et delt link, og et korrupt link fejler blødt.
11. Ugyldige "Tal fra > Tal til"-inputs retter sig selv automatisk uden fejlmeddelelse (9.5).
12. Testene fra afsnit 13 er skrevet og består, inklusive regressionstesten for den kendte tidligere fejl.
13. Projektet ligger i et GitHub-repo med de filer, der er beskrevet i afsnit 12, og er deployet til Netlify med automatisk deploy ved push.
