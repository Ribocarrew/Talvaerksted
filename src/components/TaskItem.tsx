import React from 'react';
import { Opgave } from '../engine/types';
import { formatTal } from '../engine/rng';

type TaskItemProps = {
  index: number;
  opgave: Opgave;
  viewMode: 'opgaver' | 'facit';
  isInteractive: boolean;
  userAnswer: string;
  hasChecked: boolean;
  onAnswerChange: (index: number, value: string) => void;
};

export const TaskItem: React.FC<TaskItemProps> = ({
  index,
  opgave,
  viewMode,
  isInteractive,
  userAnswer,
  hasChecked,
  onAnswerChange,
}) => {
  // Determine formatted facit string
  const formattedFacit = opgave.erTekstFacit
    ? opgave.facitTekst || ''
    : opgave.facit !== undefined
    ? formatTal(opgave.facit, opgave.decimaler)
    : '';

  // Determine correctness if checked
  let isCorrect = false;
  const isFilled = userAnswer.trim().length > 0;

  if (hasChecked && isFilled) {
    if (opgave.erTekstFacit) {
      const cleanUser = userAnswer.replace(/\s+/g, '').replace(/−/g, '-').toLowerCase();
      const cleanFacit = (opgave.facitTekst || '').replace(/\s+/g, '').replace(/−/g, '-').toLowerCase();
      isCorrect = cleanUser === cleanFacit;
    } else if (opgave.facit !== undefined) {
      const parsedUser = parseFloat(userAnswer.replace(',', '.'));
      if (!isNaN(parsedUser)) {
        isCorrect = Math.abs(parsedUser - opgave.facit) < 0.01;
      }
    }
  }

  // Split template by "__"
  const parts = opgave.template.split('__');
  const prefix = parts[0] || '';
  const suffix = parts[1] || '';

  return (
    <div className="opgave-item flex items-baseline gap-2 py-2 px-2.5 rounded-xl transition-colors hover:bg-secondary/20 break-inside-avoid">
      {/* Index marker */}
      <span className="text-xs font-mono font-bold text-muted-foreground/70 select-none min-w-[24px]">
        {index + 1}.
      </span>

      {/* Math Expression */}
      <div className="flex-1 font-mono text-sm sm:text-[15px] font-medium text-foreground tracking-tight flex items-baseline flex-wrap gap-1 tabular-nums">
        <span>{prefix}</span>

        {/* Dynamic answer slot */}
        {viewMode === 'facit' ? (
          <span className="font-bold text-primary px-1 border-b-2 border-primary/50">
            {formattedFacit}
          </span>
        ) : isInteractive ? (
          <span className="inline-flex items-center">
            {/* Screen Interactive Input */}
            <input
              type="text"
              aria-label={`Svar for opgave ${index + 1}`}
              value={userAnswer}
              onChange={(e) => onAnswerChange(index, e.target.value)}
              placeholder="svar"
              className={`no-print w-20 sm:w-24 px-2 py-0.5 text-center text-xs sm:text-sm font-mono font-semibold rounded-lg border transition-all focus:outline-none ${
                hasChecked && isFilled
                  ? isCorrect
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-red-100 dark:bg-red-950/60 border-destructive text-destructive font-bold'
                  : 'bg-background border-border/80 text-foreground focus:ring-1 focus:ring-primary'
              }`}
            />
            {/* Print fallback line when interactive mode is printed */}
            <span className="print-only border-b border-foreground/60 w-16 inline-block" />
          </span>
        ) : (
          <span className="border-b-2 border-foreground/50 w-14 sm:w-16 inline-block mx-0.5 select-none" />
        )}

        <span>{suffix}</span>
      </div>
    </div>
  );
};
