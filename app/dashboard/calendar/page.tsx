// app/dashboard/calendar/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Cat, Role, TreatmentType } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import { generateVaccinationEvents, CalendarEvent } from '@/lib/calendarHelper';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, isSameMonth, isSameDay, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, ListChecks, Check } from 'lucide-react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import ConfirmVaccinationModal from './ConfirmVaccinationModal';
import CalendarEventCard from './CalendarEventCard';

// Компоненты вынесены за пределы основного компонента страницы для оптимизации
const MonthView = ({ currentDate, allEvents, onConfirmClick, canEdit }: { currentDate: Date, allEvents: CalendarEvent[], onConfirmClick: (event: CalendarEvent) => void, canEdit: boolean }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
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
                        <div key={day.toISOString()} className={`p-2 bg-white ${!isSameMonth(day, currentDate) && 'bg-gray-50'}`}>
                            <time dateTime={format(day, "yyyy-MM-dd")} className={`text-xs font-semibold ${isToday(day) ? 'text-brand-primary' : 'text-gray-600'}`}>
                                {format(day, 'd')}
                            </time>
                            <div className="mt-1 space-y-1">
                                {events.map(event => <CalendarEventCard key={event.catId + event.stage + event.date.toISOString()} event={event} onConfirmClick={onConfirmClick} canEdit={canEdit} />)}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="block md:hidden space-y-3">
                {monthEvents.length > 0
                    ? monthEvents.map(event => <EventRow key={event.catId + event.stage + event.date.toISOString()} event={event} onConfirmClick={onConfirmClick} canEdit={canEdit} />)
                    : <p className="text-center text-gray-500 py-8">В этом месяце событий нет.</p>
                }
            </div>
        </>
    );
};

const YearView = ({ currentDate, allEvents, onConfirmClick, canEdit }: { currentDate: Date, allEvents: CalendarEvent[], onConfirmClick: (event: CalendarEvent) => void, canEdit: boolean }) => {
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
                            {monthEvents.map(event => <EventRow key={event.catId + event.stage + event.date.toISOString()} event={event} onConfirmClick={onConfirmClick} canEdit={canEdit}/>)}
                        </div>
                    </section>
                )
            })}
        </div>
    );
};

const EventRow: React.FC<{ event: CalendarEvent; onConfirmClick: (event: CalendarEvent) => void; canEdit: boolean }> = ({ event, onConfirmClick, canEdit }) => {
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
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('year');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const canEdit = useMemo(() => {
    if (!session?.user) return false;
    return session.user.role !== Role.VOLUNTEER;
  }, [session]);

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
  
  useEffect(() => {
    fetchCats();
  }, []);

  const allEvents = useMemo(() => generateVaccinationEvents(cats), [cats]);

  const changeDate = (amount: number) => {
    setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, amount) : addMonths(prev, amount * 12));
  };
  
  const handleConfirmClick = (event: CalendarEvent) => {
      setSelectedEvent(event);
  };
  
  const handleConfirmVaccination = async (productName: string) => {
    if (!selectedEvent) return;
    setIsConfirming(true);
    try {
        const body = {
            type: TreatmentType.VACCINATION,
            date: new Date().toISOString(),
            productName,
            vaccinationStage: selectedEvent.stage === 'annual' ? 'revaccination' : selectedEvent.stage
        };

        const res = await fetch(`/api/cats/${selectedEvent.catId}/treatments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error('Не удалось добавить запись о вакцинации');
        }
        
        await fetchCats();
        setSelectedEvent(null);

    } catch (error) {
        console.error(error);
        alert((error as Error).message);
    } finally {
        setIsConfirming(false);
    }
  };

  if (isLoading || status === 'loading') {
    return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
  }
  
  return (
    <>
    <ConfirmVaccinationModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onConfirm={handleConfirmVaccination}
        event={selectedEvent}
        catTreatments={cats.find(c => c.id === selectedEvent?.catId)?.treatments || []}
        isLoading={isConfirming}
    />
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
                <motion.div key={viewMode} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    {viewMode === 'month' ? <MonthView currentDate={currentDate} allEvents={allEvents} onConfirmClick={handleConfirmClick} canEdit={canEdit} /> : <YearView currentDate={currentDate} allEvents={allEvents} onConfirmClick={handleConfirmClick} canEdit={canEdit} />}
                </motion.div>
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
    </>
  );
}