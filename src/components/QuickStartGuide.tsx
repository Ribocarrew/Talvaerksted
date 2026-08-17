import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const QuickStartGuide: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-warning/60 bg-warning/5 p-4 sm:p-5 transition-all duration-200">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
          <Sparkles className="w-4 h-4 text-warning flex-shrink-0" />
          <span>Kom godt i gang på 1 minut</span>
        </div>
        <button
          type="button"
          aria-label={collapsed ? 'Fold guide ud' : 'Fold guide sammen'}
          className="p-1 text-muted-foreground hover:text-foreground rounded focus:outline-none"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <ol className="mt-3 space-y-2 text-xs sm:text-sm text-foreground/90 font-medium">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warning/20 text-foreground font-mono font-bold flex items-center justify-center text-xs">
              1
            </span>
            <span>Vælg en sværhedsgrad (Let / Mellem / Svær) for at forudindstille alle typer.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warning/20 text-foreground font-mono font-bold flex items-center justify-center text-xs">
              2
            </span>
            <span>Sæt flueben ved de opgavetyper, der skal med på arket, og finjuster evt. parametre.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warning/20 text-foreground font-mono font-bold flex items-center justify-center text-xs">
              3
            </span>
            <span>Tryk på <strong>Generér arbejdsark</strong> for at lave et unikt, dublet-frit opgavesæt.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warning/20 text-foreground font-mono font-bold flex items-center justify-center text-xs">
              4
            </span>
            <span>Vis facitark, slå <strong>Interaktiv tilstand</strong> til for selvretning, eller print direkte.</span>
          </li>
        </ol>
      )}
    </div>
  );
};
