import React from 'react';
import {
  Sparkles,
  Printer,
  Link,
  Eye,
  CheckSquare,
  RotateCcw,
  Info,
} from 'lucide-react';

type ActionPanelProps = {
  viewMode: 'opgaver' | 'facit';
  isInteractive: boolean;
  hasChecked: boolean;
  correctCount: number;
  totalAnswered: number;
  totalTasks: number;
  hasGenerated: boolean;
  onGenerate: () => void;
  onChangeViewMode: (mode: 'opgaver' | 'facit') => void;
  onToggleInteractive: () => void;
  onCheckAnswers: () => void;
  onResetAnswers: () => void;
  onCopyShareLink: () => void;
  onPrintWorksheet: (mode: 'opgaver' | 'facit') => void;
};

export const ActionPanel: React.FC<ActionPanelProps> = ({
  viewMode,
  isInteractive,
  hasChecked,
  correctCount,
  totalAnswered,
  totalTasks,
  hasGenerated,
  onGenerate,
  onChangeViewMode,
  onToggleInteractive,
  onCheckAnswers,
  onResetAnswers,
  onCopyShareLink,
  onPrintWorksheet,
}) => {
  return (
    <div className="space-y-3 pt-1">
      {/* Primary Generate Button (Deep Teal) */}
      <button
        type="button"
        onClick={onGenerate}
        className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm sm:text-base shadow-sm hover:opacity-95 transition-all active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none"
      >
        <Sparkles className="w-5 h-5 text-accent flex-shrink-0" />
        <span>Generér arbejdsark</span>
      </button>

      {/* Action toolset (when sheet is generated) */}
      {hasGenerated && (
        <div className="rounded-2xl border border-border/80 bg-background p-3.5 sm:p-4 space-y-3.5 shadow-xs">
          {/* View mode toggle (Opgaveark vs Facitark) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Visningstilstand
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-secondary/60 p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => onChangeViewMode('opgaver')}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'opgaver'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Opgaveark</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('facit')}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'facit'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Facitark</span>
              </button>
            </div>
          </div>

          {/* Interactive Mode & Answer Checker (Only on Opgaveark) */}
          {viewMode === 'opgaver' && (
            <div className="pt-2 border-t border-border/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="interactive-toggle" className="text-xs font-semibold text-foreground cursor-pointer">
                  Interaktiv tilstand (elevløsning)
                </label>
                <button
                  id="interactive-toggle"
                  type="button"
                  role="switch"
                  aria-checked={isInteractive}
                  onClick={onToggleInteractive}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    isInteractive ? 'bg-primary' : 'bg-secondary border border-border'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isInteractive ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {isInteractive && (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onCheckAnswers}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Tjek svar</span>
                    </button>
                    {hasChecked && (
                      <button
                        type="button"
                        onClick={onResetAnswers}
                        title="Nulstil alle indtastede svar"
                        className="p-2 rounded-xl border border-border bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Checked results score */}
                  {hasChecked && (
                    <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 text-center text-xs font-mono">
                      <span className="text-muted-foreground">Resultat: </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {correctCount}
                      </strong>
                      <span> af {totalAnswered} besvarede (ud af {totalTasks} opgaver)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Share & Print Toolbar */}
          <div className="pt-2 border-t border-border/60 space-y-2.5">
            <button
              type="button"
              onClick={onCopyShareLink}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Link className="w-3.5 h-3.5 text-primary" />
              <span>Kopiér delbart link (bevarer arket)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onPrintWorksheet('opgaver')}
                className="py-2.5 px-3 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Print opgaver</span>
              </button>
              <button
                type="button"
                onClick={() => onPrintWorksheet('facit')}
                className="py-2.5 px-3 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-primary" />
                <span>Print facit</span>
              </button>
            </div>

            {/* Reminder tip box about printing answers before generating new sheet */}
            <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/30 text-[11px] text-foreground space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Husk facitarket:</span>
              </div>
              <p className="leading-tight text-muted-foreground">
                Husk at printe facitarket med, hvis du skal bruge det. Hvis du genererer et nyt arbejdsark, får du et helt nyt sæt opgaver og facit.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
