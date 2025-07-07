// app/dashboard/cat/[id]/CatProfileHeader.tsx
"use client";

import { Cat, CatStatus } from "@/types";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import { Calendar, Gift, Edit, Trash2, Info, AlertTriangle, Home, ArchiveRestore } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { getRevaccinationStatus, RevaccinationInfo } from "@/lib/revaccinationHelper";
import { useEffect, useState } from "react";

interface CatProfileHeaderProps {
  cat: Cat;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onInfoClick: () => void;
  onStatusChange: (status: CatStatus) => Promise<void>;
}

const pluralizeYears = (age: number) => {
    if (age % 10 === 1 && age % 100 !== 11) return 'год';
    if ([2, 3, 4].includes(age % 10) && ![12, 13, 14].includes(age % 100)) return 'года';
    return 'лет';
};

const CatProfileHeader: React.FC<CatProfileHeaderProps> = ({ cat, canEdit, onEdit, onDelete, onInfoClick, onStatusChange }) => {
  const [alertInfo, setAlertInfo] = useState<RevaccinationInfo>({ status: null, dueDate: null, isOverdue: false, message: '' });
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    setAlertInfo(getRevaccinationStatus(cat));
  }, [cat]);

  const handleStatusChange = async () => {
    const newStatus: CatStatus = cat.status === 'В приюте' ? 'Дома' : 'В приюте';
    const confirmMessage = `Вы уверены, что хотите изменить статус кошки "${cat.name}" на "${newStatus}"?`;
    
    if (window.confirm(confirmMessage)) {
        setIsChangingStatus(true);
        await onStatusChange(newStatus);
        setIsChangingStatus(false);
    }
  };

  const getAge = (birthYear: number | null) => {
    if (!birthYear) return null;
    const age = new Date().getFullYear() - birthYear;
    return `${age} ${pluralizeYears(age)}`;
  }

  const ageString = getAge(cat.birthYear);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  let avatarSrc: string;
  if (cat.avatarUrl) {
    if (cat.avatarUrl.startsWith('data:')) {
      avatarSrc = cat.avatarUrl;
    } else {
      avatarSrc = `${appUrl}${cat.avatarUrl}`;
    }
  } else {
    avatarSrc = `https://placehold.co/128x128/e2e8f0/64748b?text=${cat.name.charAt(0)}`;
  }

  const bannerClasses = alertInfo.status === 'overdue'
    ? "bg-brand-accent-bg border-brand-accent text-brand-accent-text"
    : "bg-brand-warning-bg border-brand-warning text-brand-warning-text";
    
  return (
    <div className="space-y-4">
      {alertInfo.status && alertInfo.dueDate && (
        <div className={`border-l-4 p-4 rounded-r-lg ${bannerClasses}`} role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 mr-4" /></div>
            <div>
              <p className="font-bold">
                {alertInfo.status === 'overdue' ? 'Внимание, задача просрочена!' : 'Требуется обработка!'}
              </p>
              <p className="text-sm">
                {alertInfo.message} до {format(alertInfo.dueDate, 'd MMMM yy', { locale: ru })}.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-brand-surface/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-md relative">
        <div className="hidden sm:flex absolute top-6 right-6 items-center gap-2 flex-shrink-0">
            {canEdit && (
              <Button onClick={handleStatusChange} variant="secondary" className="p-2 h-12 w-12 rounded-full" isLoading={isChangingStatus} title={cat.status === 'В приюте' ? 'Отправить домой' : 'Вернуть в приют'}>
                {cat.status === 'В приюте' ? <Home size={28} /> : <ArchiveRestore size={28} />}
              </Button>
            )}
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
        
        <div className="grid grid-cols-[auto,1fr] items-center gap-x-4 sm:gap-x-6">
            <img
                src={avatarSrc}
                alt={`Аватар ${cat.name}`}
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-brand-primary-light flex-shrink-0"
            />
            <div className="min-w-0 text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-text-primary truncate" title={cat.name}>
                    {cat.name}
                </h2>
                <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm sm:text-base text-brand-text-secondary">
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

        <div className="sm:hidden grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-brand-border">
            {canEdit && (
                <Button onClick={handleStatusChange} variant="secondary" className="flex-col h-auto p-2" isLoading={isChangingStatus}>
                    {cat.status === 'В приюте' ? <Home size={20} /> : <ArchiveRestore size={20} />}
                    <span className="text-xs mt-1">{cat.status === 'В приюте' ? 'Домой' : 'В приют'}</span>
                </Button>
            )}
            <Button onClick={onInfoClick} variant="secondary" className="flex-col h-auto p-2">
                <Info size={20}/>
                <span className="text-xs mt-1">Инфо</span>
            </Button>
            {canEdit && (
              <>
                <Button onClick={onEdit} variant="secondary" className="flex-col h-auto p-2">
                    <Edit size={20}/>
                    <span className="text-xs mt-1">Изменить</span>
                </Button>
                <Button onClick={onDelete} variant="danger" className="flex-col h-auto p-2">
                    <Trash2 size={20}/>
                    <span className="text-xs mt-1">Удалить</span>
                </Button>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default CatProfileHeader;