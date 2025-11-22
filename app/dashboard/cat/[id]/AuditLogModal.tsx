// app/dashboard/cat/[id]/AuditLogModal.tsx
"use client";

import React from 'react';
import { User, AuditLog as AuditLogType } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, History, User as UserIcon, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: AuditLogType[];
    catCreator: User | null;
    catCreatedAt: string | null;
}

export default function AuditLogModal({ isOpen, onClose, logs, catCreator, catCreatedAt }: AuditLogModalProps) {
    if (!isOpen) return null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    // Функция для получения аватарки (чтобы не дублировать код)
    const getUserAvatar = (user: User | null | undefined) => {
        if (user?.image) {
            return user.image.startsWith('data:') ? user.image : `${appUrl}${user.image}`;
        }
        return null;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Фон */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                    />

                    {/* Окно */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="
                            relative w-full max-w-md max-h-[85vh] flex flex-col
                            bg-white/90 backdrop-blur-2xl
                            rounded-[2rem] shadow-2xl border border-white/60
                        "
                    >
                        {/* Шапка */}
                        <div className="px-6 py-5 border-b border-gray-100/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 leading-tight">Хронология</h3>
                                    <p className="text-xs text-gray-500 font-medium">История жизни в архиве</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Контент с прокруткой */}
                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                                
                                {/* 1. Последние изменения (сверху) */}
                                {logs && logs.length > 0 ? (
                                    logs.map((log, index) => {
                                        const avatar = getUserAvatar(log.user);
                                        return (
                                            <motion.div 
                                                key={log.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="relative"
                                            >
                                                {/* Точка на линии */}
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-brand-primary ring-4 ring-white" />
                                                
                                                <div className="flex items-start gap-3">
                                                    {/* Аватарка автора изменения */}
                                                    <div className="shrink-0">
                                                        {avatar ? (
                                                            <img src={avatar} alt={log.user.name} className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-white text-gray-400">
                                                                <UserIcon size={14} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="bg-gray-50/80 p-3 rounded-2xl rounded-tl-none text-sm w-full border border-gray-100">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <span className="font-bold text-gray-800">{log.user.name}</span>
                                                            <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ru })}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mt-1 leading-relaxed">
                                                            {log.change}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-gray-400 text-sm italic relative">
                                        <div className="absolute -left-[21px] top-1/2 w-3 h-3 rounded-full bg-gray-200 ring-4 ring-white" />
                                        Изменений пока не было
                                    </div>
                                )}

                                {/* 2. Создание записи (в самом низу, как начало истории) */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative pt-4 opacity-75"
                                >
                                     {/* Точка на линии (зеленая - начало) */}
                                    <div className="absolute -left-[23px] top-5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center ring-4 ring-white">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>

                                    <div className="flex items-center gap-3">
                                         {/* Аватарка создателя */}
                                         <div className="shrink-0">
                                            {getUserAvatar(catCreator) ? (
                                                <img src={getUserAvatar(catCreator)!} alt={catCreator?.name} className="w-8 h-8 rounded-full object-cover border border-white shadow-sm grayscale" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-white text-gray-400">
                                                    <UserIcon size={14} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            <p>
                                                <span className="font-bold text-gray-700">{catCreator?.name || 'Неизвестный'}</span> создал карточку
                                            </p>
                                            <div className="flex items-center gap-1 mt-0.5 opacity-80">
                                                <Calendar size={10} />
                                                <span>
                                                    {catCreatedAt ? format(new Date(catCreatedAt), 'd MMMM yyyy в HH:mm', { locale: ru }) : 'Дата неизвестна'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}