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

// --- Компоненты-хелперы вынесены за пределы основного компонента для оптимизации ---

const EventRow: React.FC<Readonly<{ event: CalendarEvent; onConfirmClick: (event: CalendarEvent) => void; canEdit: boolean }>> = ({ event, onConfirmClick, canEdit }) => {
    const avatarSrc = event.catAvatarUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${event.catAvatarUrl}`
        : `https://placehold.co/32x32/e2e8f0/64748b?text=${event.catName.charAt(0)}`;
    
    let colorClasses = "border-l-4 border-sky-300";
    if (event.isProjected) {
        if (event.isOverdue) colorClasses = "border-l-4 border-red-400";
        else if (event.isUpcoming) colorClasses = "border-l-4 border-amber-400";
        else colorClasses = "border-l-4 border-gray-300";
    }

    return (
        <div className={`flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${colorClasses}`}>
            <div className="font-semibold text-center w-8 text-gray-600 flex-shrink-0">
                <p className="text-sm">{format(event.date, 'E', {locale: ru})}</p>
                <p className="text-lg -mt-1">{format(event.date, 'd')}</p>
            </div>
             <Link href={`/dashboard/cat/${event.catId}`} className="flex items-center gap-3 flex-grow min-w-0">
                <img src={avatarSrc} alt={event.catName} className="w-9 h-9 rounded-full" />
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{event.catName}</p>
                    <p className="text-xs text-gray-500">{event.stageText}</p>
                </div>
            </Link>
            {canEdit && event.canConfirmVaccination && (
                <button
                    onClick={() => onConfirmClick(event)}
                    className="flex-shrink-0 w-8 h-8 bg-green-200 text-green-800 rounded-full flex items-center justify-center hover:bg-green-300 transition-colors ml-2"
                    title="Отметить как выполненную"
                >
                    <Check size={16} />
                </button>
            )}
        </div>
    );
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onConfirmClick, canEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('year');

  const changeDate = (amount: number) => {
    setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, amount) : addMonths(prev, amount * 12));
  };

  const getSortPriority = (event: CalendarEvent) => {
    if (event.isOverdue) return 1;
    if (event.isUpcoming) return 2;
    return 3;
  };

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startingDayIndex = (getDay(monthStart) + 6) % 7;

    return (
      <div className="hidden md:grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center font-semibold text-xs text-gray-500 py-2 bg-gray-50">{day}</div>
        ))}
        {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-cell-${i}`} className="bg-gray-50" />)}
        {daysInMonth.map(day => {
          const dayEvents = events.filter(e => isSameDay(e.date, day));
          return (
            <div key={day.toISOString()} className={`p-2 bg-white ${!isSameMonth(day, currentDate) && 'bg-gray-50'}`}>
              <time dateTime={format(day, "yyyy-MM-dd")} className={`text-xs font-semibold ${isToday(day) ? 'text-brand-primary' : 'text-gray-600'}`}>
                {format(day, 'd')}
              </time>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map(event => <CalendarEventCard key={event.catId + event.stage + event.date.toISOString()} event={event} onConfirmClick={onConfirmClick} canEdit={canEdit} />)}
                {dayEvents.length > 3 && <p className="text-xs text-gray-400 mt-1">+ {dayEvents.length - 3} еще</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const MobileAndYearView = () => {
    const months = eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) });
    return (
      <div className="space-y-8">
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
            <section key={format(month, 'yyyy-MM')}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                {format(month, 'LLLL', { locale: ru })}
              </h3>
              <div className="space-y-3">
                {monthEvents.map(event => <EventRow key={event.catId + event.stage + event.date.toISOString()} event={event} onConfirmClick={onConfirmClick} canEdit={canEdit}/>)}
              </div>
            </section>
          );
        })}
      </div>
    );
  };
  
  return (
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
          {viewMode === 'month' ? format(currentDate, "LLLL yyyy 'г.'", { locale: ru }) : format(currentDate, "yyyy 'год'")}
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
        <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {viewMode === 'month' ? <MonthView /> : <MobileAndYearView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;