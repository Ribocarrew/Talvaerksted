import React, { useState } from 'react';
import { KategoriDef, OpgavetypeDef } from '../engine/types';
import { TaskTypeCard } from './TaskTypeCard';
import { Calculator, Percent, Ruler, Sigma, ChevronDown, ChevronUp } from 'lucide-react';

type CategorySectionProps = {
  kategori: KategoriDef;
  opgavetyper: OpgavetypeDef[];
  activeTaskIds: string[];
  taskParams: Record<string, Record<string, any>>;
  expandedTaskId: string | null;
  onToggleActive: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onChangeParam: (id: string, key: string, value: any) => void;
  onSelectAllInCategory: (kategoriId: string) => void;
  onDeselectAllInCategory: (kategoriId: string) => void;
};

export const CategorySection: React.FC<CategorySectionProps> = ({
  kategori,
  opgavetyper,
  activeTaskIds,
  taskParams,
  expandedTaskId,
  onToggleActive,
  onToggleExpand,
  onChangeParam,
  onSelectAllInCategory,
  onDeselectAllInCategory,
}) => {
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-4 h-4 text-primary" />;
      case 'Percent':
        return <Percent className="w-4 h-4 text-primary" />;
      case 'Ruler':
        return <Ruler className="w-4 h-4 text-primary" />;
      case 'Sigma':
      default:
        return <Sigma className="w-4 h-4 text-primary" />;
    }
  };

  const activeCount = opgavetyper.filter((t) => activeTaskIds.includes(t.id)).length;
  const allSelected = activeCount === opgavetyper.length;

  return (
    <div className="rounded-2xl border border-border/80 bg-background shadow-xs overflow-hidden">
      {/* Category Header */}
      <div
        className="p-3.5 sm:p-4 bg-secondary/40 flex items-center justify-between cursor-pointer select-none border-b border-border/60 hover:bg-secondary/60 transition-colors"
        onClick={() => setIsSectionOpen(!isSectionOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-background border border-border/60">
            {getCategoryIcon(kategori.icon)}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {kategori.navn}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {activeCount}/{opgavetyper.length}
          </span>
          <button
            type="button"
            onClick={() => (allSelected ? onDeselectAllInCategory(kategori.id) : onSelectAllInCategory(kategori.id))}
            className="text-[11px] text-muted-foreground hover:text-foreground underline decoration-border px-1 py-0.5 focus:outline-none"
          >
            {allSelected ? 'Fravælg' : 'Vælg alle'}
          </button>
          <button
            type="button"
            onClick={() => setIsSectionOpen(!isSectionOpen)}
            aria-label={isSectionOpen ? `Luk sektion ${kategori.navn}` : `Åbn sektion ${kategori.navn}`}
            className="p-1 text-muted-foreground hover:text-foreground focus:outline-none ml-1"
          >
            {isSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Task List */}
      {isSectionOpen && (
        <div className="p-3 sm:p-3.5 space-y-2.5">
          {opgavetyper.map((taskDef) => (
            <TaskTypeCard
              key={taskDef.id}
              taskDef={taskDef}
              isActive={activeTaskIds.includes(taskDef.id)}
              isExpanded={expandedTaskId === taskDef.id}
              params={taskParams[taskDef.id] || taskDef.standard}
              onToggleActive={() => onToggleActive(taskDef.id)}
              onToggleExpand={() => onToggleExpand(taskDef.id)}
              onChangeParam={(key, val) => onChangeParam(taskDef.id, key, val)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
