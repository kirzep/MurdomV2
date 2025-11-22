// app/dashboard/calendar/CalendarView.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CalendarEvent } from '@/lib/calendarHelper';
import { AnimatePresence, motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth, isSameDay, addMonths, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, ListChecks, Check } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import CalendarEventCard from './CalendarEventCard';

interface CalendarViewProps {
  readonly events: CalendarEvent[];
  readonly onConfirmClick: (event: CalendarEvent) => void;
  readonly canEdit: boolean;
}

// --- Компонент строки события (для мобильных и годового вида) ---
const EventRow: React.FC<Readonly<{ event: CalendarEvent; onConfirmClick: (event: CalendarEvent) => void; canEdit: boolean }>> = ({ event, onConfirmClick, canEdit }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const avatarSrc = event.catAvatarUrl
        ? `${appUrl}${event.catAvatarUrl}`
        : `https://placehold.co/32x32/e2e8f0/64748b?text=${event.catName.charAt(0)}`;
    
    let statusColor = "border-l-4 border-indigo-300 bg-indigo-50/50";
    if (event.isProjected) {
        if (event.isOverdue) statusColor = "border-l-4 border-red-400 bg-red-50/50";
        else if (event.isUpcoming) statusColor = "border-l-4 border-amber-400 bg-amber-50/50";
        else statusColor = "border-l-4 border-gray-300 bg-gray-50/50";
    }

    return (
        <div className={`flex items-center gap-4 p-3 rounded-xl shadow-sm hover:shadow-md transition-all ${statusColor}`}>
            <div className="font-semibold text-center w-10 text-gray-600 flex-shrink-0 flex flex-col items-center justify-center bg-white/60 rounded-lg py-1">
                <p className="text-[10px] uppercase font-bold">{format(event.date, 'EEE', {locale: ru})}</p>
                <p className="text-lg -mt-1 font-black">{format(event.date, 'd')}</p>
            </div>
             <Link href={`/dashboard/cat/${event.catId}`} className="flex items-center gap-3 flex-grow min-w-0 group">
                <img src={avatarSrc} alt={event.catName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-gray-800 truncate group-hover:text-brand-primary transition-colors">{event.catName}</p>
                    <p className="text-xs text-gray-500 truncate">{event.stageText}</p>
                </div>
            </Link>
            {canEdit && event.canConfirmVaccination && (
                <button
                    onClick={() => onConfirmClick(event)}
                    className="flex-shrink-0 w-9 h-9 bg-white text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                    title="Отметить как выполненную"
                >
                    <Check size={18} strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onConfirmClick, canEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month'); // По умолчанию месяц, как более привычный

  const changeDate = (amount: number) => {
    setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, amount) : addMonths(prev, amount * 12));
  };

  const getSortPriority = (event: CalendarEvent) => {
    if (event.isOverdue) return 1;
    if (event.isUpcoming) return 2;
    return 3;
  };

  // --- Месячный вид (Сетка) ---
  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Корректировка начала недели (понедельник)
    const startDay = getDay(monthStart);
    const startingDayIndex = (startDay === 0 ? 6 : startDay - 1); 

    return (
      <>
        {/* Десктопная сетка */}
        <div className="hidden md:grid grid-cols-7 gap-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center font-bold text-xs text-gray-400 py-2 uppercase tracking-wider">{day}</div>
            ))}
            
            {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-cell-${i}`} className="" />)}
            
            {daysInMonth.map(day => {
            const dayEvents = events.filter(e => isSameDay(e.date, day));
            const isTodayDay = isToday(day);
            
            return (
                <div key={day.toISOString()} className={`
                    min-h-[100px] p-2 rounded-2xl border transition-all
                    ${isTodayDay 
                        ? 'bg-white border-brand-primary/30 shadow-md ring-2 ring-brand-primary/10' 
                        : 'bg-white/40 border-white/60 hover:bg-white/80 hover:border-white hover:shadow-sm'}
                `}>
                <time dateTime={format(day, "yyyy-MM-dd")} className={`
                    text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1
                    ${isTodayDay ? 'bg-brand-primary text-white' : 'text-gray-500'}
                `}>
                    {format(day, 'd')}
                </time>
                <div className="space-y-1.5">
                    {dayEvents.slice(0, 3).map(event => (
                        <CalendarEventCard 
                            key={event.catId + event.stage + event.date.toISOString()} 
                            event={event} 
                            onConfirmClick={onConfirmClick} 
                            canEdit={canEdit} 
                        />
                    ))}
                    {dayEvents.length > 3 && (
                        <p className="text-[10px] font-bold text-brand-primary text-center bg-brand-primary/5 rounded-md py-0.5">
                            + еще {dayEvents.length - 3}
                        </p>
                    )}
                </div>
                </div>
            );
            })}
        </div>

        {/* Мобильный вид (Список для месяца) */}
        <div className="block md:hidden space-y-4">
             {daysInMonth.map(day => {
                const dayEvents = events.filter(e => isSameDay(e.date, day));
                if (dayEvents.length === 0) return null;
                
                return (
                    <div key={day.toISOString()}>
                         <h4 className={`text-sm font-bold mb-2 pl-1 ${isToday(day) ? 'text-brand-primary' : 'text-gray-500'}`}>
                            {format(day, 'd MMMM, EEEE', { locale: ru })} {isToday(day) && '(Сегодня)'}
                         </h4>
                         <div className="space-y-2">
                            {dayEvents.map(event => (
                                <EventRow 
                                    key={event.catId + event.stage + event.date.toISOString()} 
                                    event={event} 
                                    onConfirmClick={onConfirmClick} 
                                    canEdit={canEdit}
                                />
                            ))}
                         </div>
                    </div>
                )
             })}
             
             {events.filter(e => isSameMonth(e.date, currentDate)).length === 0 && (
                 <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                     <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                     <p>В этом месяце событий нет</p>
                 </div>
             )}
        </div>
      </>
    );
  };

  // --- Годовой вид (Список по месяцам) ---
  const YearView = () => {
    const months = eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) });
    return (
      <div className="space-y-10">
        {months.map(month => {
          const monthEvents = events
            .filter(e => isSameMonth(e.date, month))
            .sort((a, b) => {
              const priorityA = getSortPriority(a);
              const priorityB = getSortPriority(b);
              if (priorityA !== priorityB) return priorityA - priorityB;
              return a.date.getTime() - b.date.getTime();
            });

          if (monthEvents.length === 0) return null;

          return (
            <section key={format(month, 'yyyy-MM')} className="relative pl-4 border-l-2 border-gray-200 ml-2">
               {/* Маркер месяца */}
               <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-brand-primary" />
               
              <h3 className="text-lg font-black text-gray-800 mb-4 capitalize pl-2 -mt-1.5">
                {format(month, 'LLLL', { locale: ru })}
              </h3>
              <div className="space-y-3">
                {monthEvents.map(event => (
                    <EventRow 
                        key={event.catId + event.stage + event.date.toISOString()} 
                        event={event} 
                        onConfirmClick={onConfirmClick} 
                        canEdit={canEdit}
                    />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 sm:p-8 rounded-[2.5rem]">
      
      {/* --- Хедер Календаря --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
        
        {/* Переключатель Вида */}
        <div className="bg-gray-100/80 p-1.5 rounded-2xl flex shadow-inner">
          <button 
            onClick={() => setViewMode('month')} 
            className={`
                px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                ${viewMode === 'month' ? 'bg-white text-brand-text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">Месяц</span>
          </button>
          <button 
            onClick={() => setViewMode('year')} 
            className={`
                px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                ${viewMode === 'year' ? 'bg-white text-brand-text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            <ListChecks size={16} />
            <span className="hidden sm:inline">Год</span>
          </button>
        </div>

        {/* Навигация по датам */}
        <div className="flex items-center gap-6">
            <button onClick={() => changeDate(-1)} className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-colors shadow-sm">
                <ChevronLeft size={20} />
            </button>
            
            <h2 className="text-2xl font-black capitalize text-gray-800 min-w-[180px] text-center tracking-tight">
            {viewMode === 'month' 
                ? format(currentDate, "LLLL yyyy", { locale: ru }) 
                : format(currentDate, "yyyy 'год'")}
            </h2>
            
            <button onClick={() => changeDate(1)} className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-colors shadow-sm">
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
            key={viewMode + currentDate.toISOString()} // Перезапуск анимации при смене вида или даты
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
          {viewMode === 'month' ? <MonthView /> : <YearView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;