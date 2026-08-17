import React, { useState, useEffect } from 'react';
import { Sliders, Columns, FileText, Hash } from 'lucide-react';

type GlobalSettingsProps = {
  antalOpgaver: number;
  kolonner: number;
  raekkerPrSide: number;
  onChangeAntalOpgaver: (n: number) => void;
  onChangeKolonner: (n: number) => void;
  onChangeRaekkerPrSide: (n: number) => void;
};

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  antalOpgaver,
  kolonner,
  raekkerPrSide,
  onChangeAntalOpgaver,
  onChangeKolonner,
  onChangeRaekkerPrSide,
}) => {
  const [inputValue, setInputValue] = useState<string>(antalOpgaver.toString());
  const opgavePresets = [12, 24, 50, 100, 250, 500];
  const kolonneValg = [1, 2, 3];

  useEffect(() => {
    setInputValue(antalOpgaver.toString());
  }, [antalOpgaver]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onChangeAntalOpgaver(Math.min(1000, parsed));
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue('24');
      onChangeAntalOpgaver(24);
    } else {
      const clamped = Math.min(1000, Math.max(1, parsed));
      setInputValue(clamped.toString());
      onChangeAntalOpgaver(clamped);
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-background p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <Sliders className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          Arbejdsarkets opsætning
        </h3>
      </div>

      {/* Antal opgaver */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
            Antal opgaver i alt:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={1000}
              aria-label="Antal opgaver i alt (skriv et vilkårligt antal, f.eks. 100 eller 500)"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="f.eks. 100"
              className="w-24 px-2.5 py-1 rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-center text-xs font-bold focus:ring-1 focus:ring-primary"
            />
            <span className="text-[11px] text-muted-foreground">stk.</span>
          </div>
        </div>

        {/* Quick select pills */}
        <div className="grid grid-cols-6 gap-1 pt-0.5">
          {opgavePresets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setInputValue(val.toString());
                onChangeAntalOpgaver(val);
              }}
              className={`py-1 rounded-lg text-xs font-mono font-medium border transition-colors text-center ${
                antalOpgaver === val
                  ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                  : 'bg-secondary/40 border-border/70 text-foreground hover:bg-secondary'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Skriv et vilkårligt antal i feltet (f.eks. 100, 200 eller 500 stykker).
        </p>
      </div>

      {/* Kolonner (1, 2 eller 3) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-muted-foreground" />
            Kolonner i gitter:
          </label>
          <span className="text-xs font-mono font-semibold text-foreground">
            {kolonner} {kolonner === 1 ? 'kolonne' : 'kolonner'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {kolonneValg.map((cols) => (
            <button
              key={cols}
              type="button"
              onClick={() => onChangeKolonner(cols)}
              className={`py-2 rounded-xl text-xs font-mono font-medium border transition-colors flex flex-col items-center justify-center gap-0.5 ${
                kolonner === cols
                  ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                  : 'bg-secondary/40 border-border/70 text-foreground hover:bg-secondary'
              }`}
            >
              <span className="font-bold text-sm">{cols}</span>
              <span className="text-[10px] opacity-80">{cols === 1 ? 'kolonne' : 'kolonner'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rækker pr. side ved print */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            Rækker pr. printside:
          </label>
          <input
            type="number"
            min={4}
            max={50}
            aria-label="Rækker pr. printside"
            value={raekkerPrSide}
            onChange={(e) => onChangeRaekkerPrSide(Math.min(50, Math.max(4, parseInt(e.target.value, 10) || 4)))}
            className="w-16 px-2 py-1 rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-center text-xs font-bold focus:ring-1 focus:ring-primary"
          />
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight">
          Styrer hvor mange rækker der placeres pr. A4-ark før sideskift (maks {kolonner * raekkerPrSide} opg/side).
        </p>
      </div>
    </div>
  );
};
