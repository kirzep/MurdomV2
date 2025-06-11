// app/dashboard/cat/[id]/TreatmentsSection.tsx
"use client";

import { Cat, TreatmentType } from "@/types";
import { Plus, Trash2, Pill, Bug, Ear, Syringe } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Button from "@/app/components/ui/Button";

interface TreatmentsSectionProps {
  cat: Cat;
  canEdit: boolean;
  onAddClick: () => void;
  onDeleteClick: (treatmentId: string) => void;
}

const treatmentMeta = {
  [TreatmentType.WORMS]: { name: 'от глистов', icon: Pill, color: 'text-rose-500' },
  [TreatmentType.FLEAS]: { name: 'от блох', icon: Bug, color: 'text-green-500' },
  [TreatmentType.EAR_MITES]: { name: 'от ушных клещей', icon: Ear, color: 'text-sky-500' },
  [TreatmentType.VACCINATION]: { name: 'вакцинация', icon: Syringe, color: 'text-blue-500' },
};

const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({ cat, canEdit, onAddClick, onDeleteClick }) => {
  
  const allTreatments = [...(cat.treatments || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-brand-surface/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-brand-text-primary">Обработки</h3>
        {canEdit && (
          <Button onClick={onAddClick}>
            <Plus size={22} className="mr-2"/> Добавить
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {allTreatments.length > 0 ? (
          allTreatments.map(t => {
            const meta = treatmentMeta[t.type];
            const Icon = meta.icon;
            return (
              <div key={t.id} className="flex items-center justify-between bg-brand-background p-3 rounded-lg gap-2">
                <div className="flex items-center gap-4 min-w-0">
                  <Icon size={32} className={`${meta.color} flex-shrink-0`} />
                  <div className="truncate">
                    <p className="font-semibold text-brand-text-primary truncate">{t.productName}</p>
                    <p className="text-sm text-brand-text-secondary capitalize">{meta.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-brand-text-secondary w-20 text-right">{format(new Date(t.date), 'd MMM yy', { locale: ru })}</span>
                  {canEdit && (
                    <button onClick={() => onDeleteClick(t.id)} className="p-2 rounded-full hover:bg-brand-border transition-colors text-brand-accent">
                      <Trash2 size={26}/>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-brand-text-secondary italic text-center py-4">Записей об обработках пока нет.</p>
        )}
      </div>
    </div>
  );
};

export default TreatmentsSection;
