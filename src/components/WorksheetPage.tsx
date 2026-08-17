import React from 'react';
import { Opgave } from '../engine/types';
import { TaskItem } from './TaskItem';
import logoPrint from '../assets/logo-print.png';
import logoPrintLille from '../assets/logo-print-lille.png';

type WorksheetPageProps = {
  pageIndex: number;
  totalPages: number;
  opgaver: Opgave[];
  startIndex: number;
  kolonner: number;
  viewMode: 'opgaver' | 'facit';
  isInteractive: boolean;
  userAnswers: Record<number, string>;
  hasChecked: boolean;
  generationDate: string;
  onAnswerChange: (index: number, value: string) => void;
};

export const WorksheetPage: React.FC<WorksheetPageProps> = ({
  pageIndex,
  totalPages,
  opgaver,
  startIndex,
  kolonner,
  viewMode,
  isInteractive,
  userAnswers,
  hasChecked,
  generationDate,
  onAnswerChange,
}) => {
  // Grid column classes (1, 2 or 3 columns)
  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1:
        return 'grid-cols-1 print:grid-cols-1 max-w-md mx-auto';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3';
      case 2:
      default:
        return 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2';
    }
  };

  return (
    <div className="worksheet-page bg-background text-foreground rounded-2xl p-6 sm:p-8 lg:p-10 print:p-0 print:m-0 print:rounded-none print:border-none print:bg-white print:text-black transition-colors duration-200 flex flex-col justify-between min-h-[500px]">
      {/* Top Page Header */}
      <div>
        <div className="flex items-end justify-between border-b border-border/80 print:border-black/30 pb-3 mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img
                src={logoPrint}
                alt="Talværksted"
                className="print-only h-9 w-auto object-contain"
              />
              <div>
                <h2 className="font-bold text-lg sm:text-xl tracking-tight text-foreground print:text-black">
                  {viewMode === 'facit' ? 'Talværksted — Facitark' : 'Talværksted — Opgaveark'}
                </h2>
                {totalPages > 1 && (
                  <p className="text-xs text-muted-foreground print:text-gray-600 font-mono">
                    Side {pageIndex + 1} af {totalPages}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Student fill-in info (Navn, Klasse, Automatisk udfyldt Dato) */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-foreground/90 print:text-black flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground print:text-gray-700">Navn:</span>
              <span className="border-b border-foreground/40 print:border-black w-24 sm:w-28 print:w-28 inline-block" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground print:text-gray-700">Klasse:</span>
              <span className="border-b border-foreground/40 print:border-black w-12 sm:w-16 print:w-14 inline-block" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground print:text-gray-700">Dato:</span>
              <span className="font-semibold text-foreground print:text-black font-mono border-b border-foreground/40 print:border-black min-w-[75px] text-center inline-block px-1">
                {generationDate}
              </span>
            </div>
          </div>
        </div>

        {/* Task Grid */}
        <div className={`grid ${getGridColsClass(kolonner)} gap-x-5 gap-y-3 sm:gap-y-4 print:gap-x-6 print:gap-y-2.5`}>
          {opgaver.map((opgave, idx) => {
            const globalIndex = startIndex + idx;
            return (
              <TaskItem
                key={`${pageIndex}-${globalIndex}-${opgave.template}`}
                index={globalIndex}
                opgave={opgave}
                viewMode={viewMode}
                isInteractive={isInteractive}
                userAnswer={userAnswers[globalIndex] || ''}
                hasChecked={hasChecked}
                onAnswerChange={onAnswerChange}
              />
            );
          })}
        </div>
      </div>

      {/* Page Footer (Signature & Slogan) */}
      <div className="mt-8 pt-3 border-t border-border/60 print:border-black/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground print:text-gray-700">
        <div className="flex items-center gap-2">
          <img
            src={logoPrintLille}
            alt=""
            className="print-only h-4 w-auto object-contain"
          />
          <span>Jacob Witt-Larsen · Master i IT og Læring (MIL)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="italic font-medium">
            Tænk før du klikker, men klik.
          </span>
          {totalPages > 1 && (
            <span className="font-mono font-semibold">
              [{pageIndex + 1}/{totalPages}]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
