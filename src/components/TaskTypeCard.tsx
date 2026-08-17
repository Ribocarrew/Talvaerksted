import React from 'react';
import { OpgavetypeDef } from '../engine/types';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

type TaskTypeCardProps = {
  taskDef: OpgavetypeDef;
  isActive: boolean;
  isExpanded: boolean;
  params: Record<string, any>;
  onToggleActive: () => void;
  onToggleExpand: () => void;
  onChangeParam: (key: string, value: any) => void;
};

export const TaskTypeCard: React.FC<TaskTypeCardProps> = ({
  taskDef,
  isActive,
  isExpanded,
  params,
  onToggleActive,
  onToggleExpand,
  onChangeParam,
}) => {
  // Auto-swap min and max on blur if min > max
  const handleMinMaxBlur = (minKey = 'talMin', maxKey = 'talMax') => {
    const minVal = Number(params[minKey]);
    const maxVal = Number(params[maxKey]);
    if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
      onChangeParam(minKey, maxVal);
      onChangeParam(maxKey, minVal);
    }
  };

  const handleUnitToggle = (unit: string) => {
    const currentUnits = (params.enhederValgt as string[]) || ['mm', 'cm', 'dm', 'm'];
    if (currentUnits.includes(unit)) {
      if (currentUnits.length > 2) {
        onChangeParam(
          'enhederValgt',
          currentUnits.filter((u) => u !== unit)
        );
      }
    } else {
      onChangeParam('enhederValgt', [...currentUnits, unit]);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? 'bg-secondary/30 border-primary/40 shadow-sm'
          : 'bg-secondary/15 border-border/70 hover:border-border'
      }`}
    >
      {/* Header / Clickable row */}
      <div
        className="p-3.5 sm:p-4 flex items-start gap-3 cursor-pointer select-none transition-colors"
        onClick={onToggleExpand}
      >
        {/* Custom Checkbox */}
        <div
          className="pt-0.5 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive();
          }}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={isActive}
            aria-label={`Aktivér ${taskDef.navn}`}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              isActive
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>
        </div>

        {/* Title & Static Example */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-sm font-semibold tracking-tight truncate ${
                isActive ? 'text-foreground font-bold' : 'text-foreground/80'
              }`}
            >
              {taskDef.navn}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground hidden xs:inline">
                {isExpanded ? 'Luk' : 'Indstil'}
              </span>
              <div className="text-muted-foreground p-0.5">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Static preview example in JetBrains Mono */}
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-background/80 border border-border/50 text-muted-foreground">
              {taskDef.eksempel}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Parameter Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-background/50 space-y-3.5 text-xs animate-in fade-in duration-150">
          {/* Antal led */}
          {taskDef.felter.includes('antalLed') && (
            <div className="flex items-center justify-between gap-3">
              <label className="font-medium text-foreground">Antal led i regnestykket:</label>
              <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/60">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChangeParam('antalLed', num)}
                    className={`px-2.5 py-1 rounded-lg font-mono font-medium text-xs transition-colors ${
                      params.antalLed === num
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'text-foreground/80 hover:bg-secondary'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tal fra / Tal til (min/max interval) */}
          {taskDef.felter.includes('talMinMax') && (
            <div className="flex items-center justify-between gap-3">
              <label className="font-medium text-foreground">Talinterval (fra – til):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  aria-label="Tal fra"
                  value={params.talMin ?? 1}
                  onChange={(e) => onChangeParam('talMin', parseInt(e.target.value) || 0)}
                  onBlur={() => handleMinMaxBlur('talMin', 'talMax')}
                  className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-foreground font-mono text-center text-xs focus:ring-1 focus:ring-primary"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="number"
                  aria-label="Tal til"
                  value={params.talMax ?? 100}
                  onChange={(e) => onChangeParam('talMax', parseInt(e.target.value) || 0)}
                  onBlur={() => handleMinMaxBlur('talMin', 'talMax')}
                  className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-foreground font-mono text-center text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Størst mulige tal (talMax) for f.eks. division */}
          {taskDef.felter.includes('talMax') && (
            <div className="flex items-center justify-between gap-3">
              <label className="font-medium text-foreground">Størst mulige tal:</label>
              <input
                type="number"
                aria-label="Størst mulige tal"
                value={params.talMax ?? 100}
                onChange={(e) => onChangeParam('talMax', parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 rounded-lg border border-border bg-background text-foreground font-mono text-center text-xs focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Højeste faktor (talMax9) for tabel */}
          {taskDef.felter.includes('talMax9') && (
            <div className="flex items-center justify-between gap-3">
              <label className="font-medium text-foreground">Højeste tabel/faktor:</label>
              <div className="flex items-center gap-1.5">
                {[5, 9, 10, 12].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => onChangeParam('talMax', f)}
                    className={`px-2 py-1 rounded-lg font-mono font-medium text-xs transition-colors ${
                      params.talMax === f
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-secondary/70 text-foreground hover:bg-secondary'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Højeste koefficient (koefMax) */}
          {taskDef.felter.includes('koefMax') && (
            <div className="flex items-center justify-between gap-3">
              <label className="font-medium text-foreground">Højeste koefficient/led:</label>
              <input
                type="number"
                aria-label="Højeste koefficient"
                min={2}
                max={20}
                value={params.talMax ?? 9}
                onChange={(e) => onChangeParam('talMax', Math.max(2, parseInt(e.target.value) || 2))}
                className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-foreground font-mono text-center text-xs focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Enheder (mm, cm, dm, m) */}
          {taskDef.felter.includes('enheder') && (
            <div className="space-y-1.5">
              <label className="font-medium text-foreground block">
                Valgte enheder (vælg mindst 2):
              </label>
              <div className="flex flex-wrap gap-2">
                {['mm', 'cm', 'dm', 'm'].map((unit) => {
                  const isChecked = (params.enhederValgt as string[])?.includes(unit);
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleUnitToggle(unit)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        isChecked
                          ? 'bg-primary/15 border-primary text-foreground font-bold'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {unit} {isChecked ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tillad decimaltal switch */}
          {taskDef.felter.includes('decimaltal') && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <label htmlFor={`dec-${taskDef.id}`} className="font-medium text-foreground cursor-pointer">
                Tillad decimaltal i facit
              </label>
              <button
                id={`dec-${taskDef.id}`}
                type="button"
                role="switch"
                aria-checked={!!params.decimaltal}
                onClick={() => onChangeParam('decimaltal', !params.decimaltal)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  params.decimaltal ? 'bg-primary' : 'bg-secondary border border-border'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    params.decimaltal ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Tillad negative tal switch */}
          {taskDef.felter.includes('negativtal') && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <label htmlFor={`neg-${taskDef.id}`} className="font-medium text-foreground cursor-pointer">
                Tillad negative tal
              </label>
              <button
                id={`neg-${taskDef.id}`}
                type="button"
                role="switch"
                aria-checked={!!params.negativtal}
                onClick={() => onChangeParam('negativtal', !params.negativtal)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  params.negativtal ? 'bg-primary' : 'bg-secondary border border-border'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    params.negativtal ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
