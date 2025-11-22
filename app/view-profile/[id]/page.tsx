// app/view-profile/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Role } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import { Shield, ArrowLeft, BadgeCheck, User as UserIcon, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const roleConfig: Record<Role, { label: string; color: string; border: string; icon: string }> = {
    [Role.DEVELOPER]: { label: 'Разработчик', color: 'text-violet-600 bg-violet-50', border: 'border-violet-200', icon: '⚡' },
    [Role.MEDICAL_STAFF]: { label: 'Мед. персонал', color: 'text-rose-600 bg-rose-50', border: 'border-rose-200', icon: '🩺' },
    [Role.TRUSTED_PERSON]: { label: 'Доверенное лицо', color: 'text-blue-600 bg-blue-50', border: 'border-blue-200', icon: '🛡️' },
    [Role.VOLUNTEER]: { label: 'Волонтёр', color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-200', icon: '🌱' },
};

export default function UserProfilePage() {
    const { id } = useParams();
    const { status: authStatus } = useSession();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    useEffect(() => {
        // Мы не редиректим сразу, если не авторизован, так как middleware уже это делает.
        // Но проверка статуса полезна для показа спиннера.
        if (authStatus === 'authenticated' && id) {
            const fetchUser = async () => {
                try {
                    const res = await fetch(`/api/get-user-profile?id=${id}`);
                    if (!res.ok) throw new Error('User not found');
                    const data = await res.json();
                    setUser(data);
                } catch (error) {
                    console.error(error);
                    // Можно добавить редирект или показать ошибку
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        }
    }, [id, authStatus]);

    if (isLoading || authStatus === 'loading') {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <UserIcon size={64} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-700">Пользователь не найден</h2>
                <Link href="/staff" className="mt-4 text-brand-primary hover:underline">Вернуться к списку</Link>
            </div>
        );
    }
    
    const avatarSrc = user.image 
      ? `${appUrl}${user.image}` 
      : `https://placehold.co/256x256/e2e8f0/64748b?text=${user.name.charAt(0)}`;

    const roleInfo = roleConfig[user.role];

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center justify-center relative">
            {/* Фон страницы уже задан глобально, но можно добавить декоративный элемент */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
                 <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="w-full max-w-2xl relative z-10"
            >
                 {/* Кнопка назад */}
                 <div className="mb-6">
                     <Link href="/staff" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-white/60 backdrop-blur-md border border-white text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md shadow-sm group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Назад к команде</span>
                    </Link>
                </div>

                {/* Карточка */}
                <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] overflow-hidden">
                    
                    {/* Верхняя часть с фоном */}
                    <div className="h-32 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 relative">
                        {/* Декоративные круги */}
                        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-white/40 rounded-full blur-2xl" />
                    </div>

                    <div className="px-8 pb-10 text-center relative">
                        {/* Аватар (сдвинут вверх) */}
                        <div className="-mt-16 mb-6 relative inline-block">
                            <div className="p-1.5 bg-white rounded-full shadow-xl">
                                <img 
                                    src={avatarSrc}
                                    alt={`Аватар ${user.name}`}
                                    className="w-32 h-32 rounded-full object-cover border border-gray-100"
                                />
                            </div>
                            {/* Иконка роли на аватаре */}
                            <div className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-lg border border-gray-100 text-xl" title={roleInfo.label}>
                                {roleInfo.icon}
                            </div>
                        </div>

                        {/* Имя и бейдж */}
                        <div className="flex flex-col items-center gap-2 mb-8">
                            <div className="flex items-center gap-2 justify-center">
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">{user.name}</h1>
                                {user.role === Role.DEVELOPER && (
                                    <BadgeCheck size={28} className="text-violet-500" />
                                )}
                            </div>
                            
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm text-xs font-bold uppercase tracking-wider ${roleInfo.color} ${roleInfo.border}`}>
                                <Shield size={14} />
                                <span>{roleInfo.label}</span>
                            </div>
                        </div>

                        {/* Информация (Сетка) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-semibold text-gray-700 truncate">{user.email || 'Скрыт'}</p>
                                </div>
                            </div>

                            {/* ID (только для красоты и админов) */}
                            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                                    <UserIcon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">User ID</p>
                                    <p className="text-sm font-mono text-gray-600 truncate">{user.id.slice(0, 8)}...</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}