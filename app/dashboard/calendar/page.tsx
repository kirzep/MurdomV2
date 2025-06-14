// app/dashboard/calendar/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Cat } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import { generateVaccinationEvents, CalendarEvent } from '@/lib/calendarHelper';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, getYear, isSameMonth, isSameDay, startOfYear, endOfYear, eachMonthOfInterval, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, ListChecks } from 'lucide-react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Компонент для отдельного события в сетке месяца (для ПК)
const EventPill: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    let colorClasses = "bg-sky-100 text-sky-800 hover:bg-sky-200";
    if (event.isProjected) {
      if (event.isOverdue) colorClasses = "bg-red-100 text-red-800 hover:bg-red-200";
      else if (event.isUpcoming) colorClasses = "bg-amber-100 text-amber-800 hover:bg-amber-200";
      else colorClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  
    return (
      <Link href={`/dashboard/cat/${event.catId}`} title={`${event.catName}: ${event.stageText}`}>
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${colorClasses}`}>
          <span className="truncate">{event.catName}</span>
          {event.isProjected && <span className="font-bold" title="Прогнозируемое событие">!</span>}
        </div>
      </Link>
    );
};

// Компонент для строки события в списке (для мобильных и годового вида)
const EventRow: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    // --- ИСПРАВЛЕНИЕ ЛОГИКИ АВАТАРА ---
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    let avatarSrc: string;
    if (event.catAvatarUrl) {
      if (event.catAvatarUrl.startsWith('data:')) {
        avatarSrc = event.catAvatarUrl;
      } else {
        avatarSrc = `${appUrl}${event.catAvatarUrl}`;
      }
    } else {
      avatarSrc = `https://placehold.co/32x32/e2e8f0/64748b?text=${event.catName.charAt(0)}`;
    }
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
    
    let colorClasses = "border-l-4 border-sky-300";
    if (event.isProjected) {
        if (event.isOverdue) colorClasses = "border-l-4 border-red-400";
        else if (event.isUpcoming) colorClasses = "border-l-4 border-amber-400";
        else colorClasses = "border-l-4 border-gray-300";
    }

    return (
        <Link href={`/dashboard/cat/${event.catId}`}
            className={`flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${colorClasses}`}>
            <div className="font-semibold text-center w-8 text-gray-600">
                <p className="text-sm">{format(event.date, 'E', {locale: ru})}</p>
                <p className="text-lg -mt-1">{format(event.date, 'd')}</p>
            </div>
            <img src={avatarSrc} alt={event.catName} className="w-9 h-9 rounded-full" />
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{event.catName}</p>
                <p className="text-xs text-gray-500">{event.stageText}</p>
            </div>
        </Link>
    )
}

// ... остальной код файла остается без изменений
// (здесь я его сократил для краткости, но вы должны использовать полную версию из предыдущего ответа)

// ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
export default function CalendarPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('year');

  useEffect(() => {
    const fetchCats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cats');
        const data = await response.json();
        setCats(data);
      } catch (error) { 
        console.error('Ошибка при загрузке кошек:', error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchCats();
  }, []);

  const allEvents = useMemo(() => generateVaccinationEvents(cats), [cats]);

  const changeDate = (amount: number) => {
    setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, amount) : addMonths(prev, amount * 12));
  };
  
  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startingDayIndex = (getDay(monthStart) + 6) % 7;
    const monthEvents = allEvents.filter(e => isSameMonth(e.date, currentDate));

    return (
        <>
            <div className="hidden md:grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-center font-semibold text-xs text-gray-500 py-2 bg-gray-50">{day}</div>
                ))}
                {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} className="bg-gray-50" />)}
                {daysInMonth.map(day => {
                    const events = allEvents.filter(e => isSameDay(e.date, day));
                    return (
                        <div key={day.toString()} className={`p-2 bg-white ${!isSameMonth(day, currentDate) && 'bg-gray-50'}`}>
                            <time dateTime={format(day, "yyyy-MM-dd")} className={`text-xs font-semibold ${isToday(day) ? 'text-brand-primary' : 'text-gray-600'}`}>
                                {format(day, 'd')}
                            </time>
                            <div className="mt-1 space-y-1">
                                {events.map(event => <EventPill key={event.catId + event.stage} event={event} />)}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="block md:hidden space-y-3">
                {monthEvents.length > 0 
                    ? monthEvents.map(event => <EventRow key={event.catId + event.stage + event.date} event={event} />)
                    : <p className="text-center text-gray-500 py-8">В этом месяце событий нет.</p>
                }
            </div>
        </>
    );
  };

  const YearView = () => {
    const months = eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) });
    return (
        <div className="space-y-8">
            {months.map(month => {
                const monthEvents = allEvents.filter(e => isSameMonth(e.date, month));
                if (monthEvents.length === 0) return null;

                return (
                    <section key={format(month, 'yyyy-MM')}>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                            {format(month, 'LLLL', {locale: ru})}
                        </h3>
                        <div className="space-y-3">
                            {monthEvents.map(event => <EventRow key={event.catId + event.stage} event={event} />)}
                        </div>
                    </section>
                )
            })}
        </div>
    );
  };


  if (isLoading) {
    return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-brand-background min-h-screen font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-screen-xl mx-auto">
        <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-brand-surface text-brand-text-primary hover:bg-brand-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary border border-brand-border">
                <ArrowLeft size={16} />
                Вернуться в архив
            </Link>
        </div>
        <header className="flex flex-wrap justify-between items-center gap-y-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Календарь событий</h1>
        </header>
        
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex justify-center mb-6">
                <div className="bg-gray-200 p-1 rounded-full flex">
                    <Button variant={viewMode === 'month' ? 'primary' : 'ghost'} onClick={() => setViewMode('month')} className="px-3 py-1 !rounded-full text-sm flex items-center gap-2">
                        <Calendar size={16} className="sm:mr-1" />
                        <span className="hidden sm:inline">Месяц</span>
                    </Button>
                    <Button variant={viewMode === 'year' ? 'primary' : 'ghost'} onClick={() => setViewMode('year')} className="px-3 py-1 !rounded-full text-sm flex items-center gap-2">
                        <ListChecks size={16} className="sm:mr-1" />
                        <span className="hidden sm:inline">Год</span>
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold capitalize text-gray-700">
                    {viewMode === 'month' ? format(currentDate, "LLLL 'г.'", { locale: ru }) : format(currentDate, "yyyy 'год'")}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => changeDate(-1)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => changeDate(1)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={viewMode} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    {viewMode === 'month' ? <MonthView/> : <YearView/>}
                </motion.div>
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}