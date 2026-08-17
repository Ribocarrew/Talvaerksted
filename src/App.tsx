import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { QuickStartGuide } from './components/QuickStartGuide';
import { DifficultyPresets } from './components/DifficultyPresets';
import { CategorySection } from './components/CategorySection';
import { GlobalSettings } from './components/GlobalSettings';
import { ActionPanel } from './components/ActionPanel';
import { WorksheetPreview } from './components/WorksheetPreview';
import { Footer } from './components/Footer';
import { useToast } from './components/Toast';

import { Opgave, DifficultyPreset, SavedUrlState } from './engine/types';
import { KATEGORIER, OPGAVETYPER, OPGAVETYPER_MAP } from './engine/registry';
import { SVAERHEDSGRADER } from './engine/presets';
import { genererArbejdsark, AktivOpgavetype } from './engine/worksheet';
import { kodTilUrl, afkodFraUrl } from './engine/urlState';

export function App() {
  const { showToast } = useToast();

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('talvaerksted-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('talvaerksted-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('talvaerksted-theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Global generator state
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1e9));
  const [antalOpgaver, setAntalOpgaver] = useState<number>(24);
  const [kolonner, setKolonner] = useState<number>(4);
  const [raekkerPrSide, setRaekkerPrSide] = useState<number>(18);
  const [activePreset, setActivePreset] = useState<DifficultyPreset | null>('mellem');
  const [generationDate, setGenerationDate] = useState<string>(() =>
    new Date().toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );

  // Task selection & parameters
  const [activeTaskIds, setActiveTaskIds] = useState<string[]>(['addition', 'multiplikation']);
  const [taskParams, setTaskParams] = useState<Record<string, Record<string, any>>>(() => {
    const init: Record<string, Record<string, any>> = {};
    OPGAVETYPER.forEach((t) => {
      init[t.id] = { ...(SVAERHEDSGRADER.mellem[t.id] || t.standard) };
    });
    return init;
  });
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Generated worksheet state
  const [generatedOpgaver, setGeneratedOpgaver] = useState<Opgave[]>([]);
  const [reachedLimit, setReachedLimit] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // View and interactive state
  const [viewMode, setViewMode] = useState<'opgaver' | 'facit'>('opgaver');
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [hasChecked, setHasChecked] = useState<boolean>(false);

  // Build active types list for generator
  const getActiveTypesList = useCallback((): AktivOpgavetype[] => {
    return activeTaskIds
      .map((id) => {
        const def = OPGAVETYPER_MAP.get(id);
        if (!def) return null;
        return {
          id,
          generer: def.generer,
          params: taskParams[id] || def.standard,
        };
      })
      .filter((t): t is AktivOpgavetype => t !== null);
  }, [activeTaskIds, taskParams]);

  // Generate worksheet helper
  const performGeneration = useCallback(
    (currentSeed: number, showSuccessToast = false) => {
      const activeTypes = getActiveTypesList();
      if (activeTypes.length === 0) {
        showToast('Vælg mindst én opgavetype for at generere et arbejdsark.', 'warning');
        return;
      }

      const { opgaver, reachedLimit: limit } = genererArbejdsark(
        currentSeed,
        activeTypes,
        antalOpgaver
      );
      setGeneratedOpgaver(opgaver);
      setReachedLimit(limit);
      setHasGenerated(true);
      setUserAnswers({});
      setHasChecked(false);
      setGenerationDate(
        new Date().toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' })
      );

      // Update URL with state without page reload
      const stateObj: SavedUrlState = {
        seed: currentSeed,
        antalOpgaver,
        kolonner,
        raekkerPrSide,
        aktive: activeTaskIds.reduce((acc, id) => {
          acc[id] = taskParams[id] || {};
          return acc;
        }, {} as Record<string, Record<string, any>>),
      };
      const newUrl = kodTilUrl(stateObj);
      if (newUrl && typeof window !== 'undefined') {
        window.history.replaceState(null, '', newUrl);
      }

      if (showSuccessToast) {
        showToast('Nyt arbejdsark genereret!', 'success');
      }
    },
    [getActiveTypesList, antalOpgaver, kolonner, raekkerPrSide, activeTaskIds, taskParams, showToast]
  );

  // On mount: check for URL shared state
  useEffect(() => {
    const sharedState = afkodFraUrl();
    if (sharedState) {
      try {
        setSeed(sharedState.seed);
        if (sharedState.antalOpgaver) setAntalOpgaver(sharedState.antalOpgaver);
        if (sharedState.kolonner) setKolonner(sharedState.kolonner);
        if (sharedState.raekkerPrSide) setRaekkerPrSide(sharedState.raekkerPrSide);

        if (sharedState.aktive && typeof sharedState.aktive === 'object') {
          const ids = Object.keys(sharedState.aktive);
          if (ids.length > 0) {
            setActiveTaskIds(ids);
            setTaskParams((prev) => ({
              ...prev,
              ...sharedState.aktive,
            }));
            setActivePreset(null);
          }
        }

        // Auto-generate loaded shared worksheet
        const activeTypes: AktivOpgavetype[] = Object.entries(sharedState.aktive || {})
          .map(([id, params]) => {
            const def = OPGAVETYPER_MAP.get(id);
            if (!def) return null;
            return { id, generer: def.generer, params };
          })
          .filter((t): t is AktivOpgavetype => t !== null);

        if (activeTypes.length > 0) {
          const { opgaver, reachedLimit: limit } = genererArbejdsark(
            sharedState.seed,
            activeTypes,
            sharedState.antalOpgaver || 24
          );
          setGeneratedOpgaver(opgaver);
          setReachedLimit(limit);
          setHasGenerated(true);
          showToast('Delt arbejdsark indlæst!', 'info');
        }
      } catch {
        // Fallback silently if corrupt
      }
    } else {
      // Generate initial worksheet on clean load
      performGeneration(seed, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Preset selection
  const handleSelectPreset = (preset: DifficultyPreset) => {
    setActivePreset(preset);
    const presetValues = SVAERHEDSGRADER[preset];
    setTaskParams((prev) => {
      const updated = { ...prev };
      OPGAVETYPER.forEach((t) => {
        if (presetValues[t.id]) {
          updated[t.id] = { ...updated[t.id], ...presetValues[t.id] };
        }
      });
      return updated;
    });
    showToast(`Sværhedsgrad sat til "${preset.toUpperCase()}"`, 'info');
  };

  // Toggle single task type
  const handleToggleActiveTask = (id: string) => {
    setActiveTaskIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Expand / collapse task card
  const handleToggleExpandTask = (id: string) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  };

  // Modify task parameter
  const handleChangeParam = (taskId: string, key: string, value: any) => {
    setTaskParams((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [key]: value,
      },
    }));
    setActivePreset(null); // customized
  };

  // Category select/deselect all
  const handleSelectAllInCategory = (kategoriId: string) => {
    const idsInCat = OPGAVETYPER.filter((t) => t.kategori === kategoriId).map((t) => t.id);
    setActiveTaskIds((prev) => Array.from(new Set([...prev, ...idsInCat])));
  };

  const handleDeselectAllInCategory = (kategoriId: string) => {
    const idsInCat = OPGAVETYPER.filter((t) => t.kategori === kategoriId).map((t) => t.id);
    setActiveTaskIds((prev) => prev.filter((id) => !idsInCat.includes(id)));
  };

  // Generate action button
  const handleGenerate = () => {
    const newSeed = Math.floor(Math.random() * 1e9);
    setSeed(newSeed);
    performGeneration(newSeed, true);
  };

  // Copy shareable link
  const handleCopyShareLink = () => {
    const stateObj: SavedUrlState = {
      seed,
      antalOpgaver,
      kolonner,
      raekkerPrSide,
      aktive: activeTaskIds.reduce((acc, id) => {
        acc[id] = taskParams[id] || {};
        return acc;
      }, {} as Record<string, Record<string, any>>),
    };
    const shareUrl = kodTilUrl(stateObj);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Delbart link kopieret til udklipsholderen!', 'success');
      }).catch(() => {
        showToast('Kunne ikke kopiere link automatisk.', 'destructive');
      });
    }
  };

  // Print worksheet helper
  const handlePrintWorksheet = (mode: 'opgaver' | 'facit') => {
    const prevView = viewMode;
    const prevInteractive = isInteractive;

    setViewMode(mode);
    setIsInteractive(false);

    if (mode === 'opgaver') {
      showToast(
        'Husk at printe facitarket også, hvis du skal bruge det! Facitarket forsvinder, hvis du genererer et nyt arbejdsark.',
        'warning',
        'Husk facitarket',
        7000
      );
    }

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setViewMode(prevView);
        setIsInteractive(prevInteractive);
      }, 300);
    }, 150);
  };

  // Interactive answer updates
  const handleAnswerChange = (index: number, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleCheckAnswers = () => {
    setHasChecked(true);
    showToast('Svar rettet! Se resultatet på arket.', 'info');
  };

  const handleResetAnswers = () => {
    setUserAnswers({});
    setHasChecked(false);
  };

  // Compute correct answers count
  const { correctCount, totalAnswered } = useMemo(() => {
    let correct = 0;
    let answered = 0;
    generatedOpgaver.forEach((opgave, idx) => {
      const ans = userAnswers[idx];
      if (ans && ans.trim().length > 0) {
        answered++;
        if (opgave.erTekstFacit) {
          const cleanUser = ans.replace(/\s+/g, '').replace(/−/g, '-').toLowerCase();
          const cleanFacit = (opgave.facitTekst || '').replace(/\s+/g, '').replace(/−/g, '-').toLowerCase();
          if (cleanUser === cleanFacit) correct++;
        } else if (opgave.facit !== undefined) {
          const parsedUser = parseFloat(ans.replace(',', '.'));
          if (!isNaN(parsedUser) && Math.abs(parsedUser - opgave.facit) < 0.01) {
            correct++;
          }
        }
      }
    });
    return { correctCount: correct, totalAnswered: answered };
  }, [generatedOpgaver, userAnswers]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Control Panel (lg:col-span-5) */}
          <aside className="lg:col-span-5 space-y-5 no-print lg:sticky lg:top-24">
            {/* Quick Start Guide */}
            <QuickStartGuide />

            {/* Difficulty Preset Shortcuts */}
            <DifficultyPresets
              activePreset={activePreset}
              onSelectPreset={handleSelectPreset}
            />

            {/* Task Type Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Opgavetyper ({activeTaskIds.length} aktive)
                </label>
              </div>

              {KATEGORIER.map((kat) => (
                <CategorySection
                  key={kat.id}
                  kategori={kat}
                  opgavetyper={OPGAVETYPER.filter((t) => t.kategori === kat.id)}
                  activeTaskIds={activeTaskIds}
                  taskParams={taskParams}
                  expandedTaskId={expandedTaskId}
                  onToggleActive={handleToggleActiveTask}
                  onToggleExpand={handleToggleExpandTask}
                  onChangeParam={handleChangeParam}
                  onSelectAllInCategory={handleSelectAllInCategory}
                  onDeselectAllInCategory={handleDeselectAllInCategory}
                />
              ))}
            </div>

            {/* Global Settings (Count, Columns, Rows/Page) */}
            <GlobalSettings
              antalOpgaver={antalOpgaver}
              kolonner={kolonner}
              raekkerPrSide={raekkerPrSide}
              onChangeAntalOpgaver={setAntalOpgaver}
              onChangeKolonner={setKolonner}
              onChangeRaekkerPrSide={setRaekkerPrSide}
            />

            {/* Action Buttons Panel */}
            <ActionPanel
              viewMode={viewMode}
              isInteractive={isInteractive}
              hasChecked={hasChecked}
              correctCount={correctCount}
              totalAnswered={totalAnswered}
              totalTasks={generatedOpgaver.length}
              hasGenerated={hasGenerated}
              onGenerate={handleGenerate}
              onChangeViewMode={setViewMode}
              onToggleInteractive={() => setIsInteractive(!isInteractive)}
              onCheckAnswers={handleCheckAnswers}
              onResetAnswers={handleResetAnswers}
              onCopyShareLink={handleCopyShareLink}
              onPrintWorksheet={handlePrintWorksheet}
            />
          </aside>

          {/* Right Panel: The Worksheet (lg:col-span-7) */}
          <section className="lg:col-span-7 space-y-4">
            <WorksheetPreview
              opgaver={generatedOpgaver}
              kolonner={kolonner}
              raekkerPrSide={raekkerPrSide}
              reachedLimit={reachedLimit}
              viewMode={viewMode}
              isInteractive={isInteractive}
              userAnswers={userAnswers}
              hasChecked={hasChecked}
              generationDate={generationDate}
              onAnswerChange={handleAnswerChange}
            />
          </section>
        </div>
      </main>

      {/* Web Footer */}
      <Footer />
    </div>
  );
}
