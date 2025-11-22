// app/dashboard/calendar/ConfirmVaccinationModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '@/lib/calendarHelper';
import { Treatment, TreatmentType } from '@/types';
import { Syringe, X, Check, Calendar, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface ConfirmVaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productName: string) => void;
  event: CalendarEvent | null;
  catTreatments: Treatment[];
  isLoading: boolean;
}

const ConfirmVaccinationModal: React.FC<ConfirmVaccinationModalProps> = ({ isOpen, onClose, onConfirm, event, catTreatments, isLoading }) => {
  const [productName, setProductName] = useState('');

  // Автозаполнение последним использованным препаратом
  useEffect(() => {
    if (event && isOpen) {
      const lastVaccination = catTreatments
        .filter(t => t.type === TreatmentType.VACCINATION)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      setProductName(lastVaccination?.productName || '');
    }
  }, [event, catTreatments, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName.trim()) {
      onConfirm(productName.trim());
    }
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
                relative w-full max-w-sm overflow-hidden
                bg-white/95 backdrop-blur-2xl
                rounded-[2rem] shadow-2xl border border-white/60
            "
          >
            {/* Хедер с информацией о котике */}
            <div className="px-6 py-6 pb-10 bg-indigo-50/80 border-b border-indigo-100">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/60 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800 z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center relative z-0">
                    <div className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center shadow-sm border-2 border-white bg-indigo-100 text-indigo-500">
                        <Syringe size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Подтверждение</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Вакцинация для <span className="font-bold text-brand-primary">{event.catName}</span>
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-sm text-xs font-bold text-indigo-600">
                        <Calendar size={12} />
                        <span>{format(new Date(), 'd MMMM yyyy', { locale: ru })}</span>
                    </div>
                </div>
            </div>

            {/* Форма (-mt-6 чтобы наехать на хедер) */}
            <div className="px-6 pb-6 -mt-6 bg-white rounded-t-[2rem] relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <form onSubmit={handleSubmit} className="space-y-6 pt-8">
                    
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-600">
                        <p className="font-medium mb-1 text-gray-800">Этап:</p>
                        <p>{event.stageText}</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Препарат</label>
                        <div className="relative group">
                            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                            <input 
                                autoFocus
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Например: Nobivac Tricat"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !productName.trim()}
                        className="
                            w-full py-4 rounded-2xl
                            bg-brand-primary text-white font-bold text-lg
                            shadow-lg shadow-brand-primary/20
                            hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5
                            active:scale-[0.98] active:shadow-sm
                            transition-all duration-200 flex items-center justify-center gap-2
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
                        "
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <Check size={20} strokeWidth={3} />
                                <span>Вакцинировать</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmVaccinationModal;