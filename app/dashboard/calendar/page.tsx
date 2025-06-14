// kirzep/murdomv2/kirzep-MurdomV2-ba8d66fc10844c3cf5f7882245a466e99dd2f639/app/dashboard/calendar/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Cat } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import { generateVaccinationEvents, CalendarEvent } from '@/lib/calendarHelper';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, getYear, addYears, subYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, List } from 'lucide-react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// === ИСПРАВЛЕНИЕ: Переработанный компонент события для мобильных и десктопа ===
const EventEntry: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const avatarSrc = event.catAvatarUrl
    ? `${appUrl}${event.catAvatarUrl}`
    : `https://placehold.co/24x24/e2e8f0/64748b?text=${event.catName.charAt(0)}`;
    
  let colorClasses = 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200/80';
  if (event.isProjected) {
    if (event.isOverdue) colorClasses = 'bg-red-200/80 text-red-900 hover:bg-red-200';
    else if (event.isUpcoming) colorClasses = 'bg-yellow-200/80 text-yellow-900 hover:bg-yellow-200';
    else colorClasses = 'bg-gray-200/80 text-gray-700 hover:bg-gray-300/80';
  }

  return (
    <motion.div layout variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <Link
            href={`/dashboard/cat/${event.catId}`}
            title={`${event.catName}: ${event.stageText}`}
            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium w-full transition-colors ${colorClasses}`}
        >
            <img src={avatarSrc} alt={event.catName} className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white/50" />
            <div className="flex-grow min-w-0">
                <p className="truncate font-semibold">{event.catName}</p>
                 {/* В мобильном виде (в списке) показываем стадию под именем */}
                <p className="truncate text-gray-600 sm:hidden">{event.stageText}</p>
            </div>
            {event.isProjected && <span className="font-bold text-lg" title="Прогнозируемое событие">!</span>}
        </Link>
    </motion.div>
  );
};


export default function CalendarPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  // ... (useEffect для загрузки данных остается без изменений) ...
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await fetch('/api/cats');
        const data = await response.json();
        setCats(data);
      } catch (error) { console.error('Ошибка при загрузке кошек:', error); } 
      finally { setIsLoading(false); }
    };
    fetchCats();
  }, []);

  const allEvents = useMemo(() => generateVaccinationEvents(cats).sort((a, b) => a.date.getTime() - b.date.getTime()), [cats]);

  const changeDate = (amount: number) => {
      if (viewMode === 'month') setCurrentDate(addMonths(currentDate, amount));
      else setCurrentDate(addYears(currentDate, amount));
  };
  
  const currentYear = getYear(currentDate);

  // === КОМПОНЕНТЫ ДЛЯ РАЗНЫХ ВИДОВ ===

  const MonthViewGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startingDayIndex = (getDay(monthStart) + 6) % 7;

    const eventsByDate = useMemo(() => allEvents.reduce((acc, event) => {
        const dateKey = format(event.date, 'yyyy-MM-dd');
        (acc[dateKey] = acc[dateKey] || []).push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>), [allEvents]);

    return (
      // === WOW-ЭФФЕКТ: Анимация появления сетки ===
      <motion.div 
        key="month-grid"
        variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-7 gap-2"
      >
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => ( <div key={day} className="text-center font-bold text-brand-text-secondary pb-2 text-sm">{day}</div> ))}
        {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateKey] || [];
          return (
            <motion.div key={day.toString()} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.03 }} className="bg-brand-surface/60 backdrop-blur-sm border rounded-xl p-2 min-h-[140px] flex flex-col transition-shadow hover:shadow-lg">
              <time dateTime={dateKey} className={`font-bold ${isToday(day) ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>
                {format(day, 'd')}
              </time>
              <motion.div layout className="mt-2 space-y-1.5">
                  {dayEvents.map(event => <EventEntry key={`${event.catId}-${event.stage}-${event.date}`} event={event} />)}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const YearOrMobileViewList = () => {
    const eventsToDisplay = allEvents.filter(event => 
        viewMode === 'year' 
        ? getYear(event.date) === currentYear 
        : getYear(event.date) === getYear(currentDate) && format(event.date, 'M') === format(currentDate, 'M')
    );
    
    return (
        <motion.div key="year-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {eventsToDisplay.length > 0 ? eventsToDisplay.map((event, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <div className="flex items-center gap-4">
                        <div className="text-center w-16 flex-shrink-0 bg-brand-surface/60 backdrop-blur-sm p-2 rounded-lg">
                            <p className="font-bold text-xl text-brand-primary">{format(event.date, 'd')}</p>
                            <p className="text-sm text-brand-text-secondary capitalize">{format(event.date, 'MMM', {locale: ru})}</p>
                        </div>
                        <div className="flex-grow"><EventEntry event={event} /></div>
                    </div>
                </motion.div>
            )) : <p className="text-center text-brand-text-secondary py-10">В этом периоде событий нет.</p>}
        </motion.div>
    );
  };


  if (isLoading) {
    return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
  }
  
  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center flex-wrap gap-4">
             <Link href="/dashboard" className="flex items-center gap-2 text-brand-primary hover:underline font-semibold"><ArrowLeft size={18} />На главную</Link>
             <h1 className="text-3xl font-bold text-brand-text-primary text-center">Календарь</h1>
             <div className="bg-brand-surface/80 backdrop-blur-sm p-1 rounded-full flex shadow-sm">
                <Button variant={viewMode === 'month' ? 'primary' : 'secondary'} onClick={() => setViewMode('month')} className="px-3 py-1.5 !rounded-full"><Calendar size={20}/></Button>
                <Button variant={viewMode === 'year' ? 'primary' : 'secondary'} onClick={() => setViewMode('year')} className="px-3 py-1.5 !rounded-full"><List size={20}/></Button>
             </div>
        </header>
        
        <div className="flex items-center justify-between mb-4 p-3 bg-brand-surface/80 backdrop-blur-sm rounded-xl shadow-md">
          <Button variant="secondary" onClick={() => changeDate(-1)} className="!rounded-full h-10 w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
            <ChevronLeft size={20} /><span className="hidden sm:inline ml-1">Назад</span>
          </Button>
          <h2 className="text-xl font-bold capitalize text-brand-primary">
            {viewMode === 'month' ? format(currentDate, 'LLLL yyyy', { locale: ru }) : getYear(currentDate)}
          </h2>
          <Button variant="secondary" onClick={() => changeDate(1)} className="!rounded-full h-10 w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
            <span className="hidden sm:inline mr-1">Вперед</span><ChevronRight size={20} />
          </Button>
        </div>
        
        {/* === WOW-ЭФФЕКТ: Анимация переключения вида === */}
        <AnimatePresence mode="wait">
            <motion.div key={viewMode} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                {viewMode === 'month' && <div className="hidden sm:block"><MonthViewGrid /></div>}
                {viewMode === 'month' && <div className="block sm:hidden"><YearOrMobileViewList /></div>}
                {viewMode === 'year' && <YearOrMobileViewList />}
            </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}