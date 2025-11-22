// app/dashboard/cat/[id]/TreatmentsSection.tsx
"use client";

import { Cat, TreatmentType } from "@/types";
import { Plus, Trash2, Pill, Bug, Ear, Syringe, ShieldCheck, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface TreatmentsSectionProps {
  cat: Cat;
  canEdit: boolean;
  onAddClick: () => void;
  onDeleteClick: (treatmentId: string) => void;
}

// Настройка визуального стиля для разных типов процедур
const treatmentMeta = {
  [TreatmentType.WORMS]: { 
      name: 'Дегельминтизация', 
      icon: Pill, 
      bg: 'bg-rose-50', 
      text: 'text-rose-500', 
      border: 'border-rose-100' 
  },
  [TreatmentType.FLEAS]: { 
      name: 'Обработка от блох', 
      icon: Bug, 
      bg: 'bg-amber-50', 
      text: 'text-amber-600', 
      border: 'border-amber-100' 
  },
  [TreatmentType.EAR_MITES]: { 
      name: 'Ушной клещ', 
      icon: Ear, 
      bg: 'bg-sky-50', 
      text: 'text-sky-600', 
      border: 'border-sky-100' 
  },
  [TreatmentType.VACCINATION]: { 
      name: 'Вакцинация', 
      icon: Syringe, 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      border: 'border-indigo-100' 
  },
};

const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({ cat, canEdit, onAddClick, onDeleteClick }) => {
  
  const allTreatments = [...(cat.treatments || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 sm:p-8 rounded-3xl h-full flex flex-col">
      {/* --- ЗАГОЛОВОК --- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 text-gray-800">
             <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                <Stethoscope size={24} />
             </div>
            <h3 className="text-xl font-bold">Процедуры</h3>
        </div>

        {canEdit && (
           <button 
                onClick={onAddClick} 
                className="w-10 h-10 sm:w-auto sm:h-10 sm:px-4 flex items-center justify-center gap-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark shadow-md shadow-brand-primary/20 transition-all active:scale-95"
                title="Добавить запись"
            >
                <Plus size={20} />
                <span className="hidden sm:inline text-sm font-bold">Добавить</span>
            </button>
        )}
      </div>

      {/* --- СПИСОК --- */}
      <div className="space-y-3 relative">
        {allTreatments.length > 0 ? (
           // Вертикальная линия таймлайна (декоративная)
           <>
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100 hidden sm:block z-0" />
              
              {allTreatments.map((t, index) => {
                const meta = treatmentMeta[t.type];
                const Icon = meta.icon;
                
                // Определяем подзаголовок для вакцин
                let subLabel = meta.name;
                let badge = null;

                if (t.type === TreatmentType.VACCINATION) {
                    if (t.vaccinationStage === 'first') {
                        badge = '1 этап';
                    } else if (t.vaccinationStage === 'second') {
                        badge = '2 этап';
                    } else if (t.vaccinationStage === 'revaccination') {
                        badge = 'Ежегодно';
                    }
                }
                
                return (
                  <motion.div 
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative z-10 group"
                  >
                    <div className="flex items-center gap-3 bg-white border border-gray-100 p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Иконка */}
                        <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border
                            ${meta.bg} ${meta.text} ${meta.border}
                        `}>
                            <Icon size={22} />
                        </div>

                        {/* Инфо */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-bold text-gray-800 truncate text-base">
                                    {t.productName}
                                </h4>
                                
                                {badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                {subLabel}
                            </p>
                        </div>

                        {/* Дата и Удаление */}
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                {format(new Date(t.date), 'd MMM yy', { locale: ru })}
                            </span>
                            
                            {canEdit && (
                                <button 
                                    onClick={() => onDeleteClick(t.id)} 
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Удалить запись"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            )}
                        </div>
                    </div>
                  </motion.div>
                )
              })}
           </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <ShieldCheck size={32} className="opacity-50" />
                </div>
                <p className="font-medium">История чиста</p>
                <p className="text-xs opacity-70 mt-1">Добавьте первую запись</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentsSection;