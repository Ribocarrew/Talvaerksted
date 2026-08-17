import React from 'react';
import logoPrintLille from '../assets/logo-print-lille.png';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/60 py-10 px-4 text-center text-muted-foreground text-xs sm:text-sm space-y-1.5 no-print">
      <div className="flex items-center justify-center gap-2">
        <img
          src={logoPrintLille}
          alt=""
          className="h-5 w-auto object-contain opacity-70"
        />
        <p className="font-semibold text-foreground/90">
          Jacob Witt-Larsen · Master i IT og Læring (MIL)
        </p>
      </div>
      <p className="text-xs italic text-muted-foreground">
        Tænk før du klikker, men klik.
      </p>
      <p className="text-[11px] text-muted-foreground/70 pt-1">
        100 % klient-side · Ingen sporing eller cookies · Gemmer kun mørkt tema lokalt
      </p>
    </footer>
  );
};
