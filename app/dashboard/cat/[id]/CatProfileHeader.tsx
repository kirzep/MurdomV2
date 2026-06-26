// app/dashboard/cat/[id]/CatProfileHeader.tsx
"use client";

import { Cat } from "@/types";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import { Calendar, Gift, Edit, Trash2, Info, AlertTriangle, Share2, Check } from "lucide-react";
import { getRevaccinationStatus, RevaccinationInfo } from "@/lib/revaccinationHelper";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  const [alertInfo, setAlertInfo] = useState<RevaccinationInfo>({ status: null, dueDate: null, isOverdue: false, message: '' });
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setAlertInfo(getRevaccinationStatus(cat));
  }, [cat]);

  const handleShare = async () => {
    const url = `${window.location.origin}/adopt/${cat.id}`;
    const data = { title: `${cat.name} ищет дом`, text: `Помогите ${cat.name} найти дом!`, url };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(data); } catch { /* отменено */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch { /* clipboard недоступен */ }
    }
  };

  const canShare = cat.status !== 'Умерли';

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
    avatarSrc = `https://placehold.co/200x200/e2e8f0/64748b?text=${cat.name.charAt(0)}`;
  }

  const isOverdue = alertInfo.status === 'overdue';
  const hasAlert = !!alertInfo.status && !!alertInfo.dueDate;

  return (
    <div className="space-y-4">
      {/* Алерт о вакцинации */}
      {hasAlert && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                relative overflow-hidden rounded-2xl p-4 border shadow-sm
                ${isOverdue 
                    ? "bg-red-50/90 border-red-200 text-red-900" 
                    : "bg-amber-50/90 border-amber-200 text-amber-900"}
            `}
        >
          <div className="flex items-start gap-4 z-10 relative">
            <div className={`
                p-2 rounded-full shrink-0
                ${isOverdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}
            `}>
                <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">
                {isOverdue ? 'Внимание! Задача просрочена' : 'Требуется обработка'}
              </p>
              <p className="text-sm mt-1 opacity-90 font-medium">
                {alertInfo.message} {isOverdue ? 'была запланирована на' : 'запланирована на'} {format(alertInfo.dueDate!, 'd MMMM yyyy', { locale: ru })}.
              </p>
            </div>
          </div>
          {/* Декор */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mt-10 -mr-10 pointer-events-none" />
        </motion.div>
      )}

      {/* Основная карточка профиля */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 sm:p-8">
        {/* Фоновый градиент (очень мягкий) */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:items-start">
            {/* Аватарка */}
            <div className="flex justify-center sm:block">
                <div className="relative">
                    <img
                        src={avatarSrc}
                        alt={`Аватар ${cat.name}`}
                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-[2rem] shadow-xl border-4 border-white"
                    />
                    {/* Статус бейдж (опционально) */}
                    <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-gray-600 border border-gray-100">
                        {cat.status}
                    </div>
                </div>
            </div>

            {/* Информация */}
            <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight leading-tight truncate">
                    {cat.name}
                </h1>
                
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                     {/* Возраст */}
                     {ageString && (
                        <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-xl border border-white shadow-sm text-sm font-semibold text-gray-700">
                            <Gift size={16} className="text-brand-primary" />
                            <span>{ageString}</span>
                        </div>
                     )}
                     
                     {/* Дата прибытия */}
                     <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-xl border border-white shadow-sm text-sm font-semibold text-gray-700">
                         <Calendar size={16} className="text-blue-500" />
                         <span>
                             {cat.arrivalDate ? `В приюте с ${format(new Date(cat.arrivalDate), 'd MMM yy', { locale: ru })}` : 'Дата не указана'}
                         </span>
                     </div>
                </div>
            </div>

            {/* Кнопки действий (Десктоп) */}
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
                {canShare && (
                    <button
                        onClick={handleShare}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-brand-primary hover:border-brand-primary hover:shadow-lg transition-all active:scale-95"
                        title="Поделиться карточкой для пристройства"
                    >
                        {shareCopied ? <Check size={22} className="text-emerald-500" /> : <Share2 size={24} />}
                    </button>
                )}
                <button
                    onClick={onInfoClick}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-brand-primary hover:border-brand-primary hover:shadow-lg transition-all active:scale-95"
                    title="Информация о создателе"
                >
                    <Info size={24} />
                </button>
                
                {canEdit && (
                  <>
                    <button 
                        onClick={onEdit} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-500 hover:shadow-lg transition-all active:scale-95"
                        title="Редактировать"
                    >
                        <Edit size={24} />
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-500 hover:shadow-lg transition-all active:scale-95"
                        title="Удалить"
                    >
                        <Trash2 size={24} />
                    </button>
                  </>
                )}
            </div>
        </div>

        {/* Кнопки действий (Мобильные) */}
        <div className="sm:hidden flex justify-around gap-3 mt-8 pt-6 border-t border-gray-100">
            {canShare && (
                <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                        {shareCopied ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">{shareCopied ? 'Готово' : 'Поделиться'}</span>
                </button>
            )}
            <button onClick={onInfoClick} className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                    <Info size={20}/>
                </div>
                <span className="text-[10px] font-medium text-gray-500">Инфо</span>
            </button>
            {canEdit && (
              <>
                <button onClick={onEdit} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <Edit size={20}/>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Правка</span>
                </button>
                <button onClick={onDelete} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                        <Trash2 size={20}/>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Удалить</span>
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default CatProfileHeader;