import React from 'react';
import { DifficultyPreset } from '../engine/types';
import { Layers } from 'lucide-react';

type DifficultyPresetsProps = {
  activePreset: DifficultyPreset | null;
  onSelectPreset: (preset: DifficultyPreset) => void;
};

export const DifficultyPresets: React.FC<DifficultyPresetsProps> = ({
  activePreset,
  onSelectPreset,
}) => {
  const presets: { id: DifficultyPreset; label: string; desc: string }[] = [
    { id: 'let', label: 'Let', desc: 'Mindre tal, 2 led, ingen negativtal' },
    { id: 'mellem', label: 'Mellem', desc: 'Standard mellemtrin, op til 100' },
    { id: 'svaer', label: 'Svær', desc: 'Flere led, store tal, decimal & negative tal' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Sværhedsgrad (Hurtigvalg)
        </label>
        {activePreset && (
          <span className="text-[11px] font-mono text-muted-foreground">
            Aktiv: <span className="font-semibold text-foreground capitalize">{activePreset}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {presets.map((p) => {
          const isSelected = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPreset(p.id)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all duration-200 text-center flex flex-col items-center justify-center gap-0.5 focus:outline-none ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-secondary/40 text-foreground border-border hover:bg-secondary/80'
              }`}
              title={p.desc}
            >
              <span>{p.label}</span>
              <span className={`text-[10px] font-normal truncate max-w-full opacity-80 ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                {p.id === 'let' ? 'Indskoling/let' : p.id === 'mellem' ? 'Mellemtrin' : 'Udskoling/svær'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
