import React from 'react';
import { Sun, Moon } from 'lucide-react';
import logoWebp from '../assets/logo-header.webp';
import logoPng from '../assets/logo-header.png';

type HeaderProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  return (
    <header className="w-full border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-40 no-print transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <picture className="flex-shrink-0">
            <source srcSet={logoWebp} type="image/webp" />
            <img
              src={logoPng}
              alt="Sandboxmodellen"
              className="h-11 w-auto object-contain"
            />
          </picture>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl sm:text-2xl tracking-tight text-foreground">
                Talværksted
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                v1.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Matematik-opgavegenerator til grundskolelærere
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl border border-border bg-secondary/50 text-foreground hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium focus:outline-none"
            aria-label={darkMode ? 'Skift til lyst tema' : 'Skift til mørkt tema'}
            title={darkMode ? 'Skift til lyst tema' : 'Skift til mørkt tema (værksted om aftenen)'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-accent" />
                <span className="hidden md:inline text-xs">Lyst tema</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-primary" />
                <span className="hidden md:inline text-xs">Aftenværksted</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
