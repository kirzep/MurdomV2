// app/dashboard/RevaccinationAlerts.tsx
"use client";

import { useState } from 'react';
import { Cat } from '@/types';
import { RevaccinationInfo } from '@/lib/revaccinationHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AlertTriangle, ChevronDown, ChevronRight, Syringe, CalendarClock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RevaccinationAlertsProps {
  alerts: Array<{ cat: Cat; alert: RevaccinationInfo }>;
}

export default function RevaccinationAlerts({ alerts }: RevaccinationAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // ИСПРАВЛЕНИЕ: Добавляем безопасное значение по умолчанию (пустую строку), 
  // если переменная не задана.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (alerts.length === 0) return null;

  // Считаем статистику для заголовка
  const overdueCount = alerts.filter(a => a.alert.isOverdue).length;
  const upcomingCount = alerts.length - overdueCount;

  return (
    <div className="mb-6 px-1">
      {/* --- ЗАГОЛОВОК (Всегда виден) ---
         Работает как кнопка переключения (аккордеон)
      */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.98 }}
        className={`
            w-full flex items-center justify-between p-3 rounded-2xl border
            backdrop-blur-xl transition-all duration-300 shadow-sm
            ${overdueCount > 0 
                ? 'bg-red-50/80 border-red-200 text-red-900' // Тревожный цвет, если есть просроченные
                : 'bg-amber-50/80 border-amber-200 text-amber-900' // Спокойный, если только планы
            }
        `}
      >
        <div className="flex items-center gap-3">
             {/* Иконка с бейджиком количества */}
            <div className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50
                ${overdueCount > 0 ? 'bg-white text-red-500' : 'bg-white text-amber-500'}
            `}>
                <AlertTriangle size={20} />
                {alerts.length > 0 && (
                     <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-[9px] font-bold text-white border border-white">
                        {alerts.length}
                     </span>
                )}
            </div>
            
            <div className="text-left">
                <h2 className="text-sm font-bold opacity-90">
                    {overdueCount > 0 ? 'Требуется внимание' : 'План вакцинации'}
                </h2>
                <p className="text-xs opacity-70 font-medium">
                    {overdueCount > 0 && `${overdueCount} просрочено • `}
                    {upcomingCount} запланировано
                </p>
            </div>
        </div>

        {/* Стрелочка поворота */}
        <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-1"
        >
            <ChevronDown size={20} className="opacity-50" />
        </motion.div>
      </motion.button>

      {/* --- ВЫПАДАЮЩИЙ СПИСОК ---
         Показывается только если isExpanded === true
      */}
      <AnimatePresence>
        {isExpanded && (
            <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="space-y-2 pb-1">
                    {alerts.map(({ cat, alert }) => (
                        <motion.div
                            key={cat.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            onClick={() => router.push(`/dashboard/cat/${cat.id}`)}
                            className={`
                                flex items-center justify-between p-2 pl-3 rounded-xl cursor-pointer border
                                hover:scale-[1.01] active:scale-[0.99] transition-all
                                bg-white/60 backdrop-blur-md hover:bg-white/90 shadow-sm
                                ${alert.isOverdue ? 'border-red-100' : 'border-amber-100'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                {/* Мини-аватарка */}
                                {cat.avatarUrl ? (
                                    <img 
                                        // ИСПРАВЛЕНИЕ: Используем переменную appUrl с защитой от undefined
                                        src={cat.avatarUrl.startsWith('data:') ? cat.avatarUrl : `${appUrl}${cat.avatarUrl}`} 
                                        alt={cat.name}
                                        className="w-8 h-8 rounded-full object-cover border border-white shadow-sm shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-white shrink-0">
                                        <Syringe size={14} className="text-gray-400"/>
                                    </div>
                                )}
                                
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-700 truncate">{cat.name}</p>
                                    <div className="flex items-center gap-1 text-[10px]">
                                        <CalendarClock size={10} className={alert.isOverdue ? "text-red-500" : "text-amber-500"} />
                                        <span className={alert.isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}>
                                            {alert.isOverdue ? 'Просрочено: ' : 'Дата: '} 
                                            {alert.dueDate ? format(alert.dueDate, 'd MMM', { locale: ru }) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <ChevronRight size={16} className="text-gray-300 mr-1" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}