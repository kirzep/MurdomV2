// app/dashboard/AddCatModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { Cat } from '@/types';
import { generateAvatar } from '@/lib/utils';
import { X, Camera, Cat as CatIcon, Calendar, Sparkles } from 'lucide-react';
import Portal from '@/app/components/ui/Portal'; // Импортируем Портал

interface AddCatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatAdded: (newCat: Cat) => void;
}

const AddCatModal: React.FC<AddCatModalProps> = ({ isOpen, onClose, onCatAdded }) => {
  const [name, setName] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Блокируем скролл страницы при открытии окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setArrivalDate('');
    setBirthYear('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setError('');
    setIsLoading(false);
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAvatarFile(file);
          setAvatarPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Имя не может быть пустым.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      let avatarUrl = null;
      
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error('Ошибка загрузки аватара');
        avatarUrl = uploadData.filePath;
      } else {
        avatarUrl = generateAvatar(name);
      }

      const catData = {
        name,
        avatarUrl,
        arrivalDate: arrivalDate ? new Date(arrivalDate).toISOString() : null,
        birthYear: birthYear ? parseInt(birthYear) : null,
      };

      const response = await fetch('/api/cats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить кошку');
      }

      const newCat = await response.json();
      onCatAdded(newCat);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 h-[100dvh] w-screen">
            {/* Фон */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />

            {/* Окно */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="
                  relative w-full max-w-md overflow-hidden
                  bg-white/95 backdrop-blur-2xl
                  rounded-[2.5rem] shadow-2xl border border-white/60
                  max-h-[85vh] flex flex-col z-10
              "
            >
              {/* Хедер */}
              <div className="px-6 py-5 border-b border-gray-100/50 flex items-center justify-between shrink-0 bg-white/50">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Sparkles className="text-brand-primary" size={20} />
                      Новый житель
                  </h3>
                  <button 
                      onClick={handleClose}
                      className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                      <X size={20} />
                  </button>
              </div>

              {/* Контент с скроллом */}
              <div className="overflow-y-auto custom-scrollbar p-6 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Аватар */}
                      <div className="flex flex-col items-center">
                          <div className="relative group cursor-pointer">
                              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center">
                                  {avatarPreview ? (
                                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                      <CatIcon size={36} className="text-gray-300" />
                                  )}
                              </div>
                              
                              <label htmlFor="new-cat-avatar" className="absolute bottom-0 right-0 w-9 h-9 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-primary-hover shadow-md transition-transform hover:scale-110 border-2 border-white">
                                  <Camera size={16} />
                              </label>
                              <input id="new-cat-avatar" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Фотография</p>
                      </div>

                      {/* Поля */}
                      <div className="space-y-4">
                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Кличка</label>
                              <Input 
                                  value={name} 
                                  onChange={(e) => setName(e.target.value)} 
                                  placeholder="Мурзик" 
                                  required 
                                  // autoFocus убран для стабильности на мобильных
                                  className="text-lg font-bold text-center"
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Год рождения</label>
                                  <Input 
                                      type="number" 
                                      value={birthYear} 
                                      onChange={(e) => setBirthYear(e.target.value)} 
                                      placeholder="2023" 
                                  />
                              </div>
                              
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Прибыл</label>
                                  <div className="relative">
                                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                      <input 
                                          type="date"
                                          value={arrivalDate}
                                          onChange={(e) => setArrivalDate(e.target.value)}
                                          className="w-full pl-10 pr-3 py-3 bg-white border-2 border-transparent rounded-xl shadow-sm bg-gray-50/50 hover:bg-white focus:outline-none focus:bg-white focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium text-gray-900"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {error && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                              {error}
                          </div>
                      )}

                      <div className="pt-2">
                          <Button 
                              type="submit" 
                              isLoading={isLoading} 
                              className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-brand-primary/20"
                          >
                              Добавить в архив
                          </Button>
                      </div>
                  </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default AddCatModal;