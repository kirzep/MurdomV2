// app/dashboard/calendar/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Cat, Role, TreatmentType } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import { generateVaccinationEvents, CalendarEvent } from '@/lib/calendarHelper';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import ConfirmVaccinationModal from './ConfirmVaccinationModal';
import CalendarView from './CalendarView';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const canEdit = useMemo(() => {
    if (!session?.user) return false;
    return session.user.role !== Role.VOLUNTEER;
  }, [session]);

  const fetchCats = async () => {
    // Не сбрасываем isLoading в true при повторной загрузке, чтобы интерфейс не "мигал"
    if (cats.length === 0) setIsLoading(true);
    
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
            vaccinationStage: selectedEvent.stage === 'annual' ? 'revaccination' : selectedEvent.stage,
            catId: selectedEvent.catId
        };

        const res = await fetch(`/api/cats/${selectedEvent.catId}/treatments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error('Не удалось добавить запись о вакцинации');
        }
        
        await fetchCats(); // Обновляем данные, чтобы событие исчезло или обновилось
        setSelectedEvent(null); // Закрываем модалку

    } catch (error) {
        console.error(error);
        alert((error as Error).message);
    } finally {
        setIsConfirming(false);
    }
  };

  if (isLoading || status === 'loading') {
    return <div className="h-screen flex justify-center items-center bg-brand-background"><Spinner /></div>;
  }
  
  // Находим процедуры для выбранного кота, чтобы передать их в модалку для автозаполнения
  const selectedCatTreatments = selectedEvent 
    ? cats.find(c => c.id === selectedEvent.catId)?.treatments || []
    : [];

  return (
    <>
        <ConfirmVaccinationModal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onConfirm={handleConfirmVaccination}
            event={selectedEvent}
            catTreatments={selectedCatTreatments}
            isLoading={isConfirming}
        />

        <div className="min-h-screen p-4 sm:p-8 pb-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="max-w-[1400px] mx-auto space-y-6"
            >
                {/* Кнопка назад */}
                <div className="flex items-center">
                     <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-white/60 backdrop-blur-md border border-white text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md shadow-sm group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Вернуться в архив</span>
                    </Link>
                </div>
                
                {/* Заголовок */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">Календарь событий</h1>
                    <p className="text-gray-500 font-medium">Планирование вакцинаций и процедур</p>
                </div>
                
                {/* Основной компонент календаря */}
                <CalendarView 
                    events={allEvents} 
                    onConfirmClick={handleConfirmClick} 
                    canEdit={canEdit} 
                />
            </motion.div>
        </div>
    </>
  );
}