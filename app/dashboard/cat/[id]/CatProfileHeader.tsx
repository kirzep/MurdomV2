// app/dashboard/cat/[id]/CatProfileHeader.tsx
"use client";

import { Cat } from "@/types";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import { Calendar, Gift, Edit, Trash2, Info } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface CatProfileHeaderProps {
  cat: Cat;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onInfoClick: () => void;
}

const pluralizeYears = (age: number) => {
    if (age % 10 === 1 && age % 100 !== 11) return 'год';
    if ([2, 3, 4].includes(age % 10) && ![12, 13, 14].includes(age % 100)) return 'года';
    return 'лет';
};

const CatProfileHeader: React.FC<CatProfileHeaderProps> = ({ cat, canEdit, onEdit, onDelete, onInfoClick }) => {
  
  const getAge = (birthYear: number | null) => {
    if (!birthYear) return null;
    const age = new Date().getFullYear() - birthYear;
    return `${age} ${pluralizeYears(age)}`;
  }

  const ageString = getAge(cat.birthYear);

  return (
    <div className="bg-brand-surface/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-md relative">
      <div className="hidden sm:flex absolute top-6 right-6 items-center gap-2 flex-shrink-0">
          <Button onClick={onInfoClick} variant="secondary" className="p-2 h-12 w-12 rounded-full">
              <Info size={28} />
          </Button>
          {canEdit && (
            <>
              <Button onClick={onEdit} variant="secondary" className="p-2 h-12 w-12 rounded-full">
                  <Edit size={28} />
              </Button>
              <Button onClick={onDelete} variant="danger" className="p-2 h-12 w-12 rounded-full">
                  <Trash2 size={28} />
              </Button>
            </>
          )}
      </div>
      <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
        <img
          src={cat.avatarUrl || ''}
          alt={`Аватар ${cat.name}`}
          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-brand-primary flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text-primary">{cat.name}</h2>
            <div className="mt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 text-sm sm:text-base text-brand-text-secondary">
                {ageString && (
                    <div className="flex items-center gap-2">
                        <Gift size={20} />
                        <span className="font-medium">{ageString}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>
                        {cat.arrivalDate ? format(new Date(cat.arrivalDate), 'd MMMM yy', { locale: ru }) : 'Дата не указана'}
                    </span>
                </div>
            </div>
        </div>
      </div>
      <div className="sm:hidden flex justify-center items-center gap-3 mt-4 pt-4 border-t border-brand-border">
          <Button onClick={onInfoClick} variant="secondary" className="flex-1 py-3">
              <Info size={22} className="mr-2"/> Инфо
          </Button>
          {canEdit && (
            <>
              <Button onClick={onEdit} variant="secondary" className="flex-1 py-3">
                  <Edit size={22} className="mr-2"/> Изменить
              </Button>
              <Button onClick={onDelete} variant="danger" className="p-3 h-auto w-auto">
                  <Trash2 size={22} />
              </Button>
            </>
          )}
      </div>
    </div>
  );
};

export default CatProfileHeader;
