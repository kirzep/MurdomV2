// app/dashboard/cat/[id]/EditCatModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Cat, CatStatus } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, Calendar, Save, Loader2, Heart, Home, CloudRain } from 'lucide-react';

interface EditCatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatUpdated: () => void;
  cat: Cat;
}

// Конфигурация для кнопок статуса
const STATUS_OPTIONS: { value: CatStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { 
        value: 'В приюте', 
        label: 'В приюте', 
        icon: <Home size={20} />, 
        color: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
    },
    { 
        value: 'Дома', 
        label: 'Дома', 
        icon: <Heart size={20} />, 
        color: 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
    },
    { 
        value: 'Умерли', 
        label: 'На радуге', 
        icon: <CloudRain size={20} />, 
        color: 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100' 
    }
];

const EditCatModal: React.FC<EditCatModalProps> = ({ isOpen, onClose, onCatUpdated, cat }) => {
  const [name, setName] = useState(cat.name);
  const [arrivalDate, setArrivalDate] = useState(cat.arrivalDate ? cat.arrivalDate.split('T')[0] : '');
  const [birthYear, setBirthYear] = useState(cat.birthYear ? cat.birthYear.toString() : '');
  const [status, setStatus] = useState<CatStatus>(cat.status);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  // Сброс и инициализация при открытии
  useEffect(() => {
    if (isOpen) {
        setName(cat.name);
        setArrivalDate(cat.arrivalDate ? cat.arrivalDate.split('T')[0] : '');
        setBirthYear(cat.birthYear ? cat.birthYear.toString() : '');
        setStatus(cat.status);
        setAvatarFile(null);
        
        // Устанавливаем начальный предпросмотр из текущего аватара
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
        if (cat.avatarUrl) {
            setPreviewUrl(cat.avatarUrl.startsWith('data:') ? cat.avatarUrl : `${appUrl}${cat.avatarUrl}`);
        } else {
            setPreviewUrl(null);
        }
    }
  }, [isOpen, cat]);

  // Обработка выбора файла для превью
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setAvatarFile(file);
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
      }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedData: Partial<Cat> & { newAvatarPath?: string } = {
        name,
        arrivalDate: arrivalDate ? new Date(arrivalDate).toISOString() : null,
        birthYear: birthYear ? parseInt(birthYear) : null,
        status: status,
      };

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error('Ошибка загрузки аватара');
        updatedData.newAvatarPath = uploadData.filePath;
      }
      
      await fetch(`/api/cats/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      onCatUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            relative w-full max-w-lg overflow-hidden
            bg-white/90 backdrop-blur-2xl
            rounded-[2.5rem] shadow-2xl border border-white/60
            flex flex-col max-h-[90vh]
        "
      >
        {/* Шапка с кнопкой закрытия */}
        <div className="absolute top-4 right-4 z-20">
            <button 
                onClick={onClose}
                className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800"
            >
                <X size={20} />
            </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar">
            <div className="p-8 pb-32"> {/* pb-32 чтобы оставить место для floating кнопки */}
                
                {/* 1. Блок Аватара */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <User size={48} />
                                </div>
                            )}
                        </div>
                        
                        {/* Оверлей загрузки */}
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={24} />
                        </div>

                        {/* Скрытый инпут */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Нажмите, чтобы изменить фото</p>
                </div>

                {/* 2. Основная форма */}
                <div className="space-y-6">
                    {/* Имя */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Имя котика</label>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 bg-white/60 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-xl text-gray-800 text-center"
                            placeholder="Введите имя..."
                        />
                    </div>

                    {/* Статус (Кнопки) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Текущий статус</label>
                        <div className="grid grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value)}
                                    className={`
                                        flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200
                                        ${status === option.value 
                                            ? `bg-white border-current shadow-md scale-[1.02] ${option.color.replace('bg-', 'text-').replace('border-', 'border-')}` // Активный
                                            : 'bg-white/40 border-transparent hover:bg-white/80 text-gray-400 grayscale' // Неактивный
                                        }
                                    `}
                                >
                                    <div className={status === option.value ? '' : 'opacity-50'}>
                                        {option.icon}
                                    </div>
                                    <span className="text-[10px] font-bold">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Даты (2 колонки) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Год рождения</label>
                             <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="number"
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(e.target.value)}
                                    placeholder="2020"
                                    className="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/50 outline-none font-medium text-gray-700"
                                />
                             </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Дата поступления</label>
                             <input 
                                type="date"
                                value={arrivalDate}
                                onChange={(e) => setArrivalDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/50 outline-none font-medium text-gray-700"
                             />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Плавающий футер с кнопкой */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="
                    w-full py-4 rounded-2xl
                    bg-brand-primary text-white font-bold text-lg
                    shadow-xl shadow-brand-primary/25
                    hover:shadow-2xl hover:shadow-brand-primary/40 hover:-translate-y-1
                    active:scale-[0.98]
                    transition-all duration-300
                    flex items-center justify-center gap-2
                "
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={24} />
                ) : (
                    <>
                        <Save size={20} strokeWidth={2.5} />
                        <span>Сохранить изменения</span>
                    </>
                )}
            </button>
        </div>

      </motion.div>
    </div>
  );
};

export default EditCatModal;