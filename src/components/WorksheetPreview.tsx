import React from 'react';
import { Opgave } from '../engine/types';
import { delOpiSider } from '../engine/worksheet';
import { WorksheetPage } from './WorksheetPage';
import { FileQuestion, AlertTriangle, Layers } from 'lucide-react';

type WorksheetPreviewProps = {
  opgaver: Opgave[];
  kolonner: number;
  raekkerPrSide: number;
  reachedLimit: boolean;
  viewMode: 'opgaver' | 'facit';
  isInteractive: boolean;
  userAnswers: Record<number, string>;
  hasChecked: boolean;
  generationDate: string;
  onAnswerChange: (index: number, value: string) => void;
};

export const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({
  opgaver,
  kolonner,
  raekkerPrSide,
  reachedLimit,
  viewMode,
  isInteractive,
  userAnswers,
  hasChecked,
  generationDate,
  onAnswerChange,
}) => {
  // Empty state
  if (opgaver.length === 0) {
    return (
      <div className="w-full rounded-2xl border-2 border-dashed border-border/80 bg-background/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 min-h-[420px]">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
          <FileQuestion className="w-6 h-6 text-primary" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-base font-bold text-foreground">
            Intet arbejdsark genereret endnu
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Vælg en sværhedsgrad og dine ønskede opgavetyper i menuen til venstre, og tryk derefter på <strong>Generér arbejdsark</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Split into pages
  const sider = delOpiSider(opgaver, kolonner, raekkerPrSide);
  const totalPages = sider.length;

  return (
    <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
      {/* Small sample space alert if limited */}
      {reachedLimit && (
        <div className="no-print flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-warning text-foreground text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <span>
            <strong>Maksimalt antal unikke opgaver nået:</strong> Det valgte talrum gav {opgaver.length} unikke opgaver. Udvid talintervallet eller vælg flere opgavetyper for at nå et højere antal.
          </span>
        </div>
      )}

      {/* Multi-page status bar (Screen only) */}
      {totalPages > 1 && (
        <div className="no-print flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>
              {opgaver.length} opgaver fordelt på {totalPages} sider ({raekkerPrSide} rækker × {kolonner} kolonner pr. side)
            </span>
          </div>
          <span className="text-[11px] hidden sm:inline">
            Juster evt. "Rækker pr. printside" i opsætningen
          </span>
        </div>
      )}

      {/* Stacked Pages Container */}
      <div className="space-y-6 print:space-y-0">
        {sider.map((sideOpgaver, pageIdx) => {
          const startIndex = pageIdx * (raekkerPrSide * kolonner);
          return (
            <div key={`page-${pageIdx}`} className="relative print:m-0 print:p-0">
              {/* Floating Sheet Container with Teal Shadow on screen, unbordered on print */}
              <div className="worksheet-outer-card rounded-2xl border border-border/80 shadow-elevated dark:shadow-elevated-dark bg-background overflow-hidden print:border-0 print:shadow-none print:bg-white print:rounded-none print:overflow-visible print:m-0 print:p-0">
                <WorksheetPage
                  pageIndex={pageIdx}
                  totalPages={totalPages}
                  opgaver={sideOpgaver}
                  startIndex={startIndex}
                  kolonner={kolonner}
                  viewMode={viewMode}
                  isInteractive={isInteractive}
                  userAnswers={userAnswers}
                  hasChecked={hasChecked}
                  generationDate={generationDate}
                  onAnswerChange={onAnswerChange}
                />
              </div>

              {/* Visual page separator for screen view */}
              {pageIdx < totalPages - 1 && (
                <div className="no-print my-6 flex items-center justify-center gap-2">
                  <div className="h-px bg-border/80 flex-1 border-dashed border-b" />
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Sideskift (Side {pageIdx + 1} / Side {pageIdx + 2})
                  </span>
                  <div className="h-px bg-border/80 flex-1 border-dashed border-b" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
