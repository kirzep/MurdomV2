// app/dashboard/calendar/CalendarView.tsx
"use client";

import { useState, useMemo } from "react";
import { CalendarEvent } from "@/lib/calendarHelper";
import { Cat } from "@/types";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, getYear, setYear, setMonth,
  isSameMonth, isSameDay, startOfYear, endOfYear, eachMonthOfInterval
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import CalendarEventCard from "./CalendarEventCard";

interface CalendarViewProps {
  allEvents: CalendarEvent[];
}

export default function CalendarView({ allEvents }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const today = new Date();

  // --- ЛОГИКА ДЛЯ ВИДА "МЕСЯЦ" ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = (getDay(monthStart) + 6) % 7; // Пн = 0

  const eventsByDate = useMemo(() => allEvents.reduce((acc, event) => {
    const dateKey = format(event.date, "yyyy-MM-dd");
    (acc[dateKey] = acc[dateKey] || []).push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>), [allEvents]);

  // --- ЛОГИКА ДЛЯ ВИДА "ГОД" ---
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const eventsByMonth = useMemo(() => allEvents.reduce((acc, event) => {
    const monthKey = format(event.date, "yyyy-MM");
    (acc[monthKey] = acc[monthKey] || []).push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>), [allEvents]);

  const changeDate = (amount: number) => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, amount));
    else setCurrentDate(addMonths(currentDate, amount * 12));
  };
  
  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter(event => event.isProjected && event.date >= today)
      .slice(0, 5);
  }, [allEvents, today]);

  // --- КОМПОНЕНТЫ VIEW ---
  
  const MiniCalendar = () => (
    <div className="p-4 bg-brand-surface rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft size={20}/></button>
            <h3 className="font-semibold text-sm">{format(currentDate, 'LLLL yyyy', {locale: ru})}</h3>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight size={20}/></button>
        </div>
        <div className="grid grid-cols-7 gap-y-2 mt-4 text-xs text-center">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="font-medium text-gray-400">{d}</div>)}
            {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map(day => {
                const isCurrent = isSameDay(day, currentDate);
                const isTodayDate = isSameDay(day, today);
                return (
                    <button key={day.toString()} onClick={() => setCurrentDate(day)}
                        className={`w-7 h-7 rounded-full transition-colors ${isCurrent ? 'bg-brand-primary text-white' : isTodayDate ? 'bg-indigo-100 text-brand-primary' : 'hover:bg-gray-100'}`}>
                        {format(day, 'd')}
                    </button>
                )
            })}
        </div>
    </div>
  )

  const MonthView = () => (
    <div className="grid grid-cols-7 auto-rows-[140px] gap-1">
      {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map(day => (
        <div key={day} className="text-xs font-semibold text-gray-400 p-2 border-b">{day}</div>
      ))}
      {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
      {daysInMonth.map(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        const dayEvents = eventsByDate[dateKey] || [];
        return (
          <div key={day.toString()} className={`p-2 border-t transition-colors ${isSameMonth(day, currentDate) ? '' : 'bg-gray-50'}`}>
            <time dateTime={dateKey} className={`text-xs font-semibold ${isToday(day) ? 'text-brand-primary' : 'text-gray-500'}`}>
              {format(day, 'd')}
            </time>
            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 3).map(event => <CalendarEventCard key={event.catId + event.stage} event={event} />)}
              {dayEvents.length > 3 && <p className="text-xs text-gray-400 mt-1">+ {dayEvents.length - 3} еще</p>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const YearView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {monthsInYear.map(month => {
            const monthKey = format(month, "yyyy-MM");
            const monthEvents = eventsByMonth[monthKey] || [];
            return (
                <div key={monthKey} className="p-4 bg-brand-surface rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                    <button onClick={() => { setViewMode('month'); setCurrentDate(month); }}
                        className="font-bold text-brand-primary mb-3 capitalize text-left w-full hover:underline">
                        {format(month, 'LLLL', {locale: ru})}
                    </button>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                        {monthEvents.length > 0 ? monthEvents.map(event => <CalendarEventCard key={event.catId + event.date} event={event}/>)
                        : <p className="text-xs text-gray-400 italic">Нет событий</p>}
                    </div>
                </div>
            )
        })}
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Левая панель */}
        <aside className="lg:col-span-1 space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-brand-text-primary">Календарь</h1>
                 <div className="bg-white p-1 rounded-full flex border">
                    <Button variant={viewMode === 'month' ? 'primary' : 'secondary'} onClick={() => setViewMode('month')} className="px-2 py-1 !rounded-full text-xs"><Calendar size={16}/></Button>
                    <Button variant={viewMode === 'year' ? 'primary' : 'secondary'} onClick={() => setViewMode('year')} className="px-2 py-1 !rounded-full text-xs"><List size={16}/></Button>
                 </div>
            </div>
            <MiniCalendar />
            <div>
                <h3 className="font-semibold mb-3">Ближайшие события</h3>
                <div className="space-y-2">
                    {upcomingEvents.length > 0 ? upcomingEvents.map(e => <CalendarEventCard key={e.catId + e.stage} event={e}/>)
                    : <p className="text-sm text-gray-500 italic">Нет ближайших событий.</p>}
                </div>
            </div>
        </aside>

        {/* Правая панель */}
        <main className="lg:col-span-3">
             <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-semibold capitalize text-brand-text-secondary">
                    {viewMode === 'month' ? format(currentDate, 'LLLL yyyy', { locale: ru }) : format(currentDate, 'yyyy год')}
                 </h2>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => changeDate(-1)} className="!rounded-full h-8 w-8 p-0"><ChevronLeft size={20} /></Button>
                    <Button variant="secondary" onClick={() => changeDate(1)} className="!rounded-full h-8 w-8 p-0"><ChevronRight size={20} /></Button>
                </div>
             </div>
             <AnimatePresence mode="wait">
                <motion.div key={viewMode} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    {viewMode === 'month' ? <MonthView/> : <YearView/>}
                </motion.div>
             </AnimatePresence>
        </main>
    </div>
  );
}