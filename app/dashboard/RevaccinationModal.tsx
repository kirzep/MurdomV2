// app/dashboard/RevaccinationModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
// ДОБАВИЛ ChevronRight СЮДА
import { X, Syringe, Calendar, FileText, Check, Loader2, ChevronRight } from 'lucide-react';
import { Cat } from '@/types';
import { RevaccinationInfo } from '@/lib/revaccinationHelper';

interface RevaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cat: Cat;
  alertInfo: RevaccinationInfo;
  onUpdate: () => void;
}

export default function RevaccinationModal({ isOpen, onClose, cat, alertInfo, onUpdate }: RevaccinationModalProps) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [vaccineName, setVaccineName] = useState('Мультифел-4');
  
  // Стадия вакцинации: 'first' | 'second' | 'revaccination'
  const [stage, setStage] = useState('revaccination');

  // Защита от дурака: если пропсы не пришли, не рендерим (чтобы не было ошибки message of undefined)
  // Это также исправляет ошибку, если окно закрывается, а данные очищаются раньше времени
  const safeMessage = alertInfo?.message || '';

  useEffect(() => {
    if (!alertInfo) return;

    if (safeMessage.toLowerCase().includes('ежегодная')) {
        setStage('revaccination');
    } else if (safeMessage.toLowerCase().includes('ревакцинация')) {
        setStage('second');
    } else {
        setStage('revaccination'); 
    }
  }, [alertInfo, safeMessage]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/cats/${cat.id}/treatments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'VACCINATION',
                productName: vaccineName,
                date: new Date(date).toISOString(),
                notes: notes,
                catId: cat.id,
                vaccinationStage: stage
            })
        });

        if (res.ok) {
            onUpdate();
            onClose();
        } else {
            console.error('Ошибка при сохранении');
            alert('Не удалось сохранить данные.');
        }
    } catch (e) {
        console.error(e);
        alert('Ошибка сети.');
    } finally {
        setLoading(false);
    }
  };

  // Проверка перед рендером
  if (!isOpen || !cat || !alertInfo) return null;

  const isOverdue = alertInfo.isOverdue;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 px-4">
      {/* Фон */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
      />

      {/* Окно */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="
            relative w-full max-w-md overflow-hidden
            bg-white/95 backdrop-blur-2xl
            rounded-[2rem] shadow-2xl border border-white/60
        "
      >
        {/* Хедер */}
        <div className={`px-6 py-6 pb-10 ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/60 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800 z-10"
            >
                <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center relative z-0">
                <div className={`
                    w-16 h-16 rounded-2xl mb-3 flex items-center justify-center shadow-sm border-2 border-white
                    ${isOverdue ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}
                `}>
                    <Syringe size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Запись о вакцинации</h3>
                <p className="text-sm text-gray-600 mt-1 max-w-[80%]">
                    Подтвердите выполнение задачи для <span className="font-bold text-brand-primary">{cat.name}</span>
                </p>
            </div>
        </div>

        {/* Форма */}
        <div className="px-6 pb-6 -mt-6 bg-white rounded-t-[2rem] relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="space-y-5 pt-8">
                
                {/* Дата */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Дата процедуры</label>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                        <input 
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium text-gray-700"
                        />
                    </div>
                </div>

                {/* Препарат и Тип */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Препарат</label>
                        <div className="relative group">
                            <Syringe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                value={vaccineName}
                                onChange={(e) => setVaccineName(e.target.value)}
                                placeholder="Название вакцины"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Этап</label>
                        <div className="relative">
                            <select
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                            >
                                <option value="first">Первая вакцинация</option>
                                <option value="second">Вторая (через 21 день)</option>
                                <option value="revaccination">Ежегодная</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronRight className="rotate-90" size={16}/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Заметки */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Заметки</label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Серия, номер, ветклиника..."
                            rows={2}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Кнопка */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="
                    mt-8 w-full py-4 rounded-2xl
                    bg-brand-primary text-white font-bold text-lg
                    shadow-lg shadow-brand-primary/20
                    hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5
                    active:scale-[0.98] active:shadow-sm
                    transition-all duration-200 flex items-center justify-center gap-2
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
                "
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                ) : (
                    <>
                        <Check size={20} strokeWidth={3} />
                        <span>Выполнено</span>
                    </>
                )}
            </button>
        </div>
      </motion.div>
    </div>
  );
}