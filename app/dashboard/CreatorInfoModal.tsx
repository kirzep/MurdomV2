// app/dashboard/CreatorInfoModal.tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { User, Role } from '@/types';
import { X, Mail, Shield, User as UserIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CreatorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: User | null | undefined;
}

// Хелпер для получения красивого названия роли и цвета
const getRoleInfo = (role: Role) => {
  switch (role) {
    case Role.DEVELOPER:
      return { label: 'Архитектор (Dev)', color: 'bg-violet-100 text-violet-600 border-violet-200', icon: '⚡' };
    case Role.MEDICAL_STAFF:
      return { label: 'Ветврач', color: 'bg-rose-100 text-rose-600 border-rose-200', icon: '🩺' };
    case Role.TRUSTED_PERSON:
      return { label: 'Куратор', color: 'bg-blue-100 text-blue-600 border-blue-200', icon: '🛡️' };
    case Role.VOLUNTEER:
    default:
      return { label: 'Волонтер', color: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: '🌱' };
  }
};

export default function CreatorInfoModal({ isOpen, onClose, creator }: CreatorInfoModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !creator) return null;

  const roleInfo = getRoleInfo(creator.role);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // Обработка аватарки
  let avatarSrc: string;
  if (creator.image) {
    avatarSrc = creator.image.startsWith('data:') ? creator.image : `${appUrl}${creator.image}`;
  } else {
    avatarSrc = `https://placehold.co/200x200/F3F4F6/6B7280?text=${creator.name.charAt(0)}`;
  }

  const handleCopyEmail = () => {
    if (creator.email) {
      navigator.clipboard.writeText(creator.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Затемненный фон */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />

      {/* Сама карточка */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="
            relative w-full max-w-sm overflow-hidden
            bg-white/90 backdrop-blur-2xl
            rounded-3xl shadow-2xl border border-white/60
        "
      >
        {/* Декоративный фон шапки */}
        <div className="h-24 bg-gradient-to-br from-brand-primary/20 via-brand-surface to-white relative overflow-hidden">
            <div className="absolute -right-4 -top-8 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
            <div className="absolute -left-4 top-4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/60 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800 z-10"
            >
                <X size={20} />
            </button>
        </div>

        {/* Контент (-mt-12 чтобы аватарка залезла на фон) */}
        <div className="px-6 pb-8 relative text-center -mt-12">
            {/* Аватар */}
            <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl p-1 bg-white shadow-lg rotate-3 transition-transform hover:rotate-0 duration-300">
                    <img 
                        src={avatarSrc} 
                        alt={creator.name} 
                        className="w-full h-full object-cover rounded-xl"
                    />
                </div>
                {/* Иконка роли на аватарке */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md text-lg border border-gray-100">
                    {roleInfo.icon}
                </div>
            </div>

            {/* Имя и роль */}
            <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-gray-800">
                    {creator.name}
                </h3>
                <div className={`
                    inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold border
                    ${roleInfo.color}
                `}>
                    <Shield size={12} />
                    <span>{roleInfo.label}</span>
                </div>
            </div>

            {/* Блок контактов */}
            <div className="mt-8 space-y-3">
                {/* Email (с кнопкой копирования) */}
                {creator.email ? (
                     <div 
                        onClick={handleCopyEmail}
                        className="
                            group flex items-center justify-between p-3 rounded-xl 
                            bg-gray-50 border border-gray-100 hover:border-brand-primary/30 hover:bg-brand-primary/5
                            cursor-pointer transition-all active:scale-[0.98]
                        "
                     >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 group-hover:text-brand-primary shadow-sm transition-colors">
                                <Mail size={16} />
                            </div>
                            <div className="text-left min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                <p className="text-sm font-medium text-gray-700 truncate">{creator.email}</p>
                            </div>
                        </div>
                        
                        <div className="text-gray-300 group-hover:text-brand-primary transition-colors pl-2">
                             {copied ? <Check size={18} /> : <Copy size={18} />}
                        </div>
                     </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Email скрыт</p>
                )}
            </div>

            {/* ID пользователя (для админов/дебага) - мелким шрифтом внизу */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                 <div className="flex items-center justify-center gap-1 text-[10px] text-gray-300 font-mono">
                    <UserIcon size={10} />
                    <span>ID: {creator.id}</span>
                 </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}